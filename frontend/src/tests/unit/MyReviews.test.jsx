import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, vi, describe, it } from "vitest";
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

       if (url.includes("/users/user/")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          transfer_type: "transfer",
          is_school_verified: true,
          profile_picture: ""
        })
      });
    }
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


    // Wait for reviews to be displayed
    await waitFor(() => {
      // Test for the content of the first review
      expect(screen.getByText("Test School 1")).toBeInTheDocument();
      expect(screen.getByText(/Basketball/)).toBeInTheDocument();
      expect(screen.getByText("Great team!")).toBeInTheDocument();
      expect(screen.getByText("Head Coach • Coach A: 9/10")).toBeInTheDocument();
      expect(screen.getByText("Assistant Coaches: 8/10")).toBeInTheDocument();

      // Test for the content of the second review
      expect(screen.getByText("Test School 2")).toBeInTheDocument();
      expect(screen.getByText(/Football/)).toBeInTheDocument();
      expect(screen.getByText("Amazing facilities.")).toBeInTheDocument();
      expect(screen.getByText("Head Coach • Coach B: 10/10")).toBeInTheDocument();
    }, { timeout: 3000 }); // Increase timeout to allow for async rendering
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
      expect(screen.getAllByText(/Basketball/)).toHaveLength(1); // Assuming 2 reviews per page
    });

    // Click to go to the next page
    const paginationButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(paginationButton);

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
