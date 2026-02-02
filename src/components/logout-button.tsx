"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/login/actions";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = "default",
  showIcon = false,
  className,
}: LogoutButtonProps) {
  return (
    <form action={signOut}>
      <Button type="submit" variant={variant} className={className}>
        {showIcon && <LogOut className="mr-2 h-4 w-4" />}
        Sign out
      </Button>
    </form>
  );
}
