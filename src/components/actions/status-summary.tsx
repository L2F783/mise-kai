"use client";

import { useStatusCounts } from "@/hooks/use-actions";
import { ActionStatusBadge } from "./action-status-badge";
import { Skeleton } from "@/components/ui/skeleton";

export function StatusSummary() {
  const { data: counts, isLoading } = useStatusCounts();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
    );
  }

  if (!counts) return null;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <ActionStatusBadge status="on_target" />
        <span className="text-sm font-medium">{counts.on_target}</span>
      </div>
      <div className="flex items-center gap-2">
        <ActionStatusBadge status="delayed" />
        <span className="text-sm font-medium">{counts.delayed}</span>
      </div>
      <div className="flex items-center gap-2">
        <ActionStatusBadge status="complete" />
        <span className="text-sm font-medium">{counts.complete}</span>
      </div>
      <div className="flex items-center gap-2">
        <ActionStatusBadge status="backlog" />
        <span className="text-sm font-medium">{counts.backlog}</span>
      </div>
      <div className="text-sm text-muted-foreground ml-2">
        Total: {counts.total}
      </div>
    </div>
  );
}
