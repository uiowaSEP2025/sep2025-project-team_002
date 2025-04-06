import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { UserProvider, useUser } from "../../context/UserContext";
import userEvent from "@testing-library/user-event";

// Dummy consumer for testing the context
function TestComponent() {
  const { user, fetchUser, updateProfilePic, profilePic } = useUser();

  return (
    <div>
      <div data-testid="profile-pic">{profilePic}</div>
      <div data-testid="user-name">{user?.first_name || "No user"}</div>
      <button onClick={fetchUser}>Fetch User</button>
      <button onClick={() => updateProfilePic("pic2.png")}>Change Pic</button>
    </div>
  );
}

// Utility render wrapper
function renderWithUserProvider() {
  return render(
    <UserProvider>
      <TestComponent />
    </UserProvider>
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
});
