"use client";

import { ClipboardList, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateAction: () => void;
  isBacklog?: boolean;
}

export function EmptyState({ onCreateAction, isBacklog = false }: EmptyStateProps) {
  if (isBacklog) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Backlog is empty</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Items moved to backlog will appear here. Use the backlog to park items
          you want to work on later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No actions yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Create your first action to start tracking your tasks and deliverables.
      </p>
      <Button onClick={onCreateAction}>
        Create Action
      </Button>
    </div>
  );
}
