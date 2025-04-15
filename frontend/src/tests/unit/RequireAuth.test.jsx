import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TestRequireAuth } from "../../RequireAuth";
import { UserContext } from "../../context/UserContext";

// Dummy protected content
function ProtectedPage() {
  return <div>Protected Content</div>;
}



// Utility to render with routing
function renderWithRoute(initialPath = "/secure", isLoggedIn = true) {
  const mockFetchUser = vi.fn();

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/secure"
          element={
            <TestRequireAuth isLoggedIn={isLoggedIn} fetchUser={mockFetchUser}>
              <ProtectedPage />
            </TestRequireAuth>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}



describe("RequireAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders children when token is present", () => {
    localStorage.setItem("token", "valid_token");
    renderWithRoute("/secure", true);
    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  it("redirects to login when token is missing", async() => {
    renderWithRoute("/secure", false);
    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
  });

  it("shows children while checking token validity", async () => {
    // Set up a token but make fetchUser take some time
    localStorage.setItem("token", "valid_token");
    const slowFetchUser = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <MemoryRouter initialEntries={["/secure"]}>
        <Routes>
          <Route
            path="/secure"
            element={
              <TestRequireAuth isLoggedIn={false} fetchUser={slowFetchUser}>
                <ProtectedPage />
              </TestRequireAuth>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Content should be visible immediately because we have a token
    expect(screen.getByText(/protected content/i)).toBeInTheDocument();

    // Wait for fetchUser to complete
    await waitFor(() => {
      expect(slowFetchUser).toHaveBeenCalled();
    });
  });
});
