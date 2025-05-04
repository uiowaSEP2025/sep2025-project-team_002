import {render, screen, fireEvent, waitFor, within} from "@testing-library/react";
import { expect, vi, describe, it } from "vitest";
import { BrowserRouter } from "react-router-dom";
import MyReviews from "../../account/MyReviews.jsx"; // Import your component
import { UserProvider } from "../../context/UserContext.jsx";
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
              {
              review_id: 3,
              school_name: "Test School 3",
              sport: "Basketball",
              review_message: "Love the coach!",
              head_coach_name: "Coach C",
              head_coach: 9,
              assistant_coaches: 5,
              team_culture: 7,
              campus_life: 6,
              athletic_facilities: 5,
              athletic_department: 4,
              player_development: 3,
              nil_opportunity: 2,
              created_at: "2025-04-10",
            },
              {
              review_id: 4,
              school_name: "Test School 4",
              sport: "Basketball",
              review_message: "Can't be better!",
              head_coach_name: "Coach D",
              head_coach: 9,
              assistant_coaches: 1,
              team_culture: 7,
              campus_life: 6,
              athletic_facilities: 5,
              athletic_department: 4,
              player_development: 3,
              nil_opportunity: 2,
              created_at: "2025-04-10",
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
      <UserProvider>
        <BrowserRouter>
          <MyReviews />
        </BrowserRouter>
      </UserProvider>
    );


    // Wait for reviews to be displayed
    await waitFor(() => {
      // Test for the content of the first review
      const review1Card = screen.getByText("Test School 1").closest("div");
      expect(within(review1Card).getByText(/Basketball/)).toBeInTheDocument();
      expect(screen.getByText("Great team!")).toBeInTheDocument();

      // Test for the content of the second review
      expect(screen.getByText("Test School 2")).toBeInTheDocument();
      expect(screen.getByText(/Football/)).toBeInTheDocument();
      expect(screen.getByText("Amazing facilities.")).toBeInTheDocument();
    }, { timeout: 3000 }); // Increase timeout to allow for async rendering
  });

  it("displays a message when no reviews are found", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));

    render(
      <UserProvider>
        <BrowserRouter>
          <MyReviews />
        </BrowserRouter>
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("You haven't written any reviews yet")).toBeInTheDocument();
    });
  });

  it("correctly handles pagination", async () => {
    render(
      <UserProvider>
        <BrowserRouter>
          <MyReviews />
        </BrowserRouter>
      </UserProvider>
    );

    // 1) wait for the spinner to go away
     await waitFor(() => {
       expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
     });

     // 2) now you can assert how many reviews show up on page 1
     expect(screen.getAllByText(/Test School/)).toHaveLength( Math.min(3, /*reviewsPerPage*/ 3) );

     // 3) find and click the real “Next” button
     const nextBtn = await screen.findByRole("button", {
       name: /go to next page/i
     });
     fireEvent.click(nextBtn);


  });

  it("redirects to login if token is missing", () => {
    localStorage.removeItem("token");

    render(
      <UserProvider>
        <BrowserRouter>
          <MyReviews />
        </BrowserRouter>
      </UserProvider>
    );

    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("handles errors correctly", async () => {
    // Mock the fetch to simulate a failed response
    global.fetch = vi.fn().mockRejectedValue(new Error("Failed to load data"));

    render(
    <UserProvider>
      <BrowserRouter>
        <MyReviews />
      </BrowserRouter>
    </UserProvider>
    );

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText("Failed to load data")).toBeInTheDocument();  // Adjust based on the error UI
    });
  });

  it("navigates to next page on pagination click", async () => {
  render(
    <UserProvider>
      <BrowserRouter>
        <MyReviews />
      </BrowserRouter>
    </UserProvider>
  );

  await waitFor(() => {
    expect(screen.getByText("Test School 1")).toBeInTheDocument();
  });

  const nextBtn = await screen.findByRole("button", { name: /go to page 2/i });
  fireEvent.click(nextBtn);

  await waitFor(() => {
    expect(screen.getByText("Test School 4")).toBeInTheDocument(); // From your dataset
  });
});

  it("calls fetchUserReviews and updates reviews", async () => {
  const fetchSpy = vi.spyOn(global, "fetch");

  render(
    <UserProvider>
      <BrowserRouter>
        <MyReviews />
      </BrowserRouter>
    </UserProvider>
  );

  await waitFor(() => {
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/reviews/user-reviews/"),
      expect.anything()
    );
  });

  fetchSpy.mockRestore();
});

  it("clears token and navigates on logout", async () => {
  render(
    <UserProvider>
      <BrowserRouter>
        <MyReviews />
      </BrowserRouter>
    </UserProvider>
  );

  const logoutBtn = screen.getByText("Logout");
  fireEvent.click(logoutBtn);

  expect(localStorage.getItem("token")).toBeNull();
  expect(navigateMock).toHaveBeenCalledWith("/login");
});


});
