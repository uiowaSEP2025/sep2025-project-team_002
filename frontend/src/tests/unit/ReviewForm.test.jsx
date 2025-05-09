import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import {expect, vi} from "vitest";
import { BrowserRouter } from "react-router-dom";
import ReviewForm from "../../review/ReviewForm.jsx";
import API_BASE_URL from "../../utils/config.js";

// vi.mock("../utils/config", () => ({
//   default: "http://localhost:8000",
// }));

// Mock fetch globally
beforeEach(() => {
  global.fetch = vi.fn((url, options) => {
    if (url.includes("/api/reviews/user-reviews/")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            review_id: "123e4567-e89b-12d3-a456-426614174000",
            school: 1,
            user: 1,
            sport: "Men's Basketball",
            head_coach_name: "John Duck",
            review_message: "Great experience!",
            head_coach: 4,
            assistant_coaches: 4,
            team_culture: 5,
            campus_life: 5,
            athletic_facilities: 5,
            athletic_department: 4,
            player_development: 5,
            nil_opportunity: 3,
            created_at: "2024-02-14T00:00:00Z",
            updated_at: "2024-02-14T00:00:00Z"
          }
        ]),
      });
    }

    if (url.includes("/api/schools/")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 1,
            school_name: "Test School",
            mbb: true,
            wbb: false,
            fb: false,
            conference: "Test Conference",
            location: "Test Location",
            created_at: "2024-02-14T00:00:00Z",
            updated_at: "2024-02-14T00:00:00Z",
            review_summaries: {},
            review_dates: {},
            review_summary: null,
            last_review_date: null,
            sport_summaries: {},
            sport_review_dates: {}
          }
        ]),
      });
    }

    return Promise.resolve({ ok: false });
  });

  localStorage.setItem("token", "valid_token"); // Mock authentication
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("ReviewForm Component", () => {
  it("fetches and displays schools", async () => {
    render(
      <BrowserRouter>
        <ReviewForm />
      </BrowserRouter>
    );

    const schoolDropdown = await screen.findByLabelText("School *");
    fireEvent.mouseDown(schoolDropdown);

    await waitFor(() => screen.getByText("Test School")); // Ensure dropdown is populated
    expect(screen.getByText("Test School")).toBeInTheDocument();
  }, 20000);

  it("allows school search via autocomplete", async () => {
  render(
    <BrowserRouter>
      <ReviewForm />
    </BrowserRouter>
  );

  const schoolInput = await screen.findByLabelText("School *");

  fireEvent.change(schoolInput, { target: { value: "Test" } });

  await waitFor(() => {
    expect(screen.getByText("Test School")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText("Test School"));

  expect(schoolInput).toHaveValue("Test School");
}, 20000);


  it("sends Authorization header with API requests", async () => {
    render(
      <BrowserRouter>
        <ReviewForm />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/reviews/user-reviews/`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer valid_token",
          }),
        })
      )
    );
  });


  it("renders the form fields correctly", async () => {
    render(
      <BrowserRouter>
        <ReviewForm />
      </BrowserRouter>
    );

    // Wait for the form to be fully rendered
    await waitFor(() => {
      expect(screen.getByText("Submit Your Review")).toBeInTheDocument();
    }, { timeout: 10000 });

    // Check all form fields
    expect(screen.getByLabelText("School *")).toBeInTheDocument();
    expect(screen.getByLabelText("Sport *")).toBeInTheDocument();
    expect(screen.getByLabelText("Head Coach's Name *")).toBeInTheDocument();
    expect(screen.getByText(/Head Coach\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Assistant Coaches\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Team Culture\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Campus Life\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Athletic Facilities\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Athletic Department\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Player Development\*/i)).toBeInTheDocument();
    expect(screen.getByText(/NIL Opportunity\*/i)).toBeInTheDocument();
    expect(screen.getByText("Submit Review")).toBeInTheDocument();
  }, 10000);

  it("updates form inputs correctly", async () => {
    render(
      <BrowserRouter>
        <ReviewForm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText("Head Coach's Name *"), { target: { value: "John Doe" } });
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

  it("prevents duplicate reviews for same school and coach", async () => {
    // Mock the fetch response for user reviews to simulate an existing review
    global.fetch = vi.fn((url, options) => {
      if (url.includes("/api/reviews/user-reviews/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              review_id: "123e4567-e89b-12d3-a456-426614174000",
              school: 1,
              user: 1,
              sport: "Men's Basketball",
              head_coach_name: "John Duck",
              review_message: "Great experience!",
              head_coach: 4,
              assistant_coaches: 4,
              team_culture: 5,
              campus_life: 5,
              athletic_facilities: 5,
              athletic_department: 4,
              player_development: 5,
              nil_opportunity: 3,
              created_at: "2024-02-14T00:00:00Z",
              updated_at: "2024-02-14T00:00:00Z"
            }
          ]),
        });
      }
      if (url.includes("/api/schools/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              school_name: "Test School",
              mbb: true,
              wbb: false,
              fb: false,
              conference: "Test Conference",
              location: "Test Location"
            }
          ]),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <BrowserRouter>
        <ReviewForm />
      </BrowserRouter>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByLabelText("School *")).toBeInTheDocument();
    }, { timeout: 5000 });

    // Select school
    const schoolDropdown = screen.getByLabelText("School *");
    await act(async () => {
      fireEvent.mouseDown(schoolDropdown);
    });

    await waitFor(() => {
      expect(screen.getByText("Test School")).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText("Test School"));
    });

    // Select sport
    const sportDropdown = screen.getByLabelText("Sport *");
    await act(async () => {
      fireEvent.mouseDown(sportDropdown);
    });

    await waitFor(() => {
      expect(screen.getByText("Men's Basketball")).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText("Men's Basketball"));
    });

    // Enter coach name
    const coachInput = screen.getByLabelText("Head Coach's Name *");
    await act(async () => {
      fireEvent.change(coachInput, { target: { value: "John Duck" } });
    });

    // Fill in ratings
    const ratingFields = [
      { name: "head_coach", value: 8 },
      { name: "assistant_coaches", value: 7 },
      { name: "team_culture", value: 9 },
      { name: "campus_life", value: 8 },
      { name: "athletic_facilities", value: 9 },
      { name: "athletic_department", value: 7 },
      { name: "player_development", value: 8 },
      { name: "nil_opportunity", value: 7 },
    ];

    for (const field of ratingFields) {
      const ratingComponent = screen.getByTestId(`rating-${field.name}`);
      const ratingButtons = within(ratingComponent).queryAllByRole("radio");
      await act(async () => {
        fireEvent.click(ratingButtons[field.value - 1]);
      });
    }

    // Fill in review message
    const reviewMessage = screen.getByLabelText("Share additional thoughts on your experience. *");
    await act(async () => {
      fireEvent.change(reviewMessage, { target: { value: "This is a test review" } });
    });

    // Submit the form
    const submitButton = screen.getByText("Submit Review");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify error message appears
    await waitFor(() => {
      expect(
        screen.getByText("You have already submitted a review for this school, sport, and head coach.")
      ).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify the form wasn't submitted
    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/reviews/review-form/"),
      expect.any(Object)
    );
  }, 30000);

  it("disables submit on incomplete forms", async () => {
    // Mock the fetch response for schools
    global.fetch = vi.fn((url, options) => {
      if (url.includes("/api/schools/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              school_name: "Test School",
              mbb: true,
              wbb: false,
              fb: false,
              conference: "Test Conference",
              location: "Test Location"
            }
          ]),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <BrowserRouter>
        <ReviewForm />
      </BrowserRouter>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByLabelText("School *")).toBeInTheDocument();
    }, { timeout: 5000 });

    // Select school
    const schoolDropdown = screen.getByLabelText("School *");
    await act(async () => {
      fireEvent.mouseDown(schoolDropdown);
    });

    await waitFor(() => {
      expect(screen.getByText("Test School")).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText("Test School"));
    });

    // Select sport
    const sportDropdown = screen.getByLabelText("Sport *");
    await act(async () => {
      fireEvent.mouseDown(sportDropdown);
    });

    await waitFor(() => {
      expect(screen.getByText("Men's Basketball")).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText("Men's Basketball"));
    });

    // Enter coach name
    const coachInput = screen.getByLabelText("Head Coach's Name *");
    await act(async () => {
      fireEvent.change(coachInput, { target: { value: "John Doe" } });
    });

    // Verify the submit button is disabled
    const submitButton = screen.getByText("Submit Review");
    expect(submitButton).toBeDisabled();
  }, 30000);

  it("handles form submission", async () => {
  render(
    <BrowserRouter>
      <ReviewForm />
    </BrowserRouter>
  );

  // Fill out all required fields

  // School dropdown
  fireEvent.mouseDown(screen.getByLabelText("School *"));
  await waitFor(() => screen.getByText("Test School"));
  fireEvent.click(screen.getByText("Test School"));

  // Sport dropdown
  fireEvent.mouseDown(screen.getByLabelText("Sport *"));
  await waitFor(() => screen.getByText("Men's Basketball"));
  fireEvent.click(screen.getByText("Men's Basketball"));

  // Head Coach's Name
  fireEvent.change(screen.getByLabelText("Head Coach's Name *"), {
    target: { value: "John Doey" },
  });

  const ratingFields = [
    { name: "head_coach", value: 8 },
    { name: "assistant_coaches", value: 7 },
    { name: "team_culture", value: 9 },
    { name: "campus_life", value: 8 },
    { name: "athletic_facilities", value: 9 },
    { name: "athletic_department", value: 7 },
    { name: "player_development", value: 8 },
    { name: "nil_opportunity", value: 7 },
  ];

    ratingFields.forEach((field) => {
    // Find the rating component using data-testid
    const ratingComponent = screen.getByTestId(`rating-${field.name}`);

    const ratingButtons = within(ratingComponent).queryAllByRole("radio");

    // Click the button corresponding to the desired rating value
    fireEvent.click(ratingButtons[field.value - 1]); // Click the correct rating option // Ratings are 1-based, buttons are 0-based
  });

  // Fill out the additional thoughts text field
  fireEvent.change(screen.getByLabelText("Share additional thoughts on your experience. *"), {
    target: { value: "This is a great program!" },
  });

    // Click submit
  fireEvent.click(screen.getByText("Submit Review"));

  // Wait for the confirmation dialog to appear
  await waitFor(() => {
  expect(within(document.body).getByText("Confirm Submission")).toBeInTheDocument();
});

  // Click "Confirm" in the dialog
      await waitFor(() => {
  fireEvent.click(screen.getByText("Confirm"))
        });

}, 100000);
});