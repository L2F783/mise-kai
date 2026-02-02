import { createClient } from "@/lib/supabase/server";
import type { Action, ActionStatus, DueDateHistory } from "@/types/database";
import type { CreateActionInput, UpdateActionInput, ActionsQueryInput } from "@/lib/validations/action";

export interface PaginatedActions {
  data: Action[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Get paginated actions with filtering and sorting.
 * RLS policies handle user-based filtering (team members see own, PM sees all).
 */
export async function getActions(params: ActionsQueryInput): Promise<PaginatedActions> {
  const supabase = await createClient();
  const { status, sortBy, sortOrder, page, limit } = params;

  let query = supabase.from("actions").select("*", { count: "exact" });

  // Filter by status (unless 'all')
  if (status && status !== "all") {
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
 * The owner_id is automatically set to the authenticated user.
 */
export async function createAction(input: CreateActionInput): Promise<Action> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  const insertData = {
    description: input.description,
    due_date: input.due_date,
    notes: input.notes ?? null,
    owner_id: user.id,
    status: "on_target" as ActionStatus,
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
