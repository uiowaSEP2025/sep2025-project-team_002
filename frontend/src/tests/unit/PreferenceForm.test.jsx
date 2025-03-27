import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import PreferenceForm from "../../review/PreferenceForm.jsx";
import API_BASE_URL from "../../utils/config.js";

// Mock fetch globally
beforeEach(() => {
  global.fetch = vi.fn((url, options) => {
    if (url.includes("/api/preferences/user-preferences/")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]), // Mock empty preferences by default
      });
    }

    if (url.includes("/api/preferences/preferences-form/")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }

    return Promise.resolve({ ok: false });
  });

  localStorage.setItem("token", "valid_token");
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PreferenceForm Component", () => {
  it("renders the form fields correctly", async () => {
    render(
      <BrowserRouter>
        <PreferenceForm />
      </BrowserRouter>
    );

    expect(await screen.findByText("Share your Preferences")).toBeInTheDocument();
    expect(screen.getByLabelText("Sport *")).toBeInTheDocument();
    expect(screen.getByText(/Head Coach\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Assistant Coaches\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Team Culture\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Campus Life\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Athletic Facilities\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Athletic Department\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Player Development\*/i)).toBeInTheDocument();
    expect(screen.getByText(/NIL Opportunity\*/i)).toBeInTheDocument();
    expect(screen.getByText("Submit Preferences")).toBeInTheDocument();
  });

it("updates form inputs correctly", async () => {
  render(
    <BrowserRouter>
      <PreferenceForm />
    </BrowserRouter>
  );

  // Test slider values - use more specific targeting
  const firstSlider = screen.getAllByRole('slider')[0];
  fireEvent.change(firstSlider, { target: { value: '7' } });
  expect(firstSlider).toHaveValue('7');
});


  it("prevents duplicate preference submission", async () => {
    // Mock existing preferences
    global.fetch = vi.fn((url) => {
      if (url.includes("/api/preferences/user-preferences/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, sport: "Football" }]),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <BrowserRouter>
        <PreferenceForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Preferences Already Submitted")
      ).toBeInTheDocument();
    });
  });

  it("submits the form successfully", async () => {
    render(
      <BrowserRouter>
        <PreferenceForm />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.mouseDown(screen.getByLabelText("Sport *"));
    await waitFor(() => screen.getByText("Football"));
    fireEvent.click(screen.getByText("Football"));

    // Set all sliders to 5
    const sliders = screen.getAllByRole("slider");
    sliders.forEach(slider => {
      fireEvent.change(slider, { target: { value: "5" } });
    });

    // Submit the form
    fireEvent.click(screen.getByText("Submit Preferences"));

    // Confirm submission
    await waitFor(() => {
      expect(screen.getByText("Confirm Submission")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/preferences/preferences-form/`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer valid_token",
          },
        })
      );
    });
  });

  it("disables submit button when form is incomplete", async () => {
    render(
      <BrowserRouter>
        <PreferenceForm />
      </BrowserRouter>
    );

    // Only select sport without setting any ratings
    fireEvent.mouseDown(screen.getByLabelText("Sport *"));
    await waitFor(() => screen.getByText("Football"));
    fireEvent.click(screen.getByText("Football"));

    const submitButton = screen.getByText("Submit Preferences");
    expect(submitButton).toBeDisabled();
  });

});