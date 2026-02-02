"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionsTable } from "@/components/actions/actions-table";
import { ActionsTableSkeleton } from "@/components/actions/actions-table-skeleton";
import { EmptyState } from "@/components/actions/empty-state";
import { CreateActionModal } from "@/components/actions/create-action-modal";
import { EditActionModal } from "@/components/actions/edit-action-modal";
import { DeleteActionDialog } from "@/components/actions/delete-action-dialog";
import { ActionTabs, type ActionTab } from "@/components/actions/action-tabs";
import { StatusSummary } from "@/components/actions/status-summary";
import {
  useActionsInfinite,
  useTabCounts,
  type ActionsQueryParams,
} from "@/hooks/use-actions";
import type { Action, ActionStatus } from "@/types/database";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Status options change based on active tab
const ACTIVE_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "on_target", label: "On Target" },
  { value: "delayed", label: "Delayed" },
];

const SORT_OPTIONS = [
  { value: "due_date", label: "Due Date" },
  { value: "created_at", label: "Created Date" },
  { value: "status", label: "Status" },
];

export default function ActionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Get filter params from URL
  const tabParam = searchParams.get("tab") as ActionTab | null;
  const statusParam = searchParams.get("status") as ActionStatus | "all" | null;
  const sortByParam = searchParams.get("sortBy") as ActionsQueryParams["sortBy"] | null;
  const sortOrderParam = searchParams.get("sortOrder") as "asc" | "desc" | null;

  const currentTab: ActionTab = tabParam === "backlog" ? "backlog" : "active";

  const queryParams: Omit<ActionsQueryParams, "page"> = {
    tab: currentTab,
    status: statusParam ?? "all",
    sortBy: sortByParam ?? "due_date",
    sortOrder: sortOrderParam ?? "asc",
  };

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  // Fetch actions with infinite scroll
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActionsInfinite(queryParams);

  // Fetch tab counts
  const { data: tabCounts } = useTabCounts();

  // Flatten pages into single array
  const allActions = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.meta.total ?? 0;

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Update URL params
  const updateParams = useCallback(
    (updates: Partial<ActionsQueryParams & { tab: ActionTab }>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        // Set tab param
        if (key === "tab") {
          if (value === "backlog") {
            params.set("tab", "backlog");
          } else {
            params.delete("tab"); // active is default
          }
          // Clear status when switching tabs
          params.delete("status");
          return;
        }

        // Set other params
        if (
          value &&
          value !== "all" &&
          value !== "due_date" &&
          value !== "asc"
        ) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.push(`/dashboard/actions?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleTabChange = (tab: ActionTab) => {
    updateParams({ tab });
  };

  const handleEdit = (action: Action) => {
    setSelectedAction(action);
    setEditModalOpen(true);
  };

  const handleDelete = (action: Action) => {
    setSelectedAction(action);
    setDeleteDialogOpen(true);
  };

  const handleCreateModalClose = (open: boolean) => {
    setCreateModalOpen(open);
  };

  const handleEditModalClose = (open: boolean) => {
    setEditModalOpen(open);
    if (!open) {
      setSelectedAction(null);
    }
  };

  const handleDeleteDialogClose = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setSelectedAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Actions</h1>
          <p className="text-muted-foreground">
            Manage and track your action items
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Action
        </Button>
      </div>

      {/* Status Summary */}
      <StatusSummary />

      {/* Tabs */}
      <ActionTabs
        activeTab={currentTab}
        onTabChange={handleTabChange}
        activeCount={tabCounts?.activeCount ?? 0}
        backlogCount={tabCounts?.backlogCount ?? 0}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status filter - only show for active tab */}
        {currentTab === "active" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select
              value={queryParams.status ?? "all"}
              onValueChange={(value) =>
                updateParams({ status: value as ActionStatus | "all" })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            value={queryParams.sortBy ?? "due_date"}
            onValueChange={(value) =>
              updateParams({ sortBy: value as ActionsQueryParams["sortBy"] })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Order:</span>
          <Select
            value={queryParams.sortOrder ?? "asc"}
            onValueChange={(value) =>
              updateParams({ sortOrder: value as "asc" | "desc" })
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>
              {error instanceof Error ? error.message : "Failed to load actions"}
            </span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {isLoading ? (
        <ActionsTableSkeleton />
      ) : allActions.length > 0 ? (
        <>
          <ActionsTable
            actions={allActions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading more...
              </span>
            </div>
          )}

          {/* Items count */}
          <div className="text-sm text-muted-foreground text-center">
            Showing {allActions.length} of {totalCount} actions
          </div>
        </>
      ) : (
        !isError && (
          <EmptyState
            onCreateAction={() => setCreateModalOpen(true)}
            isBacklog={currentTab === "backlog"}
          />
        )
      )}

      {/* Modals */}
      <CreateActionModal
        open={createModalOpen}
        onOpenChange={handleCreateModalClose}
      />
      <EditActionModal
        action={selectedAction}
        open={editModalOpen}
        onOpenChange={handleEditModalClose}
      />
      <DeleteActionDialog
        action={selectedAction}
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
      />
    </div>
  );
}
