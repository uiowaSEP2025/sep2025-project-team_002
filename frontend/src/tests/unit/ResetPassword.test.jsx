import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResetPassword from "../../account/ResetPassword";

// Mock PasswordForm to control submission
vi.mock("../../account/PasswordForm", () => ({
  default: ({ onSubmit }) => (
    <div>
      <input
        type="password"
        aria-label="New Password"
        onChange={(e) => onSubmit({ newPassword: e.target.value })}
      />
      <button onClick={() => onSubmit({ newPassword: "newpassword123" })}>Submit</button>
    </div>
  ),
}));

// Helper to render with query params
function renderWithQueryParams(uid = "abc123", token = "token456") {
  const path = `/reset-password?uid=${uid}&token=${token}`;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.resetAllMocks();
});

describe("ResetPassword Page", () => {
  it("renders the reset form with heading", () => {
    renderWithQueryParams();

    expect(screen.getByRole("heading", { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });
});
