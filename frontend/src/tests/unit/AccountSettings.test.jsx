import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from '@testing-library/user-event';
import { useUser } from "../../context/UserContext.jsx";


import AccountSettings from "../../account/AccountSettings.jsx";
import { UserProvider } from "../../context/UserContext.jsx";

// Utility mocks
function mockSuccessfulFetch(data) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
}

vi.mock("../../context/UserContext", () => {
  return {
    useUser: vi.fn(() => ({
      profilePic: "",
      updateProfilePic: vi.fn(),
      logout: vi.fn(),
      user: { first_name: "Test", last_name: "User" }
    })),
    UserProvider: ({ children }) => <div>{children}</div>,
  };
});

function mockPatchSuccess(message = "Success") {
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

function renderWithRoutes() {
  return render(
    <MemoryRouter initialEntries={["/settings"]}>
      <UserProvider>
        <Routes>
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </UserProvider>
    </MemoryRouter>
  );
}

describe("AccountSettings Page", () => {
    beforeEach(() => {
         localStorage.setItem("token", "valid_token");

  useUser.mockReturnValue({
    profilePic: "/assets/profile-pictures/pic1.png",
    updateProfilePic: vi.fn(),
  });
    });

    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("redirects to /login if no token is found", () => {
        localStorage.removeItem("token");

        render(
            <MemoryRouter initialEntries={["/settings"]}>
                <UserProvider>
                    <Routes>
                        <Route path="/settings" element={<AccountSettings/>}/>
                        <Route path="/login" element={<div>Login Page</div>}/>
                    </Routes>
                </UserProvider>
            </MemoryRouter>
        );

        expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
    });

    it("renders with prefilled user data", async () => {
        mockSuccessfulFetch({
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            transfer_type: "transfer",
        });

        renderWithRoutes();

        expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();

        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    });

    it("successfully changes data when updated", async () => {
          mockSuccessfulFetch({
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            transfer_type: "transfer",
          });

          renderWithRoutes(<AccountSettings />); // Remove UserProvider from here since it's already in the component

          expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();
          expect(screen.getByDisplayValue("John")).toBeInTheDocument();

          // Get inputs by their displayed label text
          const firstNameInput = screen.getByLabelText(/First Name/i);
          const lastNameInput = screen.getByLabelText(/Last Name/i);
          const emailInput = screen.getByLabelText(/Email/i);


          await userEvent.clear(firstNameInput);
          await userEvent.type(firstNameInput, "Jane");

          await userEvent.clear(lastNameInput);
          await userEvent.type(lastNameInput, "Smith");

          await userEvent.clear(emailInput);
          await userEvent.type(emailInput, "jane.smith@test.edu");
          // Verify the input value changed
          expect(lastNameInput).toHaveValue("Smith");
          expect(firstNameInput).toHaveValue("Jane");
          expect(emailInput).toHaveValue("jane.smith@test.edu");

          // Mock PATCH request for saving changes
          const mockPatch = vi.spyOn(global, "fetch").mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ message: "Account info updated successfully" }),
            })
          );

          // Submit the form
          const saveButton = screen.getByRole("button", { name: /save changes/i });
          await userEvent.click(saveButton);

          // Wait for success message to appear
          expect(await screen.findByText(/Account info updated successfully/i)).toBeInTheDocument();

          // Verify the mock was called with the correct data
          expect(mockPatch).toHaveBeenCalledWith(
            expect.stringContaining("/users/user/"),
            expect.objectContaining({
              method: "PATCH",
              body: JSON.stringify({
                first_name: "Jane",
                last_name: "Smith",
                email: "jane.smith@test.edu",
                transfer_type: "transfer"
              })
            })
          );

          // Restore fetch
          mockPatch.mockRestore();
        });

    it("opens the change password form", async () => {
        mockSuccessfulFetch({
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            transfer_type: "transfer",
        });

        renderWithRoutes();

        expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();

        expect(await screen.findByText(/Change Password/i)).toBeInTheDocument();

        const changePasswordButton = screen.getByRole("button", { name: /change password/i });
        await userEvent.click(changePasswordButton);
    });


    it("updates profile picture when an image is clicked", async () => {
          const mockUpdateProfilePic = vi.fn();

          // Mock the useUser hook
          useUser.mockReturnValue({
            profilePic: "/assets/profile-pictures/pic1.png",
            updateProfilePic: mockUpdateProfilePic,
          });

          mockSuccessfulFetch({
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            transfer_type: "transfer",
          });

          renderWithRoutes();

          expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();

          const profile2Button = screen.getByRole("button", { name: /profile 2/i });
          await userEvent.click(profile2Button);

          expect(mockUpdateProfilePic).toHaveBeenCalledWith("pic2.png");
        });

    it("the menu list with all items is present", async() => {
            mockSuccessfulFetch({
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            transfer_type: "transfer",
            });

            renderWithRoutes();

            expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();

            expect(await screen.findByText(/Return to Dashboard/i)).toBeInTheDocument();
            expect(await screen.findByText(/Account Info/i)).toBeInTheDocument();
            expect(await screen.findByRole("button", { name: /account settings/i,}));
            // expect(await screen.findByText(/Completed Preference Form/i)).toBeInTheDocument();
            expect(await screen.findByText(/Logout/i)).toBeInTheDocument();
        })
});