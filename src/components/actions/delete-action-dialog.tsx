"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAction } from "@/hooks/use-actions";
import type { Action } from "@/types/database";
import { toast } from "sonner";

interface DeleteActionDialogProps {
  action: Action | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteActionDialog({ action, open, onOpenChange }: DeleteActionDialogProps) {
  const deleteAction = useDeleteAction();

  const handleDelete = async () => {
    if (!action) return;

    try {
      await deleteAction.mutateAsync(action.id);
      toast.success("Action deleted successfully");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete action");
      }
    }
  };

  if (!action) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Action</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete this action?</p>
            <p className="font-medium text-foreground">
              &quot;{action.description}&quot;
            </p>
            <p>This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteAction.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteAction.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteAction.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
