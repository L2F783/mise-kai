"use server";

import { createClient } from "@/lib/supabase/server";
import { updatePasswordSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export type UpdatePasswordState = {
  error?: string;
  fieldErrors?: {
    password?: string[];
    confirmPassword?: string[];
  };
};

export async function updatePassword(
  prevState: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const rawData = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Validate input
  const validatedFields = updatePasswordSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { password } = validatedFields.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    // Handle specific error types
    if (error.message.includes("same password")) {
      return {
        error: "New password must be different from your current password",
      };
    }
    if (error.status === 422) {
      return {
        error: "Password does not meet requirements",
      };
    }
    return {
      error: error.message,
    };
  }

  redirect("/dashboard");
}
