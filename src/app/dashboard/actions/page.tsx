"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
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
import { useActions, type ActionsQueryParams } from "@/hooks/use-actions";
import type { Action, ActionStatus } from "@/types/database";
import { Alert, AlertDescription } from "@/components/ui/alert";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "on_target", label: "On Target" },
  { value: "delayed", label: "Delayed" },
  { value: "complete", label: "Complete" },
];

const SORT_OPTIONS = [
  { value: "due_date", label: "Due Date" },
  { value: "created_at", label: "Created Date" },
  { value: "status", label: "Status" },
];

export default function ActionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter params from URL
  const statusParam = searchParams.get("status") as ActionStatus | "all" | null;
  const sortByParam = searchParams.get("sortBy") as ActionsQueryParams["sortBy"] | null;
  const sortOrderParam = searchParams.get("sortOrder") as "asc" | "desc" | null;

  const queryParams: ActionsQueryParams = {
    status: statusParam ?? "all",
    sortBy: sortByParam ?? "due_date",
    sortOrder: sortOrderParam ?? "asc",
  };

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  // Fetch actions
  const { data, isLoading, isError, error, refetch } = useActions(queryParams);

  // Update URL params
  const updateParams = (updates: Partial<ActionsQueryParams>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "due_date" && value !== "asc") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push(`/dashboard/actions?${params.toString()}`);
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
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
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
      ) : data?.data && data.data.length > 0 ? (
        <>
          <ActionsTable
            actions={data.data}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {/* Pagination info */}
          {data.meta && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {data.data.length} of {data.meta.total} actions
              </span>
              {data.meta.pages > 1 && (
                <span>
                  Page {data.meta.page} of {data.meta.pages}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        !isError && <EmptyState onCreateAction={() => setCreateModalOpen(true)} />
      )}

      {/* Modals */}
      <CreateActionModal open={createModalOpen} onOpenChange={handleCreateModalClose} />
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
