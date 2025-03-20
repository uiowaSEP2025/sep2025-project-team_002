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
    expect(screen.getByLabelText(/Email/i)).toHaveValue("anonymous@example.com");
    expect(screen.getByLabelText(/Athlete Status/i)).toHaveValue("Not Specified");
  });

  it("handles successful fetch with all fields + 'transfer_in'", async () => {
    mockSuccessfulFetch({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      transfer_type: "transfer_in",
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
    expect(screen.getByLabelText(/Email/i)).toHaveValue("john@example.com");
    expect(screen.getByLabelText(/Athlete Status/i)).toHaveValue("Transfer In");
  });

  it("handles 'transfer_out' as 'Transfer Out'", async () => {
    mockSuccessfulFetch({
      first_name: "Kate",
      last_name: "Smith",
      email: "kate@example.com",
      transfer_type: "transfer_out",
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
    expect(screen.getByLabelText(/Athlete Status/i)).toHaveValue("Transfer Out");
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
});
