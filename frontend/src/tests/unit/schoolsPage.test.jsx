import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import SchoolPage from '../../schools/SchoolPage.jsx';
import { UserProvider } from '../../context/UserContext.jsx';
import userEvent from '@testing-library/user-event';



// Define rating categories to test consistently
const ratingCategories = [
  { name: "head_coach", value: 9 },
  { name: "assistant_coaches", value: 8 },
  { name: "team_culture", value: 9 },
  { name: "campus_life", value: 10 },
  { name: "athletic_facilities", value: 9 },
  { name: "athletic_department", value: 8 },
  { name: "player_development", value: 9 },
  { name: "nil_opportunity", value: 7 },
];

// Mock school data to match Schools model
const mockSchool = {
  id: 1,
  school_name: "University of Iowa",
  mbb: true,  // Added to match model
  wbb: true,  // Added to match model
  fb: true,   // Added to match model
  conference: "Big Ten",
  location: "Iowa City, Iowa",
  created_at: "2024-02-28T12:00:00Z",
  updated_at: "2024-02-28T12:00:00Z",
  review_summaries: {},  // Added to match model
  review_dates: {},      // Added to match model
  review_summary: "",    // Added to match model
  last_review_date: null, // Added to match model
  sport_summaries: {},    // Added to match model
  sport_review_dates: {}, // Added to match model

  // Instead of available_sports array, use the boolean fields
  reviews: [
    {
      review_id: "123e4567-e89b-12d3-a456-426614174000", // Added UUID
      school: 1,    // Reference to school
      user: 1,      // Reference to user
      sport: "Men's Basketball",
      head_coach_name: "John Doe",
      review_message: "Great program with excellent facilities",
      // Use the same rating values defined above
      ...Object.fromEntries(ratingCategories.map(cat => [cat.name, cat.value])),
      created_at: "2024-02-28T12:00:00Z",
      updated_at: "2024-02-28T12:00:00Z"  // Added to match model
    },
      {
      review_id: "123e4567-e89b-12d3-a456-426614174001", // Added UUID
      school: 1,    // Reference to school
      user: 1,      // Reference to user
      sport: "Men's Basketball",
      head_coach_name: "John Dane",
      review_message: "Excellent Facilities",
      // Use the same rating values defined above
      ...Object.fromEntries(ratingCategories.map(cat => [cat.name, cat.value])),
      created_at: "2024-02-28T12:00:00Z",
      updated_at: "2024-02-28T12:00:00Z"  // Added to match model
    },
      {
      review_id: "123e4567-e89b-12d3-a456-426614174002", // Added UUID
      school: 1,    // Reference to school
      user: 1,      // Reference to user
      sport: "Men's Basketball",
      head_coach_name: "John Doppy",
      review_message: "Great program",
      // Use the same rating values defined above
      ...Object.fromEntries(ratingCategories.map(cat => [cat.name, cat.value])),
      created_at: "2024-02-28T12:00:00Z",
      updated_at: "2024-02-28T12:00:00Z"  // Added to match model
    },
      {
      review_id: "123e4567-e89b-12d3-a456-426614174003", // Added UUID
      school: 1,    // Reference to school
      user: 1,      // Reference to user
      sport: "Men's Basketball",
      head_coach_name: "John Hanes",
      review_message: "Nice environment",
      // Use the same rating values defined above
      ...Object.fromEntries(ratingCategories.map(cat => [cat.name, cat.value])),
      created_at: "2024-02-28T12:00:00Z",
      updated_at: "2024-02-28T12:00:00Z"  // Added to match model
    },
      {
      review_id: "123e4567-e89b-12d3-a456-426614174004", // Added UUID
      school: 1,    // Reference to school
      user: 1,      // Reference to user
      sport: "Men's Basketball",
      head_coach_name: "Jane Doe",
      review_message: "Enjoyable experience",
      // Use the same rating values defined above
      ...Object.fromEntries(ratingCategories.map(cat => [cat.name, cat.value])),
      created_at: "2024-02-28T12:00:00Z",
      updated_at: "2024-02-28T12:00:00Z"  // Added to match model
    },
      {
      review_id: "123e4567-e89b-12d3-a456-426614174005", // Added UUID
      school: 1,    // Reference to school
      user: 1,      // Reference to user
      sport: "Men's Basketball",
      head_coach_name: "Jeff Doe",
      review_message: "Great sports culture",
      // Use the same rating values defined above
      ...Object.fromEntries(ratingCategories.map(cat => [cat.name, cat.value])),
      created_at: "2024-02-28T12:00:00Z",
      updated_at: "2024-02-28T12:00:00Z"  // Added to match model
    }
  ]
};

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockSchool)
  })
);

// Mock navigate function for testing redirects
const mockNavigate = vi.fn();

// Mock logout function for testing token expiration
const mockLogout = vi.fn();

// Mock useUser hook and UserProvider
vi.mock('../../context/UserContext.jsx', () => ({
  useUser: () => ({
    user: { first_name: 'Test', last_name: 'User' },
    logout: mockLogout
  }),
  UserProvider: ({ children }) => children
}));

describe('SchoolPage Component', () => {
  beforeEach(() => {
    // Mock localStorage to simulate logged-in state
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('fake-token'),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = mockLocalStorage;

    fetch.mockClear();
  });

  const renderWithRouter = (mockFetch = null) => {
    // If a custom fetch mock is provided, use it
    if (mockFetch) {
      fetch.mockImplementation(mockFetch);
    }

    return render(
      <MemoryRouter initialEntries={['/school/3']}>
        <UserProvider>
          <Routes>
            <Route path="/school/:id" element={<SchoolPage />} />
          </Routes>
        </UserProvider>
      </MemoryRouter>
    );
  };

  // Mock useNavigate for testing redirects
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate
    };
  });

  // --- vote related tests ---
  it('shows login prompt when trying to vote without login', async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSchool)
      })
    );

    renderWithRouter();

    await screen.findByText('Review message 0');

    global.localStorage.getItem = vi.fn(() => null); // Simulate no token
    const helpfulButtons = await screen.findAllByRole('button', { name: /Helpful/i });
    userEvent.click(helpfulButtons[0]);
    await screen.findByText(/Please log in to vote/i);
  });

  it('allows authenticated user to vote and updates count', async () => {
    fetch.mockImplementation((url, options) => {
      if (url.includes('/vote')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            vote: 1,
            helpful_count: 1,
            unhelpful_count: 0
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSchool)
      });
    });

    renderWithRouter();
    const helpfulButtons = await screen.findAllByRole('button', { name: /Helpful/i });
    userEvent.click(helpfulButtons[0]);
    await waitFor(() => {
      expect(helpfulButtons[0]).toHaveTextContent(/Helpful \(1\)/);
    });
  });

  it('renders school information', async () => {
    renderWithRouter();
    expect(await screen.findByText('University of Iowa')).toBeInTheDocument();
    expect(await screen.findByText((content) => content.includes('Big Ten'))).toBeInTheDocument();
    expect(await screen.findByText((content) => content.includes('Iowa City, Iowa'))).toBeInTheDocument();
  });

  it('displays available sports', async () => {
    renderWithRouter();
    if (mockSchool.mbb) {
      expect(await screen.findByText("Men's Basketball")).toBeInTheDocument();
    }
    if (mockSchool.wbb) {
      expect(await screen.findByText("Women's Basketball")).toBeInTheDocument();
    }
    if (mockSchool.fb) {
      expect(await screen.findByText("Football")).toBeInTheDocument();
    }
  });

  it('displays review information', async () => {
    renderWithRouter();

    // Look for the sport in the tab specifically
    expect(await screen.findByRole('tab', { name: "Men's Basketball" })).toBeInTheDocument();

    // Look for the coach name in a heading
    expect(await screen.findByRole('heading', { name: /John Doe/ })).toBeInTheDocument();

    // Look for the review text in a paragraph
    expect(await screen.findByText(/Great program with excellent facilities/)).toBeInTheDocument();
  });

  it('displays review ratings correctly', async () => {
    renderWithRouter();

    // Wait for the page to load
    await screen.findByText("University of Iowa");

    // Check each rating category
      for (const category of ratingCategories) {
        const scoreTestId = `${category.name}-score-123e4567-e89b-12d3-a456-426614174000`;

        const ratingElement = await screen.findByTestId(scoreTestId);
        expect(ratingElement).toHaveTextContent(`${category.value}/10`);
      }
    });

  it('displays review details correctly', async () => {
    renderWithRouter();

    // Debug: Log the document after loading
    await screen.findByText("University of Iowa");
    screen.debug();

    // Try different ways to find the coach name
    try {
      const coachElement = await screen.findByText(/John Doe/i);
      console.log('Found coach name:', coachElement.textContent);
    } catch (error) {
      console.log('Could not find coach name:', error);
    }
  });

  it('shows back to home button', async () => {
    renderWithRouter();
    const backButton = await screen.findByText(/Back to Schools/);
    expect(backButton).toBeInTheDocument();
  });

  it('handles 401 error without redirect if not implemented', async () => {
      localStorage.setItem('token', 'expired_token');

      const mockFetchWith401 = vi.fn((url) => {
        if (url.includes('/api/schools/')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ detail: 'Token has expired' })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithRouter(mockFetchWith401);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching school:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
  });

  it('shows loading indicator while fetching data', async () => {
    const delayedFetch = vi.fn(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve(mockSchool)
          });
        }, 100);
      })
    );

    renderWithRouter(delayedFetch);

    // Check that the initial "Loading..." screen shows
    expect(screen.getByText(/^Loading\.\.\.$/)).toBeInTheDocument();

    // Wait for school data to load
    await screen.findByText("University of Iowa");

    // Confirm "Loading..." screen is gone (but allow other loading text to remain)
    expect(screen.queryByText(/^Loading\.\.\.$/)).not.toBeInTheDocument();
  });

  it('displays the correct number of reviews per page and supports pagination', async () => {
    renderWithRouter();

    // Ensure that the "Men's Basketball" tab exists and is clicked
    const basketballTab = await screen.findByRole('tab', { name: "Men's Basketball" });
    userEvent.click(basketballTab);

    // Wait for reviews to be displayed
    await waitFor(() => {
      expect(screen.getByText('Great program with excellent facilities')).toBeInTheDocument();
    });

    // Test if the correct number of reviews per page (5 reviews) are shown
    const reviewCards = screen.getAllByTestId(/^review-/);  // Ensure this matches your `data-testid`
    expect(reviewCards.length).toBe(5);  // This should be 5 reviews per page

    // Test pagination by clicking next
    const pagination = screen.getByRole('navigation', { name: /pagination/ });
    const nextButton = within(pagination).getByRole('button', { name: /next page/i });
    userEvent.click(nextButton);

    // Wait for page change and verify next reviews are displayed
    await waitFor(() => {
      expect(screen.getByText('Great sports culture')).toBeInTheDocument();
    });

    const nextReviewCards = screen.getAllByTestId(/^review-/);
    expect(nextReviewCards.length).toBe(1); // Should show 1 review on the next page
  });

  it('shows pagination control when reviews exceed the page limit', async () => {
    renderWithRouter();
    // Verify that pagination control exists
    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    const pagination = screen.getByRole('list'); // This will target the pagination list

    // Check if "Next" button is available for pagination
    expect(within(pagination).getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });


  it('changes the page number and displays the correct reviews', async () => {
    renderWithRouter();
    // Verify that pagination control exists
    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    // Simulate switching to page 2 (assuming 5 reviews per page and 6 total reviews)
    const pagination = screen.getByRole('list'); // Query pagination by role="list"

    const nextButton = within(pagination).getByRole('button', { name: /next page/i });

    // Simulate clicking on the next page
    userEvent.click(nextButton);

    // Wait for page change and verify next reviews are displayed
    await waitFor(() => {
      expect(screen.getByText('Great sports culture')).toBeInTheDocument();
    });
  });




});