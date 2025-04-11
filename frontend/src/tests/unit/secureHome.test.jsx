import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

// Mock the API response for recommendations
const mockRecommendations = [
  {
    school: {
      id: 1,
      school_name: "University of Iowa",
      conference: "Big Ten",
      location: "Iowa City, Iowa",
      available_sports: ["Men's Basketball", "Women's Basketball", "Football"]
    },
    sport: "Men's Basketball",
    similarity_score: 8
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
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/recommendations/')) {
        return Promise.resolve(new Response(JSON.stringify(mockRecommendations), {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }));
      } else if (url.includes('/api/schools/')) {
        return Promise.resolve(new Response(JSON.stringify(mockSchools), {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }));
      } else if (url.includes('/users/user/')) {
        return Promise.resolve(new Response(JSON.stringify({
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          transfer_type: "transfer"
        }), {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }));
      }
      // Return empty response for other endpoints
      return Promise.resolve(new Response(JSON.stringify({}), {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }));
    });
  });

  it('renders schools list', async () => {
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait for the school name to appear in the school list
    await waitFor(() => {
      expect(screen.getByTestId('school-list-name-1')).toHaveTextContent('University of Iowa');
    });
  });

  it('displays sports for each school', async () => {
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait for the sports to appear in the school list
    await waitFor(() => {
      expect(screen.getByTestId('school-list-sports-1')).toHaveTextContent(/Men's Basketball/);
    });
  });

  it('shows recommendations', async () => {
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait for the recommended school name to appear
    await waitFor(() => {
      expect(screen.getByTestId('recommended-school-name-1')).toHaveTextContent('University of Iowa');
    });

    // Check for recommended sport
    await waitFor(() => {
      expect(screen.getByTestId('recommended-sport-name-1')).toHaveTextContent("Men's Basketball");
    });
  });

  it('shows submit review button when transfer_type is not "high_school"', async () => {
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait for the submit review button to appear
    await waitFor(() => {
      expect(screen.getByText(/Submit a Review/i)).toBeInTheDocument();
    });
  });

  it('does not show submit review button when transfer_type is "high_school"', async () => {
    // Mock fetch to return a high school user
    global.fetch = vi.fn((url) => {
      if (url.includes('/users/user/')) {
        return Promise.resolve(new Response(JSON.stringify({
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          transfer_type: "high_school"
        }), {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }));
    });

    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.queryByText(/Submit a Review/i)).not.toBeInTheDocument();
    });
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
        <SecureHome />
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
describe('SecureHome Pagination Feature', () => {
  beforeEach(() => {
    // Mock localStorage to simulate an authenticated user.
    global.localStorage = {
      getItem: vi.fn(() => 'fake-token'),
      setItem: vi.fn(),
      clear: vi.fn()
    };

    // Create an array of 15 fake schools so that:
    // - Page 1 shows 10 schools (School 1 to School 10)
    // - Page 2 shows the remaining 5 schools (School 11 to School 15)
    const fakeSchools = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      school_name: `School ${i + 1}`,
      conference: "Test Conference",
      location: "Test Location",
      available_sports: ["Sport A", "Sport B"],
    }));

    // Setup fetch to return responses for both the user info and schools endpoints.
    global.fetch = vi.fn((url) => {
      if (url.includes('/users/user/')) {
        return Promise.resolve(
          new Response(JSON.stringify({
            first_name: "Test",
            last_name: "User",
            email: "test@example.com",
            transfer_type: "transfer"
          }), {
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' })
          })
        );
      } else if (url.includes('/api/schools/')) {
        return Promise.resolve(
          new Response(JSON.stringify(fakeSchools), {
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' })
          })
        );
      }
      return Promise.reject(new Error('Unhandled endpoint'));
    });
  });

  it('renders first page schools and paginates to page 2 when the pagination button is clicked', async () => {
    render(
      <BrowserRouter>
        <SecureHome />
      </BrowserRouter>
    );

    // Wait until the initial 10 school cards (rendered as h6 headings) are present.
    await waitFor(() => {
      // Get all h6 headings and filter out the ones that aren't school names
      const headings = screen.getAllByRole('heading', { level: 6 })
        .filter(heading => heading.textContent.startsWith('School'));
      expect(headings.length).toBe(10);
    });

    // Verify that page 1 has School 1 through School 10.
    let headings = screen.getAllByRole('heading', { level: 6 })
      .filter(heading => heading.textContent.startsWith('School'));
    const firstPageNames = headings.map((el) => el.textContent);
    for (let i = 1; i <= 10; i++) {
      expect(firstPageNames).toContain(`School ${i}`);
    }
    for (let i = 11; i <= 15; i++) {
      expect(firstPageNames).not.toContain(`School ${i}`);
    }

    // Find the page 2 button by its accessible name "Go to page 2" (MUI's Pagination typically renders it this way).
    const page2Button = screen.getByRole('button', { name: /go to page 2/i });
    fireEvent.click(page2Button);

    // Wait until page 2 is rendered (which should contain only 5 school cards).
    await waitFor(() => {
      const headingsPage2 = screen.getAllByRole('heading', { level: 6 })
        .filter(heading => heading.textContent.startsWith('School'));
      expect(headingsPage2.length).toBe(5);
    });

    // Verify that page 2 contains School 11 through School 15.
    headings = screen.getAllByRole('heading', { level: 6 })
      .filter(heading => heading.textContent.startsWith('School'));
    const secondPageNames = headings.map((el) => el.textContent);
    for (let i = 11; i <= 15; i++) {
      expect(secondPageNames).toContain(`School ${i}`);
    }
    for (let i = 1; i <= 10; i++) {
      expect(secondPageNames).not.toContain(`School ${i}`);
    }
  });
});
