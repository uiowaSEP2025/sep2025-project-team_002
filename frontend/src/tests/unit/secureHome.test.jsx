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

it('shows submit review button when transfer_type is not "high_school"', async () => {
  // Mock the user API response for a transfer student
  const transferUserResponse = {
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    transfer_type: "transfer"
  };

  // Set up mock fetch to return different responses based on URL
  global.fetch = vi.fn((url) => {
    if (url.includes('/users/user/')) {
      // Return the transfer user data
      return Promise.resolve(new Response(JSON.stringify(transferUserResponse), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' })
      }));
    } else if (url.includes('/api/schools/')) {
      // Return the schools data
      return Promise.resolve(new Response(JSON.stringify(mockSchools), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' })
      }));
    }
    return Promise.reject(new Error('Unhandled endpoint'));
  });

  render(
    <BrowserRouter>
      <SecureHome />
    </BrowserRouter>
  );

  // Wait for schools data to load
  await waitFor(() => {
    expect(screen.getByText(/University of Iowa/i)).toBeInTheDocument();
  });

  // Verify the submit review button IS present
  await waitFor(() => {
    const submitButton = screen.getByText(/Submit a Review/i);
    expect(submitButton).toBeInTheDocument();
  });
});

it('does not show submit review button when transfer_type is "high_school"', async () => {
  // Mock the user API response for a high school student
  const highSchoolUserResponse = {
    first_name: "Test",
    last_name: "User",
    email: "testHS@example.com",
    transfer_type: "high_school"
  };

  // Set up mock fetch to return different responses based on URL
  global.fetch = vi.fn((url) => {
    if (url.includes('/users/user/')) {
      // Return the high school user data
      return Promise.resolve(new Response(JSON.stringify(highSchoolUserResponse), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' })
      }));
    } else if (url.includes('/api/schools/')) {
      // Return the schools data
      return Promise.resolve(new Response(JSON.stringify(mockSchools), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' })
      }));
    }
    return Promise.reject(new Error('Unhandled endpoint'));
  });

  render(
    <BrowserRouter>
      <SecureHome />
    </BrowserRouter>
  );

  // Wait for schools data to load (which confirms the component has rendered)
  await waitFor(() => {
    expect(screen.getByText(/University of Iowa/i)).toBeInTheDocument();
  });

  // Verify the submit review button is NOT present
  const submitButton = screen.queryByText(/Submit a Review/i);
  expect(submitButton).not.toBeInTheDocument();
});

});

