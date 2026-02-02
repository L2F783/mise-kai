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
  backlog: {
    label: "Backlog",
    variant: "outline",
  },
};

export function ActionStatusBadge({ status, className }: ActionStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        {
          "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:text-yellow-400": status === "on_target",
          "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400": status === "delayed",
          "bg-slate-500/15 text-slate-700 hover:bg-slate-700/25 dark:text-slate-400": status === "complete",
          "bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 dark:text-purple-400": status === "backlog",
        },
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
