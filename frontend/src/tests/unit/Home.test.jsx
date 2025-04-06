import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from '../../home/Home.jsx';

describe('App Component', () => {
  beforeEach(() => {
    // Mock fetch before each test with the correct data structure
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 1,
            school_name: "University of Iowa",
            conference: "Big Ten",
            location: "Iowa City, Iowa",
            available_sports: ["Men's Basketball", "Women's Basketball", "Football"]
          }
        ])
      })
    );
  });

  it('should display schools', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const schoolsElement = screen.getByText('Explore the Schools and their Sports!');
    expect(schoolsElement).toBeInTheDocument();
  });

  it('renders schools list', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const schoolElement = await screen.findByText(/University of Iowa/i);
    expect(schoolElement).toBeInTheDocument();
  });

  it('displays sports for each school', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Wait for the sports to appear
    const sportsText = await screen.findByText(/Men's Basketball • Women's Basketball • Football/i);
    expect(sportsText).toBeInTheDocument();
  });
});

describe('Home Filter Feature', () => {
  beforeEach(() => {
    // Mock fetch for the Home component
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/filter/')) {
        const urlObj = new URL(url, 'http://localhost');
        const headCoachRating = urlObj.searchParams.get('head_coach');
        // Return a filtered school when head_coach equals '9'
        if (headCoachRating === '9') {
          return Promise.resolve(new Response(JSON.stringify([
            {
              id: 3,
              school_name: "Filtered Home School",
              conference: "Test Conference",
              location: "Test Location",
              available_sports: ["Men's Basketball"]
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
      } else if (url.includes('/api/public/schools/')) {
        // Return the default public schools list
        return Promise.resolve(new Response(JSON.stringify([
          {
            id: 1,
            school_name: "Public Default School",
            conference: "Test Conference",
            location: "Test Location",
            available_sports: ["Men's Basketball", "Football"]
          }
        ]), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' })
        }));
      }
      return Promise.reject(new Error('Unhandled endpoint'));
    });
  });

  it('opens filter dialog and applies filter in Home component', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Wait for the default public school to appear
    await waitFor(() => {
      expect(screen.getByText(/Public Default School/i)).toBeInTheDocument();
    });

    // Click the Filters button
    const filtersButton = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(filtersButton);

    // Wait for the filter dialog to appear (e.g., dialog title "Apply Filters")
    await waitFor(() => {
      expect(screen.getByText(/Apply Filters/i)).toBeInTheDocument();
    });

    // Change the Head Coach Rating dropdown to 9
    const headCoachSelect = screen.getByLabelText(/Head Coach Rating/i);
    fireEvent.change(headCoachSelect, { target: { value: '9' }});

    // Click the Apply button using getByRole with exact match
    const applyButton = screen.getByRole('button', { name: /^Apply$/i });
    fireEvent.click(applyButton);

    // Wait for the filtered school to appear
    await waitFor(() => {
      expect(screen.getByText(/Filtered Home School/i)).toBeInTheDocument();
    });
  });
});