"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Action, ActionStatus } from "@/types/database";
import type { CreateActionInput, UpdateActionInput } from "@/lib/validations/action";
import {
  createActionAction,
  updateActionAction,
  deleteActionAction,
} from "@/app/dashboard/actions/_actions";

export interface ActionsQueryParams {
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

const defaultParams: Required<ActionsQueryParams> = {
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
  details: () => [...actionsKeys.all, "detail"] as const,
  detail: (id: string) => [...actionsKeys.details(), id] as const,
};

/**
 * Fetch actions from Supabase client-side
 */
async function fetchActions(params: Required<ActionsQueryParams>): Promise<PaginatedActions> {
  const supabase = createClient();
  const { status, sortBy, sortOrder, page, limit } = params;

  let query = supabase.from("actions").select("*", { count: "exact" });

  // Filter by status (unless 'all')
  if (status !== "all") {
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
      return result.data!;
    },
    onSuccess: () => {
      // Invalidate and refetch actions list
      queryClient.invalidateQueries({ queryKey: actionsKeys.lists() });
    },
  });
}

/**
 * Hook for updating an action
 */
export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateActionInput }) => {
      const result = await updateActionAction(id, data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data!;
    },
    onSuccess: (data) => {
      // Update the specific action in cache
      queryClient.setQueryData(actionsKeys.detail(data.id), data);
      // Invalidate and refetch actions list
      queryClient.invalidateQueries({ queryKey: actionsKeys.lists() });
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
      // Invalidate and refetch actions list
      queryClient.invalidateQueries({ queryKey: actionsKeys.lists() });
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
    },
  };
}
