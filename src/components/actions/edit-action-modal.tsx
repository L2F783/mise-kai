"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionForm } from "./action-form";
import { DelayReasonModal } from "./delay-reason-modal";
import { useUpdateAction } from "@/hooks/use-actions";
import type { Action } from "@/types/database";
import type { DelayReasonInput, EditFormInput } from "@/lib/validations/action";
import { toast } from "sonner";

interface EditActionModalProps {
  action: Action | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditActionModal({ action, open, onOpenChange }: EditActionModalProps) {
  const updateAction = useUpdateAction();
  const [pendingFormData, setPendingFormData] = useState<EditFormInput | null>(null);
  const [showDelayReasonModal, setShowDelayReasonModal] = useState(false);

  const handleSubmit = async (data: EditFormInput) => {
    if (!action) return;

    // Check if status is changing to "delayed" and it wasn't already delayed
    const isChangingToDelayed = data.status === "delayed" && action.status !== "delayed";

    if (isChangingToDelayed) {
      // Store the form data and show delay reason modal
      setPendingFormData(data);
      setShowDelayReasonModal(true);
      return;
    }

    // Normal update without delay reason
    await performUpdate(data);
  };

  const performUpdate = async (data: EditFormInput, delayReason?: DelayReasonInput) => {
    if (!action) return;

    try {
      await updateAction.mutateAsync({
        id: action.id,
        data: {
          description: data.description,
          due_date: data.due_date,
          notes: data.notes,
          ...(data.status ? { status: data.status } : {}),
        },
        delayReason,
      });
      toast.success("Action updated successfully");
      onOpenChange(false);
      setPendingFormData(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update action");
      }
    }
  };

  const handleDelayReasonSubmit = async (delayReasonData: DelayReasonInput) => {
    if (!pendingFormData) return;
    await performUpdate(pendingFormData, delayReasonData);
    setShowDelayReasonModal(false);
  };

  const handleDelayReasonCancel = () => {
    // User cancelled delay reason - don't change status
    setShowDelayReasonModal(false);
    setPendingFormData(null);
    // Keep the edit modal open so user can change their selection
  };

  const handleCancel = () => {
    setPendingFormData(null);
    onOpenChange(false);
  };

  if (!action) return null;

  return (
    <>
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

      <DelayReasonModal
        open={showDelayReasonModal}
        onOpenChange={setShowDelayReasonModal}
        onSubmit={handleDelayReasonSubmit}
        onCancel={handleDelayReasonCancel}
        isSubmitting={updateAction.isPending}
      />
    </>
  );
}
