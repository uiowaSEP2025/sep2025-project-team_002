import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Component to test
import SchoolSportPage from "../../components/SchoolSportPage";

// Mock the child components
vi.mock("../../components/ReviewSummary", () => ({
  default: ({ schoolId, sport }) => (
    <div data-testid="review-summary">{`ReviewSummary: ${schoolId} - ${sport}`}</div>
  ),
}));


describe("SchoolSportPage", () => {
  it("renders the correct sport program and passes params to children", () => {
    const testSchoolId = "123";
    const testSport = "Basketball";

    render(
      <MemoryRouter initialEntries={[`/schools/${testSchoolId}/${testSport}`]}>
        <Routes>
          <Route
            path="/schools/:schoolId/:sport"
            element={<SchoolSportPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Check the heading is correct
    expect(screen.getByRole("heading", { name: /Basketball Program/i })).toBeInTheDocument();

    // Check mocked child components received correct props
    expect(screen.getByTestId("review-summary")).toHaveTextContent("ReviewSummary: 123 - Basketball");
  });
});
