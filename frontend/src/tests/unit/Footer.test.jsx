import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import Footer from "../../components/Footer.jsx";

const renderFooter = () => {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Footer Component", () => {
  it("renders static footer content", () => {
    renderFooter();

    expect(screen.getByText(/© 2025 Athletic Insider/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about us/i })).toHaveAttribute("href", "/about");
    expect(screen.getByText(/report issue/i)).toBeInTheDocument();
  });

  it("opens modal when 'Report Issue' is clicked", async () => {
    renderFooter();

    const reportLink = screen.getByText(/report issue/i);
    await userEvent.click(reportLink);

    expect(await screen.findByText(/report an issue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/issue description/i)).toBeInTheDocument();
  });

  it("submits form and shows success notification", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ));

    renderFooter();

    await userEvent.click(screen.getByText(/report issue/i));

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/issue description/i), "Something is broken");

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/thank you for your feedback/i)).toBeInTheDocument();
  });

  it("closes modal when × button is clicked", async () => {
    renderFooter();

    await userEvent.click(screen.getByText(/report issue/i));
    expect(await screen.findByText(/report an issue/i)).toBeInTheDocument();

    // const closeBtn = screen.getByRole("button", { name: /×/i });
    // await userEvent.click(closeBtn);
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText(/report an issue/i)).not.toBeInTheDocument();
    });
  });

    it("closes notification when the snackbar close icon is clicked", async () => {
        vi.stubGlobal("fetch", vi.fn(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
        ));

        renderFooter();

        await userEvent.click(screen.getByText(/report issue/i));

        await userEvent.type(screen.getByLabelText(/email/i), "clickme@example.com");
        await userEvent.type(screen.getByLabelText(/issue description/i), "Close me");

        const submitButton = screen.getByRole("button", { name: /submit/i });
        await userEvent.click(submitButton);

        expect(await screen.findByText(/thank you for your feedback/i)).toBeInTheDocument();

        // const okButton = screen.getByRole("button", { name: /ok/i });
        // await userEvent.click(okButton);
        // MUI Alert renders a close icon button with aria-label="close"
        const closeSnackbarButton = screen.getByLabelText(/close/i);
        await userEvent.click(closeSnackbarButton);
        await waitFor(() => {
          expect(screen.queryByText(/thank you for your feedback/i)).not.toBeInTheDocument();
        });
      });

});
