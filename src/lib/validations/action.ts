import { z } from "zod";
import type { ActionStatus } from "@/types/database";

/**
 * Helper to validate date is not in the past (for create)
 */
const futureDateSchema = z
  .string()
  .refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    return inputDate >= today;
  }, "Due date cannot be in the past");

/**
 * Schema for creating a new action
 * - description: 5-500 characters, required
 * - due_date: ISO date string, must be today or future
 * - notes: max 2000 characters, optional
 */
export const createActionSchema = z.object({
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must not exceed 500 characters"),
  due_date: futureDateSchema,
  notes: z
    .string()
    .max(2000, "Notes must not exceed 2000 characters")
    .optional()
    .nullable(),
});

/**
 * Schema for updating an existing action
 * All fields are optional. Note: 'delayed' status requires delay reason (M-03)
 */
export const updateActionSchema = z.object({
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  due_date: z.string().optional(),
  notes: z
    .string()
    .max(2000, "Notes must not exceed 2000 characters")
    .optional()
    .nullable(),
  // Note: 'delayed' status is NOT allowed here - requires delay reason (M-03)
  status: z.enum(["on_target", "complete"] as const).optional(),
});

/**
 * Query params for listing actions
 */
export const actionsQuerySchema = z.object({
  status: z.enum(["on_target", "delayed", "complete", "all"] as const).optional().default("all"),
  sortBy: z.enum(["due_date", "created_at", "status"] as const).optional().default("due_date"),
  sortOrder: z.enum(["asc", "desc"] as const).optional().default("asc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
export type ActionsQueryInput = z.infer<typeof actionsQuerySchema>;

// Status options available for manual update (excludes 'delayed')
export const MANUAL_STATUS_OPTIONS: Array<{ value: Exclude<ActionStatus, 'delayed'>; label: string }> = [
  { value: "on_target", label: "On Target" },
  { value: "complete", label: "Complete" },
];
