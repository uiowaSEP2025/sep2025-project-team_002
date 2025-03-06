import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import SecureHome from '../../home/SecureHome.jsx';

// Mock the authentication state
const mockAuthState = {
  isAuthenticated: true,
  user: {
    username: 'testuser',
    email: 'test@example.com'
  }
};

// Mock the API response for schools
const mockSchools = [
  {
    id: 1,
    school_name: "University of Iowa",
    conference: "Big Ten",
    location: "Iowa City, Iowa",
    available_sports: ["Men's Basketball", "Women's Basketball", "Football"]
  }
];

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockSchools)
  })
);

describe('SecureHome Component', () => {
  beforeEach(() => {
    console.log("Running SecureHome test suite");
    // Clear mock calls between tests
    fetch.mockClear();
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(() => 'fake-token'),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = mockLocalStorage;
  });

  it('renders schools list', async () => {
    console.log("Testing schools list rendering");
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait for the school to appear
    const schoolElement = await screen.findByText(/University of Iowa/i);
    expect(schoolElement).toBeInTheDocument();
  });

  it('displays sports for each school', async () => {
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait for the sports to appear
    const sportsText = await screen.findByText(/Men's Basketball • Women's Basketball • Football/i);
    expect(sportsText).toBeInTheDocument();
  });

  it('shows submit review button', () => {
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    const submitButton = screen.getByText(/Submit a Review/i);
    expect(submitButton).toBeInTheDocument();
  });
});