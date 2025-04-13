import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, vi, beforeEach, afterEach, describe, it } from "vitest";
import { BrowserRouter } from "react-router-dom";
import UserPreferences from "../../account/UserPreferences.jsx";
import API_BASE_URL from "../../utils/config.js";

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
            },
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

describe("UserPreferences Component", () => {
  it("renders user preferences correctly when data is available", async () => {
    render(
      <BrowserRouter>
        <UserPreferences />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Your Submitted Preferences")).toBeInTheDocument();
      expect(screen.getByText("Sport:")).toBeInTheDocument();
      expect(screen.getByText("Basketball")).toBeInTheDocument();
    });

    expect(screen.getByText("Head Coach:")).toBeInTheDocument();
    expect(screen.getByText("9/10")).toBeInTheDocument();
    expect(screen.getByText("Assistant Coaches:")).toBeInTheDocument();
    expect(screen.getByText("8/10")).toBeInTheDocument();
  });

  it("displays a dialog when no preferences exist", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));

    render(
      <BrowserRouter>
        <UserPreferences />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No Preferences Found")).toBeInTheDocument();
    });

    // Ensure button to redirect is present
    expect(screen.getByText("Go to Preference Form")).toBeInTheDocument();
  });

  it("redirects to login if token is missing", () => {
    localStorage.removeItem("token");

    render(
      <BrowserRouter>
        <UserPreferences />
      </BrowserRouter>
    );

    expect(navigateMock).toHaveBeenCalledWith("/login");
  });
});
