import { createClient } from "@/lib/supabase/server";
import type { Action, ActionStatus, DelayReason, DueDateHistory, Profile } from "@/types/database";
import type { CreateActionInput, DelayReasonInput, UpdateActionInput, ActionsQueryInput } from "@/lib/validations/action";
import type { ActionTab } from "@/components/actions/action-tabs";
export { WIP_LIMIT } from "./constants";

/**
 * Team member type for owner selection dropdown
 */
export type TeamMember = Pick<Profile, "id" | "full_name" | "email">;

export interface PaginatedActions {
  data: Action[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ActionsQueryWithTab extends ActionsQueryInput {
  tab?: ActionTab;
}

/**
 * Get paginated actions with filtering and sorting.
 * RLS policies handle user-based filtering (team members see own, PM sees all).
 *
 * Tab filtering:
 * - "active": Shows items with status = "on_target" OR "delayed"
 * - "backlog": Shows items with status = "backlog"
 */
export async function getActions(params: ActionsQueryWithTab): Promise<PaginatedActions> {
  const supabase = await createClient();
  const { status, sortBy, sortOrder, page, limit, tab } = params;

  let query = supabase.from("actions").select("*", { count: "exact" });

  // Apply tab filtering first (takes precedence)
  if (tab === "active") {
    query = query.in("status", ["on_target", "delayed"]);
  } else if (tab === "backlog") {
    query = query.eq("status", "backlog");
  }

  // Apply additional status filter within tab (only if not already filtered by tab)
  // This allows filtering within the active tab (e.g., show only delayed items)
  if (!tab && status && status !== "all") {
    query = query.eq("status", status);
  } else if (tab === "active" && status && status !== "all" && (status === "on_target" || status === "delayed")) {
    // Allow filtering within active tab
    query = query.eq("status", status);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch actions: ${error.message}`);
  }

  const total = count ?? 0;
  const pages = Math.ceil(total / limit);

  return {
    data: (data ?? []) as Action[],
    meta: {
      total,
      page,
      limit,
      pages,
    },
  };
}

/**
 * Get count of active items (on_target + delayed) for WIP limit check.
 */
export async function getActiveCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .in("status", ["on_target", "delayed"]);

  if (error) {
    throw new Error(`Failed to get active count: ${error.message}`);
  }

  return count ?? 0;
}

/**
 * Get counts for both tabs (active and backlog).
 */
export async function getTabCounts(): Promise<{ activeCount: number; backlogCount: number }> {
  const supabase = await createClient();

  // Get active count (on_target + delayed)
  const { count: activeCount, error: activeError } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .in("status", ["on_target", "delayed"]);

  if (activeError) {
    throw new Error(`Failed to get active count: ${activeError.message}`);
  }

  // Get backlog count
  const { count: backlogCount, error: backlogError } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .eq("status", "backlog");

  if (backlogError) {
    throw new Error(`Failed to get backlog count: ${backlogError.message}`);
  }

  return {
    activeCount: activeCount ?? 0,
    backlogCount: backlogCount ?? 0,
  };
}

/**
 * Get a single action by ID.
 * RLS policies ensure user can only access their own actions (unless PM).
 */
export async function getActionById(id: string): Promise<Action | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch action: ${error.message}`);
  }

  return data as Action;
}

/**
 * Create a new action.
 * - If owner_id is provided (PM assigning to team member), use that
 * - Otherwise, owner_id is set to the authenticated user
 * - If autoBacklog is true, the action is created with backlog status
 */
export async function createAction(input: CreateActionInput, autoBacklog = false): Promise<Action> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Use provided owner_id (PM assignment) or default to current user
  const ownerId = input.owner_id ?? user.id;

  const insertData = {
    description: input.description,
    due_date: input.due_date,
    notes: input.notes ?? null,
    owner_id: ownerId,
    status: (autoBacklog ? "backlog" : "on_target") as ActionStatus,
    client_visible: false,
    auto_flagged: false,
    completed_at: null,
  };

  const { data, error } = await supabase
    .from("actions")
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create action: ${error.message}`);
  }

  return data as Action;
}

/**
 * Update an existing action.
 * If due_date changes, creates a history entry.
 */
export async function updateAction(id: string, input: UpdateActionInput): Promise<Action> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Fetch current action to check due_date change
  const currentAction = await getActionById(id);
  if (!currentAction) {
    throw new Error("Action not found");
  }

  // Build update object
  const updateData: Partial<Action> = {};

  if (input.description !== undefined) {
    updateData.description = input.description;
  }
  if (input.due_date !== undefined) {
    updateData.due_date = input.due_date;
  }
  if (input.notes !== undefined) {
    updateData.notes = input.notes;
  }
  if (input.status !== undefined) {
    updateData.status = input.status;
    // Set completed_at timestamp when status changes to complete
    if (input.status === "complete") {
      updateData.completed_at = new Date().toISOString();
    } else if (currentAction.status === "complete") {
      // Clear completed_at if status changes from complete
      updateData.completed_at = null;
    }
  }
  // PM can reassign owner (Issue #23)
  if (input.owner_id !== undefined) {
    updateData.owner_id = input.owner_id;
  }

  // Update the action
  const { data, error } = await supabase
    .from("actions")
    .update(updateData as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update action: ${error.message}`);
  }

  // Create due date history entry if due_date changed
  if (input.due_date !== undefined && input.due_date !== currentAction.due_date) {
    await createDueDateHistory(id, currentAction.due_date, input.due_date, user.id);
  }

  return data as Action;
}

/**
 * Delete an action.
 * Cannot delete completed actions per PRD spec.
 */
export async function deleteAction(id: string): Promise<void> {
  const supabase = await createClient();

  // Check if action is completed
  const action = await getActionById(id);
  if (!action) {
    throw new Error("Action not found");
  }

  if (action.status === "complete") {
    throw new Error("Cannot delete a completed action");
  }

  const { error } = await supabase.from("actions").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete action: ${error.message}`);
  }
}

/**
 * Create a due date history entry.
 * Called when due_date is changed on an action.
 */
export async function createDueDateHistory(
  actionId: string,
  oldDueDate: string,
  newDueDate: string,
  changedBy: string
): Promise<DueDateHistory> {
  const supabase = await createClient();

  const insertData = {
    action_id: actionId,
    old_due_date: oldDueDate,
    new_due_date: newDueDate,
    changed_by: changedBy,
  };

  const { data, error } = await supabase
    .from("due_date_history")
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    // Log but don't fail the main operation
    console.error("Failed to create due date history:", error);
    throw new Error(`Failed to create due date history: ${error.message}`);
  }

  return data as DueDateHistory;
}

/**
 * Get due date history for an action.
 */
export async function getDueDateHistory(actionId: string): Promise<DueDateHistory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("due_date_history")
    .select("*")
    .eq("action_id", actionId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch due date history: ${error.message}`);
  }

  return (data ?? []) as DueDateHistory[];
}

/**
 * Create a delay reason record (M-03: Delay Categorization).
 * Called when an action's status changes to "delayed".
 */
/**
 * Get all active team members for owner selection.
 * Returns id, full_name, and email for dropdown display.
 */
export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch team members: ${error.message}`);
  }

  return (data ?? []) as TeamMember[];
}

/**
 * Get count of active items (on_target + delayed) for a specific user.
 * Used for WIP limit check when PM assigns action to team member.
 */
export async function getActiveCountForUser(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", userId)
    .in("status", ["on_target", "delayed"]);

  if (error) {
    throw new Error(`Failed to get active count for user: ${error.message}`);
  }

  return count ?? 0;
}

export async function createDelayReason(
  actionId: string,
  input: DelayReasonInput
): Promise<DelayReason> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  const insertData = {
    action_id: actionId,
    reason: input.reason,
    category: input.category ?? null,
    // AI categorization fields - set defaults for manual entry
    subcategory: null,
    confidence: null,
    ai_overridden: false,
    manual_category: input.category ?? null,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("delay_reasons")
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create delay reason: ${error.message}`);
  }

  return data as DelayReason;
}
