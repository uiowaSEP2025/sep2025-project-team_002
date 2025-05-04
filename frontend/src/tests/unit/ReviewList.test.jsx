import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ReviewList from "../../components/ReviewList.jsx"; // adjust path as needed

// Optional: mock RatingRow
vi.mock("../../components/RatingRow", () => ({
  default: ({ label, value }) => <div>{label}: {value}</div>,
}));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ReviewList Component", () => {
  const schoolId = 1;
  const sport = "Basketball";

  it("displays loading state initially", () => {
    render(<ReviewList schoolId={schoolId} sport={sport} />);
    expect(screen.getByText("Loading reviews...")).toBeInTheDocument();
  });

  it("renders fetched reviews", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            head_coach_name: "Coach Smith",
            review_message: "Great program!",
            head_coach: 9,
            assistant_coaches: 8,
            team_culture: 7,
            campus_life: 6,
            athletic_facilities: 5,
            athletic_department: 4,
            player_development: 3,
            nil_opportunity: 2,
            created_at: "2025-05-01T00:00:00Z",
          },
        ]),
    });

    render(<ReviewList schoolId={schoolId} sport={sport} />);

    await waitFor(() => {
      expect(screen.getByText("Head Coach: Coach Smith")).toBeInTheDocument();
      expect(screen.getByText("Great program!")).toBeInTheDocument();
      expect(screen.getByText("Head Coach: 9")).toBeInTheDocument();
      expect(screen.getByText("Posted on 5/1/2025")).toBeInTheDocument(); // Adjust locale format if needed
    });
  });

  it("handles empty reviews", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<ReviewList schoolId={schoolId} sport={sport} />);

    await waitFor(() => {
      expect(screen.getByText("No reviews available")).toBeInTheDocument();
    });
  });

  it("displays error message on fetch failure", async () => {
    fetch.mockRejectedValueOnce(new Error("Fetch failed"));

    render(<ReviewList schoolId={schoolId} sport={sport} />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading reviews/i)).toBeInTheDocument();
      expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
    });
  });

  it("builds the correct fetch URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    global.fetch = mockFetch;

    render(<ReviewList schoolId={42} sport="Men's Soccer" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/reviews/school/42")
    );
    });
  });

  it("does not fetch if schoolId or sport is missing", async () => {
    const spy = vi.fn();
    global.fetch = spy;

    render(<ReviewList schoolId={null} sport="Basketball" />);
    render(<ReviewList schoolId={1} sport={null} />);

    await new Promise(r => setTimeout(r, 100)); // give time for useEffect

    expect(spy).not.toHaveBeenCalled();
  });
});
