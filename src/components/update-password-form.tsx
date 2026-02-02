"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import {
  updatePassword,
  type UpdatePasswordState,
} from "@/app/auth/update-password/actions";

const initialState: UpdatePasswordState = {};

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, formAction, isPending] = useActionState(
    updatePassword,
    initialState
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below. It must be at least 8 characters with
            1 number and 1 special character.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  aria-describedby={
                    state.fieldErrors?.password ? "password-error" : undefined
                  }
                />
                {state.fieldErrors?.password && (
                  <div id="password-error" className="text-sm text-destructive">
                    {state.fieldErrors.password.map((error, i) => (
                      <p key={i}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  aria-describedby={
                    state.fieldErrors?.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                />
                {state.fieldErrors?.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="text-sm text-destructive"
                  >
                    {state.fieldErrors.confirmPassword[0]}
                  </p>
                )}
              </div>
              {state.error && (
                <div
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                  role="alert"
                >
                  {state.error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
