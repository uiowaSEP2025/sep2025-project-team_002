import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

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
        window.localStorage.setItem("token", "valid_token");
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

    it("successfully changes data when updated", async () =>{
        mockSuccessfulFetch({
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            transfer_type: "transfer",
            });
        renderWithRoutes();

        expect(await screen.findByText(/Choose Your Profile Picture/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue("John")).toBeInTheDocument();


    })
});