"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function signIn(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate input
  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Handle specific error types
    if (error.message.includes("Invalid login credentials")) {
      return {
        error: "Invalid email or password",
      };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        error: "Please verify your email before logging in",
      };
    }
    // Rate limiting error
    if (error.status === 429) {
      return {
        error: "Too many login attempts. Please try again later.",
      };
    }
    return {
      error: error.message,
    };
  }

  // Get redirect URL from query params if present
  const headersList = await headers();
  const referer = headersList.get("referer");
  let redirectTo = "/dashboard";

  if (referer) {
    const url = new URL(referer);
    const redirectParam = url.searchParams.get("redirect");
    if (redirectParam && redirectParam.startsWith("/")) {
      redirectTo = redirectParam;
    }
  }

  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
