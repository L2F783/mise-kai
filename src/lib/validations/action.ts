import { z } from "zod";
import type { ActionStatus, DelayCategory } from "@/types/database";

/**
 * Helper to validate date is not in the past (for create)
 * Compares date strings directly to avoid timezone issues
 */
const futureDateSchema = z
  .string()
  .refine((date) => {
    // Get today's date as YYYY-MM-DD in local timezone
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    // Compare as strings (YYYY-MM-DD format sorts correctly)
    return date >= todayStr;
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
  // PM can assign action to a team member (Issue #23)
  owner_id: z.string().uuid().optional(),
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
  status: z.enum(["on_target", "delayed", "complete", "backlog"] as const).optional(),
  // PM can reassign action to a different team member (Issue #23)
  owner_id: z.string().uuid().optional(),
});

/**
 * Query params for listing actions
 */
export const actionsQuerySchema = z.object({
  status: z.enum(["on_target", "delayed", "complete", "backlog", "all"] as const).optional().default("all"),
  sortBy: z.enum(["due_date", "created_at", "status"] as const).optional().default("due_date"),
  sortOrder: z.enum(["asc", "desc"] as const).optional().default("asc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Schema for the edit form - extends create schema with optional status
 * Used in ActionForm when editing to include status in form data
 */
export const editFormSchema = createActionSchema.extend({
  status: z.enum(["on_target", "delayed", "complete", "backlog"] as const).optional(),
});

/**
 * Schema for delay reason input (M-03: Delay Categorization)
 * - reason: freeform text, minimum 10 characters (per DB constraint)
 * - category: optional manual category selection
 */
export const delayReasonSchema = z.object({
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must not exceed 500 characters"),
  category: z
    .enum(["people", "process", "technical", "capacity", "external", "other"] as const)
    .optional()
    .nullable(),
});

export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
export type EditFormInput = z.infer<typeof editFormSchema>;
export type ActionsQueryInput = z.infer<typeof actionsQuerySchema>;
export type DelayReasonInput = z.infer<typeof delayReasonSchema>;

// Status options available for manual update
export const MANUAL_STATUS_OPTIONS: Array<{ value: ActionStatus; label: string }> = [
  { value: "on_target", label: "On Target" },
  { value: "delayed", label: "Delayed" },
  { value: "complete", label: "Complete" },
  { value: "backlog", label: "Backlog" },
];

// Delay category options for manual categorization
export const DELAY_CATEGORY_OPTIONS: Array<{ value: DelayCategory; label: string; description: string }> = [
  { value: "people", label: "People", description: "Team availability, dependencies on others" },
  { value: "process", label: "Process", description: "Workflow issues, approvals, handoffs" },
  { value: "technical", label: "Technical", description: "Technical blockers, bugs, infrastructure" },
  { value: "capacity", label: "Capacity", description: "Workload, bandwidth constraints" },
  { value: "external", label: "External", description: "Third-party dependencies, external factors" },
  { value: "other", label: "Other", description: "Uncategorized delays" },
];
