import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import SecureHome from '../../home/SecureHome.jsx';
import { UserContext } from '../../context/UserContext';

// Mock user context value
const mockUserContextValue = {
  user: {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    transfer_type: 'transfer',
    profile_picture: ''
  },
  isLoggedIn: true,
  logout: vi.fn(),
  fetchUser: vi.fn(),
  updateProfilePic: vi.fn(),
  profilePic: '/assets/profile-pictures/pic1.png'
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
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
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
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
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
      <UserContext.Provider value={{...mockUserContextValue, user: {...mockUserContextValue.user, transfer_type: 'transfer'}}}>
        <SecureHome />
      </UserContext.Provider>
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
      <UserContext.Provider value={{...mockUserContextValue, user: {...mockUserContextValue.user, transfer_type: 'high_school'}}}>
        <SecureHome />
      </UserContext.Provider>
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

describe('SecureHome Filter Feature', () => {
  beforeEach(() => {
    // Mock localStorage for authentication
    global.localStorage = {
      getItem: vi.fn(() => 'fake-token'),
      setItem: vi.fn(),
      clear: vi.fn()
    };

    // Mock fetch for various endpoints
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/filter/')) {
        const urlObj = new URL(url, 'http://localhost');
        const headCoachRating = urlObj.searchParams.get('head_coach');
        // Return a filtered school when head_coach equals '8'
        if (headCoachRating === '8') {
          return Promise.resolve(new Response(JSON.stringify([
            {
              id: 2,
              school_name: "Filtered School",
              conference: "Test Conference",
              location: "Test Location",
              available_sports: ["Football"]
            }
          ]), {
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' })
          }));
        } else {
          return Promise.resolve(new Response(JSON.stringify([]), {
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' })
          }));
        }
      } else if (url.includes('/api/schools/')) {
        // Return default school list
        return Promise.resolve(new Response(JSON.stringify([
          {
            id: 1,
            school_name: "Default School",
            conference: "Test Conference",
            location: "Test Location",
            available_sports: ["Football"]
          }
        ]), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' })
        }));
      } else if (url.includes('/users/user/')) {
        // Return a mock user (transfer student)
        return Promise.resolve(new Response(JSON.stringify({
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          transfer_type: "transfer"
        }), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' })
        }));
      }
      return Promise.reject(new Error('Unhandled endpoint'));
    });
  });

  it('opens filter dialog and applies filter', async () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
      </BrowserRouter>
    );

    // Wait for the default school to appear
    await waitFor(() => {
      expect(screen.getByText(/Default School/i)).toBeInTheDocument();
    });

    // Click the Filters button
    const filtersButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filtersButton);

    // Wait for the filter dialog to appear (e.g., dialog title "Apply Filters")
    await waitFor(() => {
      expect(screen.getByText(/Apply Filters/i)).toBeInTheDocument();
    });

    // Change the Head Coach Rating dropdown to 8
    const headCoachSelect = screen.getByLabelText(/Head Coach Rating/i);
    fireEvent.change(headCoachSelect, { target: { value: '8' }});

    // Click the Apply button by using its role and exact name "Apply"
    const applyButton = screen.getByRole('button', { name: /^Apply$/i });
    fireEvent.click(applyButton);

    // Wait for the filtered school to appear
    await waitFor(() => {
      expect(screen.getByText(/Filtered School/i)).toBeInTheDocument();
    });
  });
});

