"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionStatusBadge } from "./action-status-badge";
import type { Action } from "@/types/database";

interface ActionsTableProps {
  actions: Action[];
  onEdit: (action: Action) => void;
  onDelete: (action: Action) => void;
  sortBy?: "due_date" | "created_at" | "status";
  sortOrder?: "asc" | "desc";
}

export function ActionsTable({
  actions,
  onEdit,
  onDelete,
  sortBy = "due_date",
  sortOrder = "asc",
}: ActionsTableProps) {
  // Helper to render sort indicator
  const SortIndicator = ({ columnKey }: { columnKey: string }) => {
    if (sortBy !== columnKey) return null;
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  const columns: ColumnDef<Action>[] = [
    {
      accessorKey: "created_at",
      header: () => (
        <div className="flex items-center">
          <span className={sortBy === "created_at" ? "font-semibold" : ""}>
            Created
          </span>
          <SortIndicator columnKey="created_at" />
        </div>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <span className="text-sm">{format(date, "MMM d, yyyy")}</span>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[400px]">
            <p className="truncate" title={description}>
              {description}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "due_date",
      header: () => (
        <div className="flex items-center">
          <span className={sortBy === "due_date" ? "font-semibold" : ""}>
            Due Date
          </span>
          <SortIndicator columnKey="due_date" />
        </div>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("due_date"));
        const isOverdue =
          date < new Date() &&
          row.original.status !== "complete" &&
          row.original.status !== "backlog";
        return (
          <span className={isOverdue ? "text-destructive font-medium" : ""}>
            {format(date, "MMM d, yyyy")}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="flex items-center">
          <span className={sortBy === "status" ? "font-semibold" : ""}>
            Status
          </span>
          <SortIndicator columnKey="status" />
        </div>
      ),
      cell: ({ row }) => {
        return <ActionStatusBadge status={row.getValue("status")} />;
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string | null;
        if (!notes) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="max-w-[200px]">
            <p className="truncate text-sm text-muted-foreground" title={notes}>
              {notes}
            </p>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const action = row.original;
        const isCompleted = action.status === "complete";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(action)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(action)}
                disabled={isCompleted}
                className={
                  isCompleted
                    ? "text-muted-foreground"
                    : "text-destructive focus:text-destructive"
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
                {isCompleted && " (disabled)"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: actions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="min-w-[800px]">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No actions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
