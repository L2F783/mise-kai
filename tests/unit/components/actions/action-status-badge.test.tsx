import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActionStatusBadge } from "@/components/actions/action-status-badge";

describe("ActionStatusBadge", () => {
  it("renders On Target status correctly", () => {
    render(<ActionStatusBadge status="on_target" />);
    expect(screen.getByText("On Target")).toBeInTheDocument();
  });

  it("renders Delayed status correctly", () => {
    render(<ActionStatusBadge status="delayed" />);
    expect(screen.getByText("Delayed")).toBeInTheDocument();
  });

  it("renders Complete status correctly", () => {
    render(<ActionStatusBadge status="complete" />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("applies green styling for on_target status", () => {
    render(<ActionStatusBadge status="on_target" />);
    const badge = screen.getByText("On Target");
    expect(badge).toHaveClass("text-green-700");
  });

  it("applies amber styling for delayed status", () => {
    render(<ActionStatusBadge status="delayed" />);
    const badge = screen.getByText("Delayed");
    expect(badge).toHaveClass("text-amber-700");
  });

  it("applies slate styling for complete status", () => {
    render(<ActionStatusBadge status="complete" />);
    const badge = screen.getByText("Complete");
    expect(badge).toHaveClass("text-slate-700");
  });

  it("accepts custom className", () => {
    render(<ActionStatusBadge status="on_target" className="custom-class" />);
    const badge = screen.getByText("On Target");
    expect(badge).toHaveClass("custom-class");
  });
});
