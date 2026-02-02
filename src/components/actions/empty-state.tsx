"use client";

import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateAction: () => void;
}

export function EmptyState({ onCreateAction }: EmptyStateProps) {
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
