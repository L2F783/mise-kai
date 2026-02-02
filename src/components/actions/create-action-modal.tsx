"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionForm } from "./action-form";
import { useCreateAction } from "@/hooks/use-actions";
import type { CreateActionInput } from "@/lib/validations/action";
import { toast } from "sonner";

interface CreateActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateActionModal({ open, onOpenChange }: CreateActionModalProps) {
  const createAction = useCreateAction();

  const handleSubmit = async (data: CreateActionInput) => {
    try {
      await createAction.mutateAsync(data);
      toast.success("Action created successfully");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create action");
      }
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Action</DialogTitle>
          <DialogDescription>
            Add a new action item to track. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <ActionForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createAction.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
