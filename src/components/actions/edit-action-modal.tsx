"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionForm } from "./action-form";
import { useUpdateAction } from "@/hooks/use-actions";
import type { Action, ActionStatus } from "@/types/database";
import type { CreateActionInput } from "@/lib/validations/action";
import { toast } from "sonner";

interface EditActionModalProps {
  action: Action | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditActionModal({ action, open, onOpenChange }: EditActionModalProps) {
  const updateAction = useUpdateAction();

  const handleSubmit = async (data: CreateActionInput & { status?: ActionStatus }) => {
    if (!action) return;

    try {
      await updateAction.mutateAsync({
        id: action.id,
        data: {
          description: data.description,
          due_date: data.due_date,
          notes: data.notes,
          // Only include status if it's a valid manual status (not 'delayed')
          ...(data.status && data.status !== "delayed" ? { status: data.status } : {}),
        },
      });
      toast.success("Action updated successfully");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update action");
      }
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Action</DialogTitle>
          <DialogDescription>
            Update the action details. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <ActionForm
          action={action}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateAction.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
