import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import Account from "../../account/Account.jsx";

function mockSuccessfulFetch(data) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
}

function mockFailedFetch(errorData, status = 400) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve(errorData),
    })
  );
}

function mockNetworkError() {
  global.fetch = vi.fn(() => Promise.reject(new Error("Failed to fetch")));
}

describe("Account Page Testing", () => {
  beforeEach(() => {
    // By default, assume user has a token
    window.localStorage.setItem("token", "fake_jwt_token");
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("redirects to /login if no token is found", () => {
    window.localStorage.removeItem("token");

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Without token, the component calls navigate("/login"), so we see "Login Page"
    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });

  it("handles successful fetch with minimal data", async () => {
    // Suppose the server returns a minimal user object with just an email
    mockSuccessfulFetch({
      email: "anonymous@example.com",
      // no first_name, no last_name, no transfer_type
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // The heading should appear
    expect(await screen.findByText(/Account Information/i)).toBeInTheDocument();

    // Because no first_name/last_name => fields might be "", check that:
    expect(screen.getByLabelText(/First Name/i)).toHaveValue("");
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /Email/i })).toHaveValue("anonymous@example.com");
    expect(screen.getByLabelText(/Athlete Status/i)).toHaveValue("Not Specified");
  });

  it("handles successful fetch with all fields + 'high_school'", async () => {
    mockSuccessfulFetch({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      transfer_type: "high_school",
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the data to load
    expect(await screen.findByText(/Account Information/i)).toBeInTheDocument();

    // Confirm the displayed fields
    expect(screen.getByLabelText(/First Name/i)).toHaveValue("John");
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("Doe");
    expect(screen.getByRole("textbox", { name: /Email/i })).toHaveValue("john@example.com");
    expect(screen.getByLabelText(/Athlete Status/i)).toHaveValue("Prospective High School Athlete");
  });

  it("handles 'transfer' as 'Transferring Athlete'", async () => {
    mockSuccessfulFetch({
      first_name: "Kate",
      last_name: "Smith",
      email: "kate@example.com",
      transfer_type: "transfer",
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Account Information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Athlete Status/i)).toHaveValue("Transferring Athlete");
  });

  it("handles 'graduate' => 'Graduated Athlete'", async () => {
    mockSuccessfulFetch({
      first_name: "Jon",
      last_name: "Graduated",
      email: "grad@example.com",
      transfer_type: "graduate",
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Account Information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Athlete Status/i)).toHaveValue("Graduated Athlete");
  });

  it("handles an unknown transfer_type => 'Other'", async () => {
    mockSuccessfulFetch({
      first_name: "Sam",
      last_name: "Unknown",
      email: "sam@example.com",
      transfer_type: "random_stuff",
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Account Information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Athlete Status/i)).toHaveValue("Other");
  });

  it("handles missing transfer_type => 'Not Specified'", async () => {
    // If server doesn't send `transfer_type` or it's null
    mockSuccessfulFetch({
      first_name: "Jake",
      last_name: "Partial",
      email: "partial@example.com",
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Account Information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Athlete Status/i)).toHaveValue("Not Specified");
  });

  it("displays error from server if fetch returns ok:false", async () => {
    mockFailedFetch({ error: "Something went wrong on the server." }, 400);

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for error text
    expect(
      await screen.findByText(/Something went wrong on the server./i)
    ).toBeInTheDocument();
  });

  it("handles a network error gracefully (failed to fetch)", async () => {
    mockNetworkError();

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // We expect the component to detect "Failed to fetch"
    // and show "Cannot connect to the server. Please check your network."
    expect(
      await screen.findByText(/Cannot connect to the server/i)
    ).toBeInTheDocument();
  });

  it("shows warning + verify button if .edu email is not verified", async () => {
    mockSuccessfulFetch({
      first_name: "Lisa",
      last_name: "Unverified",
      email: "lisa@college.edu",
      is_school_verified: false,
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Account Information/i)).toBeInTheDocument();

    // Look for the verification box first
    const verificationBox = screen.getByTestId('account-verification-box') ||
                           screen.getByRole('region', { name: /verification/i }) ||
                           document.getElementById('account-verification-box');

    // Then look for the text within that box
    expect(verificationBox).toBeInTheDocument();

    // Check for the verify email button
    expect(screen.getByRole("button", { name: /verify email/i })).toBeInTheDocument();
  });

  it("shows verified status and hides button for .edu email if already verified", async () => {
    mockSuccessfulFetch({
      first_name: "Anna",
      last_name: "Verified",
      email: "anna@university.edu",
      is_school_verified: true,
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/School Email Verified/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verify email/i })).not.toBeInTheDocument();
  });

  it("shows personal email warning and no button if not .edu", async () => {
    mockSuccessfulFetch({
      first_name: "Mike",
      last_name: "Gmail",
      email: "mike@gmail.com",
      is_school_verified: false, // irrelevant for non .edu
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Personal Email without Verification/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verify email/i })).not.toBeInTheDocument();
  });

  it("calls verification API and alerts on success", async () => {
    // Initial user state
    mockSuccessfulFetch({
      first_name: "Alex",
      last_name: "NotVerified",
      email: "alex@school.edu",
      is_school_verified: false,
    });

    // Render the component first
    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for user data to load
    await screen.findByText(/School Email Not Verified/i);

    // Mock the verification fetch call
    const mockMessage = { message: "Verification email sent!" };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMessage),
      })
    );

    // Spy on alert
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const button = screen.getByRole("button", { name: /verify email/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("Verification email sent!")
    );

    alertSpy.mockRestore();
  });
});
