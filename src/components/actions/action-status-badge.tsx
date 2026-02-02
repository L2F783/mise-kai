"use client";

import { Badge } from "@/components/ui/badge";
import type { ActionStatus } from "@/types/database";
import { cn } from "@/lib/utils";

interface ActionStatusBadgeProps {
  status: ActionStatus;
  className?: string;
}

const statusConfig: Record<ActionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  on_target: {
    label: "On Target",
    variant: "default",
  },
  delayed: {
    label: "Delayed",
    variant: "destructive",
  },
  complete: {
    label: "Complete",
    variant: "secondary",
  },
};

export function ActionStatusBadge({ status, className }: ActionStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        {
          "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400": status === "on_target",
          "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400": status === "delayed",
          "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 dark:text-slate-400": status === "complete",
        },
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
