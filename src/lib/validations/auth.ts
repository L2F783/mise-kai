import { z } from "zod";

/**
 * Password requirements:
 * - Minimum 8 characters
 * - At least 1 number
 * - At least 1 special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/\d/, "Password must contain at least 1 number")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least 1 special character"
  );

export const emailSchema = z.string().email("Please enter a valid email address");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

/**
 * Validates a password against the requirements.
 * Returns true if valid, or an array of error messages if invalid.
 */
export function validatePassword(
  password: string
): true | { valid: false; errors: string[] } {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return true;
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => issue.message),
  };
}
