import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TestRequireAuth } from "../../RequireAuth";

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
});
