import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import SchoolPage from '../schools/SchoolPage';

// Mock school data with reviews
const mockSchool = {
  id: 1,
  school_name: "University of Iowa",
  conference: "Big Ten",
  location: "Iowa City, Iowa",
  available_sports: ["Men's Basketball", "Women's Basketball", "Football"],
  reviews: [
    {
      id: 1,
      sport: "Men's Basketball",
      head_coach_name: "John Doe",
      review_message: "Great program with excellent facilities",
      head_coach: 9,
      assistant_coaches: 8,
      team_culture: 9,
      campus_life: 10,
      athletic_facilities: 9,
      athletic_department: 8,
      player_development: 9,
      nil_opportunity: 7,
      created_at: "2024-02-28T12:00:00Z"
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

describe('SchoolPage Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/school/1']}>
        <Routes>
          <Route path="/school/:id" element={<SchoolPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders school information', async () => {
    renderWithRouter();
    expect(await screen.findByText('University of Iowa')).toBeInTheDocument();
    expect(await screen.findByText(/Conference: Big Ten/)).toBeInTheDocument();
    expect(await screen.findByText(/Location: Iowa City, Iowa/)).toBeInTheDocument();
  });

  it('displays available sports', async () => {
    renderWithRouter();
    const sports = await screen.findByText(/Men's Basketball.*Women's Basketball.*Football/);
    expect(sports).toBeInTheDocument();
  });

  it('displays review information', async () => {
    renderWithRouter();
    expect(await screen.findByText(/Men's Basketball - Coach John Doe/)).toBeInTheDocument();
    expect(await screen.findByText(/Great program with excellent facilities/)).toBeInTheDocument();
  });

  it('displays all rating categories', async () => {
    renderWithRouter();
    const ratingCategories = [
      'Head Coach',
      'Assistant Coaches',
      'Team Culture',
      'Campus Life',
      'Athletic Facilities',
      'Athletic Department',
      'Player Development',
      'NIL Opportunity'
    ];

    for (const category of ratingCategories) {
      expect(await screen.findByText(new RegExp(category))).toBeInTheDocument();
    }
  });

  it('shows back to home button', async () => {
    renderWithRouter();
    const backButton = await screen.findByText(/Back to Home/);
    expect(backButton).toBeInTheDocument();
  });
}); 