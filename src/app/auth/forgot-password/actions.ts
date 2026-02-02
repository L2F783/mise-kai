"use server";

import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";

export type ForgotPasswordState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    email?: string[];
  };
};

export async function requestPasswordReset(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const rawData = {
    email: formData.get("email") as string,
  };

  // Validate input
  const validatedFields = resetPasswordSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  const supabase = await createClient();

  // Get the origin for the redirect URL
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/auth/update-password`,
  });

  if (error) {
    // Don't reveal if email exists or not for security
    if (error.status === 429) {
      return {
        error: "Too many requests. Please try again later.",
      };
    }
    // Log the actual error for debugging but return generic message
    console.error("Password reset error:", error.message);
  }

  // Always return success to prevent email enumeration
  return {
    success: true,
  };
}
