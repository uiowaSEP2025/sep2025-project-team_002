import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import MyReviews from "../../account/MyReviews.jsx"; // Import your component
import API_BASE_URL from "../../utils/config.js";

// Mock the navigate function
const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

// Mock global fetch
beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes("/api/reviews/user-reviews/")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              review_id: 1,
              school_name: "Test School 1",
              sport: "Basketball",
              review_message: "Great team!",
              head_coach_name: "Coach A",
              head_coach: 9,
              assistant_coaches: 8,
              team_culture: 7,
              campus_life: 6,
              athletic_facilities: 5,
              athletic_department: 4,
              player_development: 3,
              nil_opportunity: 2,
              created_at: "2025-04-10",
            },
            {
              review_id: 2,
              school_name: "Test School 2",
              sport: "Football",
              review_message: "Amazing facilities.",
              head_coach_name: "Coach B",
              head_coach: 10,
              assistant_coaches: 9,
              team_culture: 8,
              campus_life: 7,
              athletic_facilities: 6,
              athletic_department: 5,
              player_development: 4,
              nil_opportunity: 3,
              created_at: "2025-04-09",
            },
            // Add more reviews as needed
          ]),
      });
    }
    return Promise.resolve({ ok: false });
  });

  localStorage.setItem("token", "valid_token");
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("MyReviews Component", () => {
  it("renders reviews correctly when data is available", async () => {
    render(
      <BrowserRouter>
        <MyReviews />
      </BrowserRouter>
    );
     // Wait for the component to load and ensure that reviews are rendered
    await waitFor(() => {
    const reviews = screen.getAllByText("My Reviews");  // Handle multiple elements
    expect(reviews[0]).toBeInTheDocument();  // Target the first instance of "My Reviews"
  });

    await waitFor(() => {
      // Use queryAllByText or getAllByText for matching text in multiple elements
      const schoolElements = screen.getAllByText(/Test School 1/);
      const sportElements = screen.getAllByText(/Basketball/);

      // Check if "Test School 1" appears at least once in the DOM
      expect(schoolElements.length).toBeGreaterThan(0);
      expect(sportElements.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      // expect(screen.getByText(/Test School 1/)).toBeInTheDocument();
      // expect(screen.getByText(/Basketball/)).toBeInTheDocument();
      expect(screen.getByText("Head Coach • Coach A: 9/10")).toBeInTheDocument();
      expect(screen.getByText("Assistant Coaches: 8/10")).toBeInTheDocument();
    });
  });

  it("displays a message when no reviews are found", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));

    render(
      <BrowserRouter>
        <MyReviews />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No reviews found.")).toBeInTheDocument();
    });
  });

  it("correctly handles pagination", async () => {
    render(
      <BrowserRouter>
        <MyReviews />
      </BrowserRouter>
    );

    // Verify the correct number of reviews is displayed per page
    await waitFor(() => {
      expect(screen.getAllByText(/Basketball/)).toHaveLength(2); // Assuming 2 reviews per page
    });

    // Click to go to the next page
    const paginationButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(paginationButton);

    await waitFor(() => {
      expect(screen.getByText("Page 2")).toBeInTheDocument(); // Assuming pagination text includes page numbers
    });
  });

  it("redirects to login if token is missing", () => {
    localStorage.removeItem("token");

    render(
      <BrowserRouter>
        <MyReviews />
      </BrowserRouter>
    );

    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("handles errors correctly", async () => {
      // Mock the fetch to simulate a failed response
      global.fetch = vi.fn().mockRejectedValue(new Error("Failed to load data"));

      render(
        <BrowserRouter>
          <MyReviews />
        </BrowserRouter>
      );

      // Wait for the error message to appear
      await waitFor(() => {
        expect(screen.getByText("Failed to load data")).toBeInTheDocument();  // Adjust based on the error UI
      });
    });

});
