"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { delayReasonSchema, DELAY_CATEGORY_OPTIONS } from "@/lib/validations/action";
import type { DelayReasonInput } from "@/lib/validations/action";
import { cn } from "@/lib/utils";

interface DelayReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DelayReasonInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function DelayReasonModal({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: DelayReasonModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<DelayReasonInput>({
    resolver: zodResolver(delayReasonSchema),
    mode: "onChange",
    defaultValues: {
      reason: "",
      category: null,
    },
  });

  const reason = watch("reason");
  const charCount = reason?.length ?? 0;

  const handleFormSubmit = async (data: DelayReasonInput) => {
    await onSubmit(data);
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  // Prevent closing via escape or clicking outside while submitting
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isSubmitting) return;
    if (!newOpen) {
      handleCancel();
    } else {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Why is this action delayed?</DialogTitle>
          <DialogDescription>
            Please provide a reason for the delay. This helps track patterns and improve planning.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Reason field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <span
                className={cn(
                  "text-xs",
                  charCount < 10 && "text-destructive",
                  charCount > 500 && "text-destructive",
                  charCount >= 10 && charCount <= 500 && "text-muted-foreground"
                )}
              >
                {charCount}/500
              </span>
            </div>
            <Textarea
              id="reason"
              placeholder="Describe what's causing this delay (minimum 10 characters)..."
              {...register("reason")}
              className={cn(errors.reason && "border-destructive")}
              rows={4}
              disabled={isSubmitting}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Category field (optional) */}
          <div className="space-y-2">
            <Label>Category (optional)</Label>
            <Select
              onValueChange={(value) =>
                setValue("category", value as DelayReasonInput["category"], { shouldValidate: true })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {DELAY_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Categorizing helps identify delay patterns across the team
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Saving..." : "Save & Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
