"use server";

import { revalidatePath } from "next/cache";
import { createActionSchema, updateActionSchema, delayReasonSchema } from "@/lib/validations/action";
import type { DelayReasonInput } from "@/lib/validations/action";
import {
  createAction,
  updateAction,
  deleteAction,
  createDelayReason,
  getActiveCount,
  getActiveCountForUser,
  WIP_LIMIT,
} from "@/lib/actions/queries";
import type { Action } from "@/types/database";

export interface ActionResult<T = void> {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  /** Indicates the action was auto-assigned to backlog due to WIP limit */
  autoBacklogged?: boolean;
}

/**
 * Server action to create a new action.
 * If target owner is at WIP limit, action is auto-assigned to backlog.
 * PM can assign action to team member via owner_id (Issue #23).
 */
export async function createActionAction(
  input: unknown
): Promise<ActionResult<Action>> {
  try {
    // Validate input
    const result = createActionSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }
      return { error: "Validation failed", fieldErrors };
    }

    // Check WIP limit for the target owner
    // If owner_id is provided (PM assignment), check that user's WIP
    // Otherwise, getActiveCount checks current user's WIP via RLS
    let activeCount: number;
    if (result.data.owner_id) {
      activeCount = await getActiveCountForUser(result.data.owner_id);
    } else {
      activeCount = await getActiveCount();
    }
    const atWipLimit = activeCount >= WIP_LIMIT;

    // Create the action (createAction will handle auto-backlog if needed)
    const action = await createAction(result.data, atWipLimit);

    // Revalidate the actions list
    revalidatePath("/dashboard/actions");
    revalidatePath("/dashboard");

    return { data: action, autoBacklogged: atWipLimit };
  } catch (error) {
    console.error("Create action error:", error);
    if (error instanceof Error) {
      if (error.message.includes("Authentication")) {
        return { error: "You must be logged in to create an action" };
      }
      return { error: error.message };
    }
    return { error: "Failed to create action" };
  }
}

/**
 * Server action to update an existing action.
 * If status is changed to "delayed", an optional delayReason can be provided.
 */
export async function updateActionAction(
  id: string,
  input: unknown,
  delayReason?: DelayReasonInput
): Promise<ActionResult<Action>> {
  try {
    if (!id) {
      return { error: "Action ID is required" };
    }

    // Validate input
    const result = updateActionSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }
      return { error: "Validation failed", fieldErrors };
    }

    // Validate delay reason if provided
    if (delayReason) {
      const delayResult = delayReasonSchema.safeParse(delayReason);
      if (!delayResult.success) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of delayResult.error.issues) {
          const path = `delayReason.${issue.path.join(".")}`;
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        }
        return { error: "Delay reason validation failed", fieldErrors };
      }
    }

    // Update the action
    const action = await updateAction(id, result.data);

    // Create delay reason record if status is delayed and reason provided
    if (result.data.status === "delayed" && delayReason) {
      await createDelayReason(id, delayReason);
    }

    // Revalidate the actions list
    revalidatePath("/dashboard/actions");
    revalidatePath("/dashboard");

    return { data: action };
  } catch (error) {
    console.error("Update action error:", error);
    if (error instanceof Error) {
      if (error.message.includes("Authentication")) {
        return { error: "You must be logged in to update an action" };
      }
      if (error.message.includes("not found")) {
        return { error: "Action not found" };
      }
      return { error: error.message };
    }
    return { error: "Failed to update action" };
  }
}

/**
 * Server action to delete an action.
 */
export async function deleteActionAction(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return { error: "Action ID is required" };
    }

    // Delete the action
    await deleteAction(id);

    // Revalidate the actions list
    revalidatePath("/dashboard/actions");
    revalidatePath("/dashboard");

    return {};
  } catch (error) {
    console.error("Delete action error:", error);
    if (error instanceof Error) {
      if (error.message.includes("Authentication")) {
        return { error: "You must be logged in to delete an action" };
      }
      if (error.message.includes("not found")) {
        return { error: "Action not found" };
      }
      if (error.message.includes("completed")) {
        return { error: "Cannot delete a completed action" };
      }
      return { error: error.message };
    }
    return { error: "Failed to delete action" };
  }
}
