import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react';
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
  profilePic: '/assets/profile-pictures/pic1.png',
  filters: {
    sport: "",
    head_coach: "",
    assistant_coaches: "",
    team_culture: "",
    campus_life: "",
    athletic_facilities: "",
    athletic_department: "",
    player_development: "",
    nil_opportunity: "",
  },
  setFilters: vi.fn(),
  clearFilters: vi.fn()
};

// Mock the API response for schools
const mockSchools = [
  {
    id: 1,
    school_name: "University of Iowa",
    conference: "Big Ten",
    location: "Iowa City, Iowa",
    available_sports: ["Men's Basketball", "Women's Basketball", "Football"],
    review_count: 325,
    average_rating: 8.7
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
      available_sports: ["Men's Basketball", "Women's Basketball", "Football"],
      review_count: 325,
      average_rating: 8.7
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
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
      </BrowserRouter>
    );

    // Initially should show loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for the school name to appear in the school list
    await waitFor(() => {
      expect(screen.getByTestId('school-list-name-1')).toHaveTextContent('University of Iowa');
    });

    // Loading indicator should be gone
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('displays sports for each school', async () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
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
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
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
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
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
      <UserContext.Provider value={{...mockUserContextValue, user: {...mockUserContextValue.user, transfer_type: 'high_school'}}}>
        <SecureHome />
      </UserContext.Provider>
    </BrowserRouter>
  );


    // Wait for the component to render
    await waitFor(() => {
      expect(screen.queryByText(/Submit a Review/i)).not.toBeInTheDocument();
    });
  });
});

describe('SecureHome Filter Dialog', () => {
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
        const sport = urlObj.searchParams.get('sport');
        // Return a filtered school when head_coach equals '8' and sport is Men's Basketball
        if (headCoachRating === '8' && sport === "Men's Basketball") {
          return Promise.resolve(new Response(JSON.stringify([
            {
              id: 2,
              school_name: "Filtered School",
              conference: "Test Conference",
              location: "Test Location",
              available_sports: ["Men's Basketball"],
              review_count: 150,
              average_rating: 8.2
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
            available_sports: ["Football"],
            review_count: 85,
            average_rating: 7.5
          }
        ]), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' })
        }));
      } else if (url.includes('/api/recommendations/')) {
        // Return mock recommendations
        return Promise.resolve(new Response(JSON.stringify(mockRecommendations), {
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
      return Promise.resolve(new Response(JSON.stringify({}), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' })
      }));
    });
  });

  it('opens filter dialog and closes it', async () => {
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

    // Click the Filter button
    const filtersButton = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(filtersButton);

    // Wait for the filter dialog to appear (e.g., dialog title "Apply Filters")
    await waitFor(() => {
      expect(screen.getAllByText(/Apply Filters/i)[0]).toBeInTheDocument();
    });

    // Wait for the dialog content to be visible
    await waitFor(() => {
      expect(screen.getByText(/Rating Filters/i)).toBeInTheDocument();
    });

    // Verify that the sport dropdown is present
    expect(screen.getByLabelText(/Choose Sport/i)).toBeInTheDocument();

    expect(screen.getByText(/Men's Basketball/i)).toBeInTheDocument();
    expect(screen.getByText(/Football/i)).toBeInTheDocument();

    // Click the Apply Filters button
    const applyButton = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyButton);

    // Verify that the dialog closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
      review_count: Math.floor(Math.random() * 600),
      average_rating: (Math.random() * 5 + 5).toFixed(1),
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

    it('renders first page schools and paginates correctly when changing pages', async () => {
      render(
        <BrowserRouter>
          <UserContext.Provider value={mockUserContextValue}>
            <SecureHome />
          </UserContext.Provider>
        </BrowserRouter>
      );

      // Wait for initial load and verify page 1 has 10 schools
      await waitFor(() => {
        const schoolHeadings = screen.getAllByRole('heading', { level: 6 })
          .filter(heading => heading.textContent.startsWith('School'));
        expect(schoolHeadings.length).toBe(10);
      });

      // Get all school names from page 1
      const firstPageSchools = screen.getAllByRole('heading', { level: 6 })
        .filter(heading => heading.textContent.startsWith('School'))
        .map(el => el.textContent);

      // Click page 2 button
      const page2Button = screen.getByRole('button', { name: /go to page 2/i });
      fireEvent.click(page2Button);

      // Wait for page 2 to load with 5 schools
      await waitFor(() => {
        const schoolHeadings = screen.getAllByRole('heading', { level: 6 })
          .filter(heading => heading.textContent.startsWith('School'));
        expect(schoolHeadings.length).toBe(5);
      });

      // Get all school names from page 2
      const secondPageSchools = screen.getAllByRole('heading', { level: 6 })
        .filter(heading => heading.textContent.startsWith('School'))
        .map(el => el.textContent);

      // Verify counts are correct
      expect(firstPageSchools.length).toBe(10);
      expect(secondPageSchools.length).toBe(5);

      // Verify no overlap between pages
      secondPageSchools.forEach(school => {
        expect(firstPageSchools).not.toContain(school);
      });

      // Verify all schools are unique (no duplicates)
      const allSchools = [...firstPageSchools, ...secondPageSchools];
      const uniqueSchools = new Set(allSchools);
      expect(uniqueSchools.size).toBe(15);
    });
});
