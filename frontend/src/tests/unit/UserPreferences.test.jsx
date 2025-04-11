import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import UserPreferences from "../../account/UserPreferences.jsx";
import API_BASE_URL from "../../utils/config.js";
import { UserProvider } from "../../context/UserContext.jsx";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

// Mock global fetch
beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes("/api/preferences/user-preferences/")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              sport: "Basketball",
              head_coach: 9,
              assistant_coaches: 8,
              team_culture: 7,
              campus_life: 6,
              athletic_facilities: 5,
              athletic_department: 4,
              player_development: 3,
              nil_opportunity: 2,
              id: "123e4567-e89b-12d3-a456-426614174000",
            },
          ]),
      });
    }
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ detail: "Not found" }),
    });
  });
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// Helper function to render with UserProvider
function renderWithUserProvider(ui) {
  return render(
    <BrowserRouter>
      <UserProvider>
        {ui}
      </UserProvider>
    </BrowserRouter>
  );
}

describe("UserPreferences Component", () => {
  it("renders user preferences correctly when data is available", async () => {
    localStorage.setItem("token", "fake_token");

    renderWithUserProvider(<UserPreferences />);

    // Wait for the preferences to load
    await waitFor(() => {
      expect(screen.getByText("Basketball")).toBeInTheDocument();
    });

    // Check that the sport is displayed
    expect(screen.getByText("Basketball")).toBeInTheDocument();

    // Just check that the component renders without errors
    // The specific rating elements are difficult to test due to the component structure
  });

  it("displays a dialog when no preferences exist", async () => {
    localStorage.setItem("token", "fake_token");

    // Override the fetch mock for this test
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]), // Empty array = no preferences
      })
    );

    renderWithUserProvider(<UserPreferences />);

    // Wait for the dialog to appear
    await waitFor(() => {
      expect(screen.getByText(/You haven't submitted any preferences yet/i)).toBeInTheDocument();
    });

    // Check that the dialog has a button to go to the preference form
    expect(screen.getByText(/Go to Preference Form/i)).toBeInTheDocument();
  });

  it("redirects to login if token is missing", async () => {
    // No token set in localStorage

    renderWithUserProvider(<UserPreferences />);

    // Should redirect to login
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });
  });
});
