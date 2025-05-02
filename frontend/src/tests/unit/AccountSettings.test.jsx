// File: src/tests/unit/AccountSettings.test.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, fireEvent, waitForElementToBeRemoved, act, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import AccountSettings from "../../account/AccountSettings.jsx";
import { UserProvider, useUser } from "../../context/UserContext.jsx";
import Dialog from '@mui/material/Dialog';

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
    const profile2Img = screen.getByAltText(/profile 2/i);
    await userEvent.click(profile2Img);

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

  it("logs out and navigates to login on 401 when saving changes", async () => {
    // ensure useUser always returns our mockLogout
    const mockLogout = vi.fn();
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
        transfer_type: ""
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: mockLogout
    });

    // fetch returns 401
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });

    renderWithRoutes();
    const saveBtn = await screen.findByRole("button", { name: /save changes/i });
    await userEvent.click(saveBtn);

    // first, we should see the login page rendered
    expect(await screen.findByTestId("login-page")).toBeInTheDocument();

    // then logout() must have been called
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it("displays 'Email already in use' on body stream error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("body stream already read"));

    renderWithRoutes();
    const saveBtn = await screen.findByRole("button", { name: /save changes/i });
    await userEvent.click(saveBtn);

    expect(
      await screen.findByText("Update failed: Email already in use")
    ).toBeInTheDocument();
  });

  it("handles generic network errors when saving changes", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Something went wrong"));

    renderWithRoutes();
    const saveBtn = await screen.findByRole("button", { name: /save changes/i });
    await userEvent.click(saveBtn);

    expect(
      await screen.findByText(/Network error: Something went wrong/i)
    ).toBeInTheDocument();
  });

  it("redirects to login on 401 when changing password", async () => {
    // ensure useUser always returns our mockLogout
    const mockLogout = vi.fn();
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
        transfer_type: ""
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: mockLogout
    });

    renderWithRoutes();
    // open dialog
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));

    // now mock the change-password POST to return 401
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });

    // submit the form
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    // first, login page must render
    expect(await screen.findByTestId("login-page")).toBeInTheDocument();

    // then logout() was called
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it("shows connection error when password change fetch fails", async () => {
    useUser.mockReturnValueOnce({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "" },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Failed to fetch"));

    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText(/Unable to reach server\. Check your connection\./i)
    ).toBeInTheDocument();
  });

  it("navigates to /account/my-reviews when 'My Reviews' is clicked", async () => {
      useUser.mockReturnValueOnce({
        profilePic: "/pic1.png",
        updateProfilePic: vi.fn(),
        user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "transfer" },
        fetchUser: vi.fn(),
        loading: false,
        logout: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={["/account/settings"]}>
          <UserProvider>
            <Routes>
              <Route path="/account/settings" element={<AccountSettings />} />
              <Route
                path="/account/my-reviews"
                element={<div data-testid="reviews-page">Reviews</div>}
              />
            </Routes>
          </UserProvider>
        </MemoryRouter>
      );

      await userEvent.click(screen.getByText("My Reviews"));
      expect(await screen.findByTestId("reviews-page")).toBeInTheDocument();
    });

  it("applies fadeIn styles after mount", () => {
    vi.useFakeTimers();

    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
        transfer_type: ""
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn()
    });

    renderWithRoutes();

    // grab the <h4 id="account-settings-title">
    const heading = screen.getByText(
      /Account Settings/i,
      { selector: "#account-settings-title" }
    );
    // the fadeIn wrapper is two levels up
    const fadeBox = heading.parentElement.parentElement;
    expect(fadeBox).toHaveStyle("opacity: 0");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(fadeBox).toHaveStyle("opacity: 1");

    vi.useRealTimers();
  });

  it("does not show 'Invalid email address' once the email becomes valid", async () => {
    renderWithRoutes();

    const emailInput = screen.getByLabelText(/Email/i);

    // first type something invalid
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "not-an-email");
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();

    // then type a valid email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "valid@test.com");
    expect(screen.queryByText("Invalid email address")).toBeNull();
  });

  it("calls fetchUser after a successful account info update", async () => {
    const mockFetchUser = vi.fn();
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "" },
      fetchUser: mockFetchUser,
      loading: false,
      logout: vi.fn(),
    });

    // mock PATCH success
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "okay" }),
    });

    renderWithRoutes();

    const saveBtn = await screen.findByRole("button", { name: /save changes/i });
    await userEvent.click(saveBtn);

    // wait for the success message
    expect(await screen.findByText(/Account info updated successfully/i)).toBeInTheDocument();
    expect(mockFetchUser).toHaveBeenCalled();
  });

  it("shows generic network error if change-password fetch throws a non-fetch error", async () => {
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "" },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));

    // simulate some other error
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Unexpected failure"));

    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    // the main Alert (outside the dialog) should show this
    expect(
      await screen.findByText("Network error: Unexpected failure")
    ).toBeInTheDocument();
  });

  it("navigates to /account when the sidebar 'Account Info' is clicked", async () => {
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "" },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/account/settings"]}>
        <UserProvider>
          <Routes>
            <Route path="/account/settings" element={<AccountSettings />} />
            <Route path="/account" element={<div data-testid="account-page">Account Home</div>} />
          </Routes>
        </UserProvider>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText("Account Info"));
    expect(await screen.findByTestId("account-page")).toBeInTheDocument();
  });

  it("invokes the 'Account Settings' nav callback", async () => {
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "" },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();

    // clicking "Account Settings" should simply keep us on settings
    const settingsBtn = screen.getByRole("button", { name: /account settings/i });
    await userEvent.click(settingsBtn);

    // we should still see the Account Settings title
    expect(screen.getByRole("heading", { name: /Account Settings/i })).toBeInTheDocument();
  });

  it("displays a success Alert with the correct severity on successful save", async () => {
    const mockFetchUser = vi.fn();
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "" },
      fetchUser: mockFetchUser,
      loading: false,
      logout: vi.fn(),
    });

    // mock PATCH success
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Account info updated successfully" }),
    });

    renderWithRoutes();

    // click Save Changes
    const saveBtn = await screen.findByRole("button", { name: /save changes/i });
    await userEvent.click(saveBtn);

    // Alert should appear
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Account info updated successfully");
    // MUI success variant applies 'MuiAlert-filledSuccess'
    expect(alert).toHaveClass("MuiAlert-filledSuccess");
    // fetchUser should have been called
    expect(mockFetchUser).toHaveBeenCalled();
  });

  it("returns focus to 'Change Password' button after dialog close", async () => {
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "" },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();

    // open the password dialog
    const changePasswordBtn = screen.getByRole("button", { name: /change password/i });
    await userEvent.click(changePasswordBtn);

    // close via Cancel
    const cancelBtn = await screen.findByRole("button", { name: /^cancel$/i });
    await userEvent.click(cancelBtn);

    // wait for dialog removal (TransitionProps.onExited should fire)
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));

    // now the Change Password button should have focus
    expect(changePasswordBtn).toHaveFocus();
  });

  it("calls fetchUser and shows a success Alert on successful save", async () => {
    const mockFetchUser = vi.fn();
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "" },
      fetchUser: mockFetchUser,
      loading: false,
      logout: vi.fn(),
    });

    // Mock PATCH success
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Account info updated successfully" }),
    });

    renderWithRoutes();

    const saveBtn = await screen.findByRole("button", { name: /save changes/i });
    await userEvent.click(saveBtn);

    // Alert appears with the message and success variant
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Account info updated successfully");
    expect(alert).toHaveClass("MuiAlert-filledSuccess");

    // fetchUser was called
    expect(mockFetchUser).toHaveBeenCalled();
  });

  it("displays Avatar with user initial when no profilePic is set", async () => {
    // override the default mock
    useUser.mockReturnValue({
      profilePic: "",                  // <-- empty
      updateProfilePic: vi.fn(),
      user: {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        transfer_type: "transfer",
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();

    // The <img> should NOT be in the document
    expect(screen.queryByAltText("Selected Profile")).toBeNull();
    // Instead we should see the Avatar with initial "J"
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  // New Test: redirect to /login if no token when changing password
  it("redirects to /login if no token is found when changing password", async () => {
    localStorage.removeItem("token");
    renderWithRoutes();

    const changePasswordBtn = await screen.findByRole("button", { name: /change password/i });
    await userEvent.click(changePasswordBtn);

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
  });

  // New Test: absence of 'Completed Preference Form' for graduate users
  it("does not display 'Completed Preference Form' menu item for graduate users", async () => {
    useUser.mockReturnValue({
      profilePic: "/assets/profile-pictures/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@smith.com",
        transfer_type: "graduate",     // <-- graduate
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();
    expect(screen.queryByText(/Completed Preference Form/i)).toBeNull();
  });

  // New Test: absence of 'My Reviews' for high_school transfer type
  it("does not display 'My Reviews' menu item for high school transfer type", async () => {
    useUser.mockReturnValue({
      profilePic: "/assets/profile-pictures/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@smith.com",
        transfer_type: "high_school",  // <-- high_school
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();
    expect(screen.queryByText(/My Reviews/i)).toBeNull();
  });

  it("initializes form inputs from user context on first render only", async () => {
    // mock useUser so formData starts empty, then would be filled by the effect
    useUser.mockReturnValue({
      profilePic: "/assets/profile-pictures/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "First",
        last_name:  "Last",
        email:      "first.last@x.com",
        transfer_type: "transfer_in"
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();

    // after mount, those inputs should show the user values
    expect(await screen.findByDisplayValue("First")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Last")).toBeInTheDocument();
    expect(screen.getByDisplayValue("first.last@x.com")).toBeInTheDocument();

    // Now simulate a change in user context—if the effect didn't guard, these would update
    useUser.mockReturnValueOnce({
      profilePic: "/assets/profile-pictures/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "Changed",
        last_name:  "User",
        email:      "changed@x.com",
        transfer_type: "transfer_in"
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });
    // rerender with new context
    renderWithRoutes("/account/settings");

    // but inputs must remain the *original* values
    expect(screen.getByDisplayValue("First")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Last")).toBeInTheDocument();
    expect(screen.getByDisplayValue("first.last@x.com")).toBeInTheDocument();
  });

  // —— cover line 223: generic network‐error branch in change-password catch
  it("shows generic network error if password change throws a non-fetch error", async () => {
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "A", last_name: "B", email: "a@b.com", transfer_type: "" },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();

    // open the dialog
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));

    // now make fetch reject with a non-fetch error
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Something weird"));

    // submit
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    // should display the outside Alert with that network message
    expect(
      await screen.findByText("Network error: Something weird")
    ).toBeInTheDocument();
  });

  // —— cover line 231: the graduate‐user omission of the "Completed Preference Form" item
  it("does not display 'Completed Preference Form' menu item for graduate users", async () => {
    useUser.mockReturnValue({
      profilePic: "/assets/profile-pictures/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "Grad",
        last_name:  "Student",
        email:      "grad@student.com",
        transfer_type: "graduate"    // <— triggers the `!== "graduate"` branch to skip
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();

    expect(screen.queryByText(/Completed Preference Form/i)).toBeNull();
  });

  // —— cover line 391: the onExited focus-return callback
  it("returns focus to 'Change Password' button after the dialog exits", async () => {
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: { first_name: "X", last_name: "Y", email: "x@y.com", transfer_type: "" },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();

    const changePasswordBtn = screen.getByRole("button", { name: /change password/i });
    // open & then cancel
    await userEvent.click(changePasswordBtn);
    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    // wait for the transition-unmount
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));

    // now focus must have been returned
    expect(changePasswordBtn).toHaveFocus();
  });

  it("renders the email input as type email", async () => {
    renderWithRoutes();
    const emailInput = await screen.findByLabelText(/Email/i);
    expect(emailInput).toHaveAttribute("type", "email");
  });

  // New Test: hide both 'Completed Preference Form' and 'My Reviews' when transfer_type is empty
  it("hides preference form and My Reviews when transfer_type is not set", () => {
    useUser.mockReturnValue({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "X",
        last_name: "Y",
        email: "x@y.com",
        transfer_type: ""      // ← ensure *both* calls see an empty string
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();
    expect(screen.queryByText(/Completed Preference Form/i)).toBeNull();
    expect(screen.queryByText(/My Reviews/i)).toBeNull();
  });

  // New Test: show 'My Reviews' for graduate users
  it("displays 'My Reviews' menu item for graduate users", () => {
    useUser.mockReturnValueOnce({
      profilePic: "/pic1.png",
      updateProfilePic: vi.fn(),
      user: {
        first_name: "Grad",
        last_name:  "Student",
        email:      "grad@student.com",
        transfer_type: "graduate"   // ← graduate
      },
      fetchUser: vi.fn(),
      loading: false,
      logout: vi.fn(),
    });

    renderWithRoutes();
    const reviewsItem = screen.getByText(/My Reviews/i);
    expect(reviewsItem).toBeInTheDocument();
  });

  // New Test: clear passwordError when closing & reopening the password dialog (covers the onClose + setPasswordError(""))
  it("clears password error when dialog is closed and reopened", async () => {
    renderWithRoutes();

    // open dialog
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));

    // simulate server-side error
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: "Server-side error" }),
    });

    // submit form inside dialog
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(await screen.findByText("Server-side error")).toBeInTheDocument();

    // close dialog
    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));

    // reopen dialog
    await userEvent.click(screen.getByRole("button", { name: /change password/i }));
    // error should no longer be present
    expect(screen.queryByText("Server-side error")).toBeNull();
  });

});