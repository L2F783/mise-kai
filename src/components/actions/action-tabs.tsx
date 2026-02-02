"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export type ActionTab = "active" | "backlog";

interface ActionTabsProps {
  activeTab: ActionTab;
  onTabChange: (tab: ActionTab) => void;
  activeCount: number;
  backlogCount: number;
}

export function ActionTabs({
  activeTab,
  onTabChange,
  activeCount,
  backlogCount,
}: ActionTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as ActionTab)}
      className="w-full"
    >
      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
        <TabsTrigger value="active" className="flex items-center gap-2">
          Active
          <Badge
            variant="secondary"
            className="h-5 min-w-[20px] px-1.5 text-xs font-medium"
          >
            {activeCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="backlog" className="flex items-center gap-2">
          Backlog
          <Badge
            variant="secondary"
            className="h-5 min-w-[20px] px-1.5 text-xs font-medium"
          >
            {backlogCount}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
