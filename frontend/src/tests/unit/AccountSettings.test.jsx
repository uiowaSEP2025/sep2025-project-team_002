// File: src/tests/unit/AccountSettings.test.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import AccountSettings from "../../account/AccountSettings.jsx";
import { UserProvider, useUser } from "../../context/UserContext.jsx";

// Mock the PasswordForm component to simulate password changing behavior.
// The mock renders two inputs (Current Password and New Password) and a "Submit" button,
// and calls onSubmit with dummy passwords when clicked.
vi.mock("../../account/PasswordForm.jsx", () => {
  return {
    useUser: vi.fn(() => ({
      profilePic: "",
      updateProfilePic: vi.fn(),
      logout: vi.fn(),
      user: { first_name: "Test", last_name: "User" }
    })),
    UserProvider: ({ children }) => <div>{children}</div>,
    __esModule: true,
    default: ({ onSubmit }) => (
      <div>
        <label>
          Current Password
          <input aria-label="Current Password" />
        </label>
        <label>
          New Password
          <input aria-label="New Password" />
        </label>
        <button onClick={() => onSubmit({ currentPassword: "oldPassword", newPassword: "newPassword" })}>
          Submit
        </button>
      </div>
    ),
  };
});

// Utility function to simulate a successful PATCH response when saving changes.
function mockPatchSuccess(message = "Account info updated successfully") {
  global.fetch = vi.fn((url, options) => {
    if (url.includes("/users/user/") && options?.method === "PATCH") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message }),
      });
    }
    return Promise.reject(new Error("Unexpected request"));
  });
}

// Helper function to render AccountSettings wrapped in MemoryRouter and UserProvider.
function renderWithRoutes(initialPath = "/account/settings") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <UserProvider>
        <Routes>
          <Route path="/account/settings" element={<AccountSettings />} />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/secure-home" element={<div data-testid="secure-home-page">Dashboard</div>} />
          <Route path="/account" element={<div data-testid="account-page">Account Page</div>} />
          <Route path="/user-preferences" element={<div data-testid="preferences-page">Preference Form</div>} />
        </Routes>
      </UserProvider>
    </MemoryRouter>
  );
}

// Mock the useUser hook so that we can control its return values in tests.
vi.mock("../../context/UserContext", () => {
  return {
    useUser: vi.fn(),
    // For testing purposes, a simple UserProvider that just renders its children.
    UserProvider: ({ children }) => <div>{children}</div>,
  };
});

describe("AccountSettings Page", () => {
  beforeEach(() => {
    // Simulate a logged-in state by setting a token.
    localStorage.setItem("token", "valid_token");

    // Default return values for useUser, including user profile details.
    useUser.mockReturnValue({
      profilePic: "/assets/profile-pictures/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        transfer_type: "transfer",
      },
      fetchUser: vi.fn(),
      loading: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // Test 1: If no token exists, form submission should redirect to "/login".
  it("redirects to /login if no token is found when submitting the form", async () => {
    localStorage.removeItem("token");

    render(
      <MemoryRouter initialEntries={["/account/settings"]}>
        <UserProvider>
          <Routes>
            <Route path="/account/settings" element={<AccountSettings />} />
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          </Routes>
        </UserProvider>
      </MemoryRouter>
    );

    const saveButton = await screen.findByRole("button", { name: /save changes/i });
    await userEvent.click(saveButton);

    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
  });

  // Test 2: The form should render with prefilled user data from the context.
  it("renders with prefilled user data from context", async () => {
    renderWithRoutes();

    expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();

    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
  });

  // Test 3: Simulate user editing data and sending a successful PATCH request.
  it("successfully changes data when updated", async () => {
    renderWithRoutes();

    expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const emailInput = screen.getByLabelText(/Email/i);

    // Simulate user editing.
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Jane");

    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, "Smith");

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "jane.smith@test.edu");

    expect(firstNameInput).toHaveValue("Jane");
    expect(lastNameInput).toHaveValue("Smith");
    expect(emailInput).toHaveValue("jane.smith@test.edu");

    // Spy on the PATCH request.
    const mockPatch = vi.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Account info updated successfully" }),
      })
    );

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await userEvent.click(saveButton);

    expect(await screen.findByText(/Account info updated successfully/i)).toBeInTheDocument();

    expect(mockPatch).toHaveBeenCalledWith(
      expect.stringContaining("/users/user/"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@test.edu",
          transfer_type: "transfer",
        }),
      })
    );

    mockPatch.mockRestore();
  });

  // Test 4: Clicking "Change Password" button should open the password change dialog.
  it("opens the change password form", async () => {
    renderWithRoutes();

    expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();

    const changePasswordButton = screen.getByRole("button", { name: /change password/i });
    expect(changePasswordButton).toBeInTheDocument();

    await userEvent.click(changePasswordButton);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Change Password")).toBeInTheDocument();
  });

  // Test 5: Clicking on a profile picture option calls updateProfilePic to update the profile.
  it("updates profile picture when an image is clicked", async () => {
    const mockUpdateProfilePic = vi.fn();

    useUser.mockReturnValue({
      profilePic: "/assets/profile-pictures/pic1.png",
      updateProfilePic: mockUpdateProfilePic,
      user: {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        transfer_type: "transfer",
      },
      fetchUser: vi.fn(),
      loading: false,
    });

    renderWithRoutes();

    expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();

    // Assuming the button for the second profile picture has alt text "Profile 2".
    const profile2Button = screen.getByRole("button", { name: /profile 2/i });
    await userEvent.click(profile2Button);

    // The updateProfilePic function is expected to be called with "pic2.png".
    expect(mockUpdateProfilePic).toHaveBeenCalledWith("pic2.png");
  });

  // Test 6: Validate that all expected sidebar menu items are present.
  it("displays the complete menu list", async () => {
    renderWithRoutes();

    expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();

    expect(await screen.findByText(/Return to Dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/Account Info/i)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /account settings/i })).toBeInTheDocument();
    expect(await screen.findByText(/Logout/i)).toBeInTheDocument();
  });

  // Test 7: Verify real-time email validation - show error message for an invalid email.
  it("shows email validation error if email is invalid", async () => {
    renderWithRoutes();
    const emailInput = screen.getByLabelText(/Email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "invalidEmail");
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
  });

  // Test 8: Simulate a failed PATCH request that returns a JSON error.
  it("displays error message on failed account update with JSON error", async () => {
    renderWithRoutes();
    const errorMessage = "Bad Request";
    vi.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: errorMessage }),
      })
    );
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await userEvent.click(saveButton);
    expect(await screen.findByText(`Update failed: ${errorMessage}`)).toBeInTheDocument();
  });

  // Test 9: Simulate a failed PATCH request that returns HTML (non-JSON) content.
  it("displays error message on failed account update with HTML error page", async () => {
    renderWithRoutes();
    vi.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.reject(new Error("Invalid JSON")),
        text: () => Promise.resolve("<html>Error</html>"),
      })
    );
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await userEvent.click(saveButton);
    expect(await screen.findByText(/Update failed: Server returned an unexpected error page./i)).toBeInTheDocument();
  });

  // Test 10: Simulate network errors (e.g., failed connection) when saving changes.
  it("handles network error during save changes", async () => {
    renderWithRoutes();
    vi.spyOn(global, "fetch").mockImplementationOnce(() => Promise.reject(new Error("Failed to fetch")));
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await userEvent.click(saveButton);
    expect(await screen.findByText(/Unable to reach server. Check your connection./i)).toBeInTheDocument();
  });

  // Test 11: Handle successful password change when PasswordForm submits.
  it("handles successful password change", async () => {
    renderWithRoutes();

    const changePasswordButton = screen.getByRole("button", { name: /change password/i });
    await userEvent.click(changePasswordButton);

    vi.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Password changed successfully" }),
      })
    );
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    // Verify the success message is displayed.
    expect(await screen.findByText(/Password changed successfully/i)).toBeInTheDocument();

    // Wait for the dialog to be removed due to exit transition.
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  // Test 12: Handle failed password change where the server returns an error.
  it("handles failed password change", async () => {
    renderWithRoutes();

    const changePasswordButton = screen.getByRole("button", { name: /change password/i });
    await userEvent.click(changePasswordButton);

    const errorDetail = "Current password is incorrect";
    vi.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: errorDetail }),
      })
    );
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(errorDetail)).toBeInTheDocument();
    // The dialog should still remain open.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // Test 13: Clicking the cancel button should close the password dialog.
  it("closes password dialog when clicking cancel", async () => {
    renderWithRoutes();

    const changePasswordButton = screen.getByRole("button", { name: /change password/i });
    await userEvent.click(changePasswordButton);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    // Find the cancel button by matching the exact text "Cancel".
    const cancelButton = screen.getByRole("button", { name: /^cancel$/i });
    await userEvent.click(cancelButton);

    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  // Test 14: If the profile image fails to load, it should fallback to the default image.
  it("replaces broken profile image with fallback", async () => {
    renderWithRoutes();

    // Trigger the onError event for the profile image.
    const selectedImage = await screen.findByAltText("Selected Profile");
    fireEvent.error(selectedImage);
    // After error, the src should contain the fallback image path.
    expect(selectedImage.src).toContain("/assets/profile-pictures/pic1.png");
  });

  // Test 15: Clicking "Return to Dashboard" in the sidebar navigates to the Dashboard page.
  it("navigates to dashboard when clicking 'Return to Dashboard'", async () => {
    renderWithRoutes();

    const returnButton = screen.getByText(/Return to Dashboard/i);
    await userEvent.click(returnButton);
    expect(await screen.findByTestId("secure-home-page")).toBeInTheDocument();
  });

  // Test 16: Clicking "Logout" clears the token and navigates to the login page.
  it("logs out and navigates to login page on clicking Logout", async () => {
    localStorage.setItem("token", "valid_token");

    useUser.mockReturnValue({
      user: {
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        transfer_type: "transfer_in",
      },
      logout: vi.fn(() => localStorage.removeItem("token")),
      updateProfilePic: vi.fn(),
      profilePic: "/assets/profile-pictures/pic1.png",
      loading: false,
      fetchUser: vi.fn(),
    });

    renderWithRoutes();

    const logoutButton = screen.getByText(/Logout/i);
    await userEvent.click(logoutButton);

    expect(localStorage.getItem("token")).toBeNull();
    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
  });

  // Test 17: If the user is not "graduate", the "Completed Preference Form" menu item should be displayed and clickable.
  it("displays 'Completed Preference Form' menu item for non-graduate users", async () => {
    // Set transfer_type other than "graduate" (e.g., "transfer_in")
    useUser.mockReturnValue({
      profilePic: "/assets/profile-pictures/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        transfer_type: "transfer_in",
      },
      fetchUser: vi.fn(),
      loading: false,
    });

    renderWithRoutes();

    const prefFormButton = await screen.findByText(/Completed Preference Form/i);
    expect(prefFormButton).toBeInTheDocument();

    await userEvent.click(prefFormButton);
    expect(await screen.findByTestId("preferences-page")).toBeInTheDocument();
  });
});