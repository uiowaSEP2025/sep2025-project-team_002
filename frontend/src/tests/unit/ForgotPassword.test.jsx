import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPassword from "../../account/ForgotPassword";
import { MemoryRouter } from "react-router-dom";

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ForgotPassword Page", () => {
  it("renders form correctly", () => {
    renderWithRouter();

    expect(screen.getByRole("heading", { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset email/i })).toBeInTheDocument();
  });

  it("submits email and shows success message", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Reset email sent successfully!" }),
      })
    ));

    renderWithRouter();

    const emailInput = screen.getByLabelText(/email/i);
    const submitBtn = screen.getByRole("button", { name: /send reset email/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitBtn);

    expect(await screen.findByText(/reset email sent successfully/i)).toBeInTheDocument();
  });
});
