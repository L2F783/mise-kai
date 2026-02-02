import { describe, it, expect } from "vitest";
import {
  createActionSchema,
  updateActionSchema,
  actionsQuerySchema,
  MANUAL_STATUS_OPTIONS,
} from "@/lib/validations/action";

describe("Action Validation Schemas", () => {
  describe("createActionSchema", () => {
    it("validates a complete valid action", () => {
      const today = new Date();
      today.setDate(today.getDate() + 7); // 7 days in future
      const result = createActionSchema.safeParse({
        description: "Complete the documentation review",
        due_date: today.toISOString().split("T")[0],
        notes: "Review all API documentation",
      });
      expect(result.success).toBe(true);
    });

    it("validates action without notes", () => {
      const today = new Date();
      today.setDate(today.getDate() + 7);
      const result = createActionSchema.safeParse({
        description: "Complete the documentation review",
        due_date: today.toISOString().split("T")[0],
      });
      expect(result.success).toBe(true);
    });

    it("rejects description shorter than 5 characters", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = createActionSchema.safeParse({
        description: "Test",
        due_date: tomorrow.toISOString().split("T")[0],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Description must be at least 5 characters"
        );
      }
    });

    it("rejects description longer than 500 characters", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = createActionSchema.safeParse({
        description: "a".repeat(501),
        due_date: tomorrow.toISOString().split("T")[0],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Description must not exceed 500 characters"
        );
      }
    });

    it("rejects due date in the past", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = createActionSchema.safeParse({
        description: "Valid description",
        due_date: yesterday.toISOString().split("T")[0],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Due date cannot be in the past"
        );
      }
    });

    it("accepts due date as today", () => {
      const today = new Date();
      const result = createActionSchema.safeParse({
        description: "Valid description",
        due_date: today.toISOString().split("T")[0],
      });
      expect(result.success).toBe(true);
    });

    it("rejects notes longer than 2000 characters", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = createActionSchema.safeParse({
        description: "Valid description",
        due_date: tomorrow.toISOString().split("T")[0],
        notes: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Notes must not exceed 2000 characters"
        );
      }
    });

    it("accepts null notes", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = createActionSchema.safeParse({
        description: "Valid description",
        due_date: tomorrow.toISOString().split("T")[0],
        notes: null,
      });
      expect(result.success).toBe(true);
    });

    it("requires description field", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = createActionSchema.safeParse({
        due_date: tomorrow.toISOString().split("T")[0],
      });
      expect(result.success).toBe(false);
    });

    it("requires due_date field", () => {
      const result = createActionSchema.safeParse({
        description: "Valid description",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateActionSchema", () => {
    it("validates partial update with only description", () => {
      const result = updateActionSchema.safeParse({
        description: "Updated description",
      });
      expect(result.success).toBe(true);
    });

    it("validates partial update with only due_date", () => {
      const result = updateActionSchema.safeParse({
        due_date: "2025-12-31",
      });
      expect(result.success).toBe(true);
    });

    it("validates partial update with only notes", () => {
      const result = updateActionSchema.safeParse({
        notes: "Updated notes",
      });
      expect(result.success).toBe(true);
    });

    it("validates partial update with only status", () => {
      const result = updateActionSchema.safeParse({
        status: "complete",
      });
      expect(result.success).toBe(true);
    });

    it("accepts on_target status", () => {
      const result = updateActionSchema.safeParse({
        status: "on_target",
      });
      expect(result.success).toBe(true);
    });

    it("accepts complete status", () => {
      const result = updateActionSchema.safeParse({
        status: "complete",
      });
      expect(result.success).toBe(true);
    });

    it("accepts delayed status", () => {
      const result = updateActionSchema.safeParse({
        status: "delayed",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid status", () => {
      const result = updateActionSchema.safeParse({
        status: "invalid_status",
      });
      expect(result.success).toBe(false);
    });

    it("validates empty update (all optional)", () => {
      const result = updateActionSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("validates full update", () => {
      const result = updateActionSchema.safeParse({
        description: "Updated description",
        due_date: "2025-12-31",
        notes: "Updated notes",
        status: "complete",
      });
      expect(result.success).toBe(true);
    });

    it("allows clearing notes with null", () => {
      const result = updateActionSchema.safeParse({
        notes: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("actionsQuerySchema", () => {
    it("validates with default values", () => {
      const result = actionsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("all");
        expect(result.data.sortBy).toBe("due_date");
        expect(result.data.sortOrder).toBe("asc");
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("validates all status filter options", () => {
      const statuses = ["all", "on_target", "delayed", "complete"];
      statuses.forEach((status) => {
        const result = actionsQuerySchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it("validates all sort options", () => {
      const sortByOptions = ["due_date", "created_at", "status"];
      sortByOptions.forEach((sortBy) => {
        const result = actionsQuerySchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      });
    });

    it("validates sort order options", () => {
      const sortOrders = ["asc", "desc"];
      sortOrders.forEach((sortOrder) => {
        const result = actionsQuerySchema.safeParse({ sortOrder });
        expect(result.success).toBe(true);
      });
    });

    it("coerces string page to number", () => {
      const result = actionsQuerySchema.safeParse({ page: "5" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
      }
    });

    it("coerces string limit to number", () => {
      const result = actionsQuerySchema.safeParse({ limit: "50" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it("rejects limit over 100", () => {
      const result = actionsQuerySchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it("rejects page 0", () => {
      const result = actionsQuerySchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects negative page", () => {
      const result = actionsQuerySchema.safeParse({ page: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe("MANUAL_STATUS_OPTIONS", () => {
    it("contains on_target option", () => {
      const option = MANUAL_STATUS_OPTIONS.find((o) => o.value === "on_target");
      expect(option).toBeDefined();
      expect(option?.label).toBe("On Target");
    });

    it("contains complete option", () => {
      const option = MANUAL_STATUS_OPTIONS.find((o) => o.value === "complete");
      expect(option).toBeDefined();
      expect(option?.label).toBe("Complete");
    });

    it("contains delayed option", () => {
      const option = MANUAL_STATUS_OPTIONS.find(
        (o) => (o.value as string) === "delayed"
      );
      expect(option).toBeDefined();
      expect(option?.label).toBe("Delayed");
    });

    it("contains backlog option", () => {
      const option = MANUAL_STATUS_OPTIONS.find(
        (o) => (o.value as string) === "backlog"
      );
      expect(option).toBeDefined();
      expect(option?.label).toBe("Backlog");
    });

    it("has exactly 4 options", () => {
      expect(MANUAL_STATUS_OPTIONS.length).toBe(4);
    });
  });
});
