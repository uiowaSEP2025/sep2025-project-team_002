import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StarRating from "../../components/StarRating";

// Mock the StarIcon component
vi.mock("@mui/icons-material/Star", () => ({
  default: () => <span data-testid="star-icon" />
}));

describe("StarRating Component", () => {
  it("renders with default props", () => {
    render(<StarRating rating={0} />);
    
    // Should render 5 stars (Material-UI Rating component)
    const stars = screen.getAllByTestId("star-icon");
    expect(stars.length).toBeGreaterThan(0);
  });

  it("renders with a specific rating", () => {
    render(<StarRating rating={7} />);
    
    // Should render 5 stars (Material-UI Rating component)
    const stars = screen.getAllByTestId("star-icon");
    expect(stars.length).toBeGreaterThan(0);
  });

  it("shows numeric value when showValue is true", () => {
    render(<StarRating rating={7.5} showValue={true} />);
    
    // Should show the numeric value
    expect(screen.getByText("7.5")).toBeInTheDocument();
  });

  it("doesn't show numeric value when showValue is false", () => {
    render(<StarRating rating={7.5} showValue={false} />);
    
    // Should not show the numeric value
    expect(screen.queryByText("7.5")).not.toBeInTheDocument();
  });

  it("handles ratings above 10", () => {
    render(<StarRating rating={12} showValue={true} />);
    
    // Should cap the rating at 10
    expect(screen.getByText("10.0")).toBeInTheDocument();
  });

  it("handles ratings below 0", () => {
    render(<StarRating rating={-2} showValue={true} />);
    
    // Should floor the rating at 0
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("handles non-numeric ratings", () => {
    render(<StarRating rating={"invalid"} showValue={true} />);
    
    // Should default to 0
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("renders with different size", () => {
    render(<StarRating rating={7} size="large" />);
    
    // Should render stars with the specified size
    const stars = screen.getAllByTestId("star-icon");
    expect(stars.length).toBeGreaterThan(0);
  });
});
