import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RatingRow from "../../components/RatingRow.jsx";

describe("RatingRow Component", () => {
  it("renders label and value correctly", () => {
    render(<RatingRow label="Team Culture" value={8} />);
    expect(screen.getByText("Team Culture:")).toBeInTheDocument();
    expect(screen.getByText("8/10")).toBeInTheDocument();
  });

  it("renders the correct number of stars based on the value", () => {
    render(<RatingRow label="Athletic Facilities" value={6} />);
    // 6/10 = 3.0 stars
    expect(screen.getByLabelText("3 Stars")).toBeInTheDocument();
  });

  it("handles half-star ratings", () => {
    render(<RatingRow label="Player Development" value={7} />);
    // 7/10 = 3.5 stars
    expect(screen.getByLabelText("3.5 Stars")).toBeInTheDocument();
  });

  it("renders with 0 value", () => {
    render(<RatingRow label="NIL Opportunity" value={0} />);
    expect(screen.getByText("0/10")).toBeInTheDocument();
    expect(screen.getByLabelText("0 Stars")).toBeInTheDocument();
  });
});
