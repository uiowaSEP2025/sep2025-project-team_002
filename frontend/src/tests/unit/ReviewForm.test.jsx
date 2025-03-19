import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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
            { school: 1, sport: "Basketball", head_coach_name: "John Duck" } // Mock duplicate review
        ]), // Mock empty reviews
      });
    }

    if (url.includes("/api/schools/")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, school_name: "Test School", available_sports: ["Basketball"] }
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
  });

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
      // screen.debug();
    expect(await screen.findByText("Submit Your Review")).toBeInTheDocument();
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
  });

  it("updates form inputs correctly", async () => {
    render(
      <BrowserRouter>
        <ReviewForm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText("Head Coach's Name *"), { target: { value: "John Doe" } });
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

it("prevents duplicate reviews", async () => {
  render(
    <BrowserRouter>
      <ReviewForm />
    </BrowserRouter>
  );

  // Open the school dropdown and select "Test School"
  fireEvent.mouseDown(screen.getByRole("combobox", { name: /School/i })); // Use role for dropdown
  await waitFor(() => screen.getByText("Test School")); // Ensure option is visible
  fireEvent.click(screen.getByText("Test School")); // Selects the option

  // Open the sport dropdown and select "Basketball"
  fireEvent.mouseDown(screen.getByRole("combobox", { name: /Sport/i })); // Use role for dropdown
  await waitFor(() => screen.getByText("Basketball"));
  fireEvent.click(screen.getByText("Basketball"));

  // Fill in head coach's name
  fireEvent.change(screen.getByRole("textbox", { name: /Head Coach/i }), {
    target: { value: "John Duck" },
  });

  // Click submit
  fireEvent.click(screen.getByText("Submit Review"));

  // Check for error message
  await waitFor(() =>
  expect(
    screen.getByText("You have already submitted a review for this school, sport, and head coach.")
  ).toBeInTheDocument()
);
});


  it("disables submit on incomplete forms", async () => {
  render(
    <BrowserRouter>
      <ReviewForm />
    </BrowserRouter>
  );

  // Open the school dropdown and select "Test School"
  fireEvent.mouseDown(screen.getByLabelText("School *"));
  await waitFor(() => screen.getByText("Test School"));
  fireEvent.click(screen.getByText("Test School"));

  // Open the sport dropdown and select "Basketball"
  fireEvent.mouseDown(screen.getByLabelText("Sport *"));
  await waitFor(() => screen.getByText("Basketball"));
  fireEvent.click(screen.getByText("Basketball"));

  // Fill in head coach's name
  fireEvent.change(screen.getByLabelText("Head Coach's Name *"), {
    target: { value: "John Doe" },
  });

  // Click submit
  fireEvent.click(screen.getByText("Submit Review"));

  // Verify the form submission
await waitFor(() => {
  const button = screen.getByRole("button", { name: /submit review/i });
  expect(button).toBeDisabled(); // Check if the button is disabled
});
}, 100000);

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
  await waitFor(() => screen.getByText("Basketball"));
  fireEvent.click(screen.getByText("Basketball"));

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
