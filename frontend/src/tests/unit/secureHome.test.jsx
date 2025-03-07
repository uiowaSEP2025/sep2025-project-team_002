import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('SecureHome Component', () => {
  beforeEach(() => {
    console.log("Running SecureHome test suite");
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(() => 'fake-token'),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = mockLocalStorage;
    
    // Mock fetch with a proper Response object
    global.fetch = vi.fn(() => 
      Promise.resolve(new Response(JSON.stringify(mockSchools), {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }))
    );
  });

  it('renders schools list', async () => {
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait for the school name to appear
    await waitFor(() => {
      expect(screen.getByText(/University of Iowa/i)).toBeInTheDocument();
    });
  });

  it('displays sports for each school', async () => {
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait for any of the sports to appear
    await waitFor(() => {
      const sportsText = screen.getByText(/Men's Basketball/i);
      expect(sportsText).toBeInTheDocument();
    });
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