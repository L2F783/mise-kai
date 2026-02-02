"use server";

import { revalidatePath } from "next/cache";
import { createActionSchema, updateActionSchema } from "@/lib/validations/action";
import { createAction, updateAction, deleteAction } from "@/lib/actions/queries";
import type { Action } from "@/types/database";

export interface ActionResult<T = void> {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server action to create a new action.
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

    // Create the action
    const action = await createAction(result.data);

    // Revalidate the actions list
    revalidatePath("/dashboard/actions");
    revalidatePath("/dashboard");

    return { data: action };
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
 */
export async function updateActionAction(
  id: string,
  input: unknown
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

    // Update the action
    const action = await updateAction(id, result.data);

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
