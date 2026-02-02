"use client";

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Action, ActionStatus } from "@/types/database";
import type { CreateActionInput, DelayReasonInput, UpdateActionInput } from "@/lib/validations/action";
import type { ActionTab } from "@/components/actions/action-tabs";
import {
  createActionAction,
  updateActionAction,
  deleteActionAction,
} from "@/app/dashboard/actions/_actions";

export interface ActionsQueryParams {
  tab?: ActionTab;
  status?: ActionStatus | "all";
  sortBy?: "due_date" | "created_at" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedActions {
  data: Action[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const defaultParams: Required<Omit<ActionsQueryParams, "tab">> & { tab: ActionTab } = {
  tab: "active",
  status: "all",
  sortBy: "due_date",
  sortOrder: "asc",
  page: 1,
  limit: 20,
};

/**
 * Query key factory for actions
 */
export const actionsKeys = {
  all: ["actions"] as const,
  lists: () => [...actionsKeys.all, "list"] as const,
  list: (params: ActionsQueryParams) => [...actionsKeys.lists(), params] as const,
  infinite: (params: ActionsQueryParams) => [...actionsKeys.lists(), "infinite", params] as const,
  details: () => [...actionsKeys.all, "detail"] as const,
  detail: (id: string) => [...actionsKeys.details(), id] as const,
  counts: () => [...actionsKeys.all, "counts"] as const,
  statusCounts: () => [...actionsKeys.all, "statusCounts"] as const,
  teamMembers: () => ["teamMembers"] as const,
};

/**
 * Fetch actions from Supabase client-side
 */
async function fetchActions(params: ActionsQueryParams & { page: number; limit: number }): Promise<PaginatedActions> {
  const supabase = createClient();
  const { tab, status, sortBy = "due_date", sortOrder = "asc", page, limit } = params;

  let query = supabase.from("actions").select("*", { count: "exact" });

  // Apply tab filtering first (takes precedence)
  if (tab === "active") {
    query = query.in("status", ["on_target", "delayed"]);
  } else if (tab === "backlog") {
    query = query.eq("status", "backlog");
  }

  // Apply additional status filter within tab
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

export interface StatusCounts {
  on_target: number;
  delayed: number;
  complete: number;
  backlog: number;
  total: number;
}

/**
 * Fetch counts by each status
 */
async function fetchStatusCounts(): Promise<StatusCounts> {
  const supabase = createClient();

  // Fetch all counts in parallel
  const [onTargetResult, delayedResult, completeResult, backlogResult] = await Promise.all([
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "on_target"),
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "delayed"),
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "complete"),
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "backlog"),
  ]);

  if (onTargetResult.error) throw new Error(`Failed to get on_target count: ${onTargetResult.error.message}`);
  if (delayedResult.error) throw new Error(`Failed to get delayed count: ${delayedResult.error.message}`);
  if (completeResult.error) throw new Error(`Failed to get complete count: ${completeResult.error.message}`);
  if (backlogResult.error) throw new Error(`Failed to get backlog count: ${backlogResult.error.message}`);

  const on_target = onTargetResult.count ?? 0;
  const delayed = delayedResult.count ?? 0;
  const complete = completeResult.count ?? 0;
  const backlog = backlogResult.count ?? 0;

  return {
    on_target,
    delayed,
    complete,
    backlog,
    total: on_target + delayed + complete + backlog,
  };
}

/**
 * Fetch tab counts (active and backlog)
 */
async function fetchTabCounts(): Promise<{ activeCount: number; backlogCount: number }> {
  const supabase = createClient();

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
 * Hook to fetch and manage actions list
 */
export function useActions(params: ActionsQueryParams = {}) {
  const mergedParams = { ...defaultParams, ...params };

  return useQuery({
    queryKey: actionsKeys.list(mergedParams),
    queryFn: () => fetchActions(mergedParams),
  });
}

/**
 * Hook to fetch actions with infinite scroll support
 */
export function useActionsInfinite(params: Omit<ActionsQueryParams, "page"> = {}) {
  const mergedParams = { ...defaultParams, ...params };

  return useInfiniteQuery({
    queryKey: actionsKeys.infinite(mergedParams),
    queryFn: ({ pageParam = 1 }) =>
      fetchActions({ ...mergedParams, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.pages
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

/**
 * Hook to fetch tab counts
 */
export function useTabCounts() {
  return useQuery({
    queryKey: actionsKeys.counts(),
    queryFn: fetchTabCounts,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Team member type for owner selection dropdown
 */
export interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
}

/**
 * Fetch active team members for owner selection
 */
async function fetchTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient();

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
 * Hook to fetch active team members for owner selection (PM feature)
 */
export function useTeamMembers() {
  return useQuery({
    queryKey: actionsKeys.teamMembers(),
    queryFn: fetchTeamMembers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch counts by status
 */
export function useStatusCounts() {
  return useQuery({
    queryKey: actionsKeys.statusCounts(),
    queryFn: fetchStatusCounts,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single action by ID
 */
export function useAction(id: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: actionsKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("actions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(`Failed to fetch action: ${error.message}`);
      }

      return data as Action;
    },
    enabled: !!id,
  });
}

/**
 * Hook for creating a new action
 */
export function useCreateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateActionInput) => {
      const result = await createActionAction(input);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch all action queries
      queryClient.invalidateQueries({
        queryKey: actionsKeys.all,
        refetchType: 'all',
      });
    },
  });
}

/**
 * Hook for updating an action
 */
export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, delayReason }: { id: string; data: UpdateActionInput; delayReason?: DelayReasonInput }) => {
      const result = await updateActionAction(id, data, delayReason);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data!;
    },
    onSuccess: (data) => {
      // Update the specific action in cache
      queryClient.setQueryData(actionsKeys.detail(data.id), data);
      // Invalidate and refetch all action queries (including infinite) and counts
      // Using refetchType: 'all' ensures inactive queries are also refetched
      queryClient.invalidateQueries({
        queryKey: actionsKeys.all,
        refetchType: 'all',
      });
    },
  });
}

/**
 * Hook for deleting an action
 */
export function useDeleteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteActionAction(id);
      if (result.error) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: actionsKeys.detail(id) });
      // Invalidate and refetch all action queries
      queryClient.invalidateQueries({
        queryKey: actionsKeys.all,
        refetchType: 'all',
      });
    },
  });
}

/**
 * Hook to get optimistic update helpers
 */
export function useOptimisticActions() {
  const queryClient = useQueryClient();

  return {
    // Optimistically update a single action
    optimisticUpdate: (id: string, updates: Partial<Action>) => {
      queryClient.setQueryData<Action | null>(actionsKeys.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...updates };
      });
    },

    // Roll back optimistic update
    rollback: (id: string) => {
      queryClient.invalidateQueries({ queryKey: actionsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: actionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: actionsKeys.counts() });
    },
  };
}
