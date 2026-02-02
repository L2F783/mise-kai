"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createActionSchema, editFormSchema, MANUAL_STATUS_OPTIONS } from "@/lib/validations/action";
import type { EditFormInput } from "@/lib/validations/action";
import type { Action } from "@/types/database";
import { cn } from "@/lib/utils";

interface ActionFormProps {
  action?: Action;
  onSubmit: (data: EditFormInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ActionForm({ action, onSubmit, onCancel, isSubmitting = false }: ActionFormProps) {
  const isEditing = !!action;
  const [charCount, setCharCount] = useState(action?.description?.length ?? 0);

  // Use editFormSchema which includes optional status field
  // For create, status will just be undefined (which is fine)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<EditFormInput>({
    resolver: zodResolver(isEditing ? editFormSchema : createActionSchema),
    mode: "onBlur",
    defaultValues: {
      description: action?.description ?? "",
      due_date: action?.due_date ?? "",
      notes: action?.notes ?? "",
      ...(isEditing ? { status: action?.status as EditFormInput["status"] } : {}),
    },
  });

  const description = watch("description");
  const dueDate = watch("due_date");

  useEffect(() => {
    setCharCount(description?.length ?? 0);
  }, [description]);

  const handleFormSubmit = async (data: EditFormInput) => {
    await onSubmit(data);
  };

  // Determine if this is a new action (no action prop or no ID)
  const isNewAction = !action;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Description field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <span
            className={cn(
              "text-xs",
              charCount < 5 && "text-destructive",
              charCount > 500 && "text-destructive",
              charCount >= 5 && charCount <= 500 && "text-muted-foreground"
            )}
          >
            {charCount}/500
          </span>
        </div>
        <Textarea
          id="description"
          placeholder="Describe the action to be taken..."
          {...register("description")}
          className={cn(errors.description && "border-destructive")}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Due Date field */}
      <div className="space-y-2">
        <Label>
          Due Date <span className="text-destructive">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground",
                errors.due_date && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(new Date(dueDate), "PPP") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate ? new Date(dueDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  setValue("due_date", format(date, "yyyy-MM-dd"), {
                    shouldValidate: true,
                  });
                }
              }}
              disabled={(date) => {
                // For new actions, disable past dates
                // For edits, allow any date (user might need to adjust)
                if (isNewAction) {
                  const d = new Date(date);
                  d.setHours(0, 0, 0, 0);
                  return d < today;
                }
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input type="hidden" {...register("due_date")} />
        {errors.due_date && (
          <p className="text-sm text-destructive">{errors.due_date.message}</p>
        )}
      </div>

      {/* Status field (only for editing) */}
      {isEditing && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            defaultValue={action?.status}
            onValueChange={(value) => setValue("status", value as EditFormInput["status"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {MANUAL_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Notes field */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes (optional)..."
          {...register("notes")}
          className={cn(errors.notes && "border-destructive")}
          rows={2}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
        <p className="text-xs text-muted-foreground">Max 2000 characters</p>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Action" : "Create Action"}
        </Button>
      </div>
    </form>
  );
}
