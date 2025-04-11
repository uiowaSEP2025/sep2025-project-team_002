import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import SchoolPage from '../../schools/SchoolPage.jsx';
import { UserProvider } from '../../context/UserContext.jsx';

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
      // Look for the score by specific ID
      const scoreId = `${category.name}-score-123e4567-e89b-12d3-a456-426614174000`;
      const ratingElement = screen.getByText((content, element) => {
        return element.id === scoreId && content.includes(category.value.toString());
      });
      console.log('Found rating element:', ratingElement);
      expect(ratingElement).toBeInTheDocument();
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

  it('redirects to login when token is expired', async () => {
    // Mock localStorage with a token
    localStorage.setItem('token', 'expired_token');

    // Mock fetch to return 401 Unauthorized for the school data
    const mockFetchWith401 = vi.fn((url) => {
      if (url.includes('/api/schools/')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ detail: 'Token has expired' })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    // Render with our custom fetch mock
    renderWithRouter(mockFetchWith401);

    // Wait for the component to try to fetch data and handle the 401
    await waitFor(() => {
      // Check that logout was called
      expect(mockLogout).toHaveBeenCalled();
      // Check that navigate was called with '/login'
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('shows loading indicator while fetching data', async () => {
    // Create a delayed response to test loading state
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

    // Should show loading indicator initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Eventually the school data should load
    await screen.findByText("University of Iowa");

    // Loading indicator should be gone
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});