import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { UserProvider, useUser } from "../../context/UserContext";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// Dummy consumer for testing the context
function TestComponent() {
  const { user, fetchUser, updateProfilePic, profilePic, logout, isLoggedIn } = useUser();

  return (
    <div>
      <div data-testid="profile-pic">{profilePic}</div>
      <div data-testid="user-name">{user?.first_name || "No user"}</div>
      <div data-testid="login-status">{isLoggedIn ? "Logged In" : "Logged Out"}</div>
      <button onClick={fetchUser}>Fetch User</button>
      <button onClick={() => updateProfilePic("pic2.png")}>Change Pic</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Utility render wrapper
function renderWithUserProvider() {
  return render(
    <MemoryRouter>
      <UserProvider>
        <TestComponent />
      </UserProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("UserContext", () => {
  it("uses default profile picture if none exists", () => {
    renderWithUserProvider();

    const imgPath = screen.getByTestId("profile-pic").textContent;
    expect(imgPath).toMatch(/\/assets\/profile-pictures\/pic1\.png/);
  });

  it("fetches user and updates state", async () => {
    const mockUser = {
      first_name: "Anna",
      profile_picture: "pic3.png"
    };

    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
    ));

    localStorage.setItem("token", "valid");

    renderWithUserProvider();

    await userEvent.click(screen.getByText("Fetch User"));

    expect(await screen.findByText("Anna")).toBeInTheDocument();
    expect(screen.getByTestId("profile-pic").textContent).toMatch(/pic3\.png/);
  });

  it("updates profile picture and refetches user", async () => {
    const mockUser = {
      first_name: "Anna",
      profile_picture: "pic2.png"
    };

    const fetchMock = vi.fn((url, options) => {
      if (url.includes("/update-profile-picture")) {
        return Promise.resolve({ ok: true });
      }

      // Simulate fetchUser call
      if (url.includes("/users/user")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser),
        });
      }

      return Promise.reject("Unexpected call");
    });

    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("token", "valid");

    renderWithUserProvider();

    await userEvent.click(screen.getByText("Change Pic"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-pic").textContent).toMatch(/pic2\.png/);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/update-profile-picture"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ profile_picture: "pic2.png" }),
      })
    );
  });

  it("handles token expiration correctly", async () => {
    // Set up a token
    localStorage.setItem("token", "valid_token");

    // Mock fetch to return 401 Unauthorized
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: "Token has expired" }),
      })
    ));

    renderWithUserProvider();

    // Initially should be logged in because token exists
    expect(screen.getByTestId("login-status").textContent).toBe("Logged In");

    // Trigger fetchUser which will get a 401
    await userEvent.click(screen.getByText("Fetch User"));

    // After 401, should be logged out
    await waitFor(() => {
      expect(screen.getByTestId("login-status").textContent).toBe("Logged Out");
    });

    // Token should be removed
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("initializes isLoggedIn to true when token is present", () => {
    // Set up a token
    localStorage.setItem("token", "valid_token");

    renderWithUserProvider();

    // Should be logged in because token exists
    expect(screen.getByTestId("login-status").textContent).toBe("Logged In");
  });

  it("initializes isLoggedIn to false when token is missing", () => {
    // Make sure no token is present
    localStorage.clear();

    renderWithUserProvider();

    // Should be logged out because token is missing
    expect(screen.getByTestId("login-status").textContent).toBe("Logged Out");
  });
});