import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from '../../home/Home.jsx';
import { act } from 'react';
import * as MUI from '@mui/material';

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
            available_sports: ["Men's Basketball", "Women's Basketball", "Football"],
            review_count: 125,
            average_rating: 8.5
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
    const schoolsElement = screen.getByText('Athletic Insider');
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
              available_sports: ["Men's Basketball"],
              review_count: 75,
              average_rating: 9.2
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
            available_sports: ["Men's Basketball", "Football"],
            review_count: 42,
            average_rating: 7.8
          }
        ]), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' })
        }));
      }
      return Promise.reject(new Error('Unhandled endpoint'));
    });
  });

  it('opens and closes filter dialog in Home component', async () => {
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

    // Wait for the filter dialog to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Verify that the dialog contains the expected elements
    expect(screen.getByText('Rating Filters (Minimum Rating)')).toBeInTheDocument();

    // Check for the sport dropdown
    const sportDropdown = screen.getByRole('combobox', { name: /Choose Sport/i });
    expect(sportDropdown).toBeInTheDocument();

    // Click the Apply Filters button
    const applyButton = screen.getByTestId('apply-filters-button');
    fireEvent.click(applyButton);

    // Wait for the dialog to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

describe('Home Pagination Feature', () => {
  beforeEach(() => {

    // Create an array of 15 fake schools so that:
    // - Page 1 shows 10 schools (indices 0-9)
    // - Page 2 shows 5 schools (indices 10-14)
    const fakeSchools = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      school_name: `School ${i + 1}`,
      conference: "Test Conference",
      location: "Test Location",
      available_sports: ["Sport A", "Sport B"],
      review_count: Math.floor(Math.random() * 600),
      average_rating: (Math.random() * 5 + 5).toFixed(1),
    }));

    // Mock global.fetch to return the fake schools.
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeSchools),
      })
    );
    window.innerWidth = 1024;
  });

  it('allows the jump to page input to change pages on desktop', async () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { level: 6 }).length).toBe(10);
      });

      // Get all school names from page 1
      const firstPageSchools = screen.getAllByRole('heading', { level: 6 })
        .map(el => el.textContent);

      // Change to page 2
      const jumpInput = screen.getByRole('spinbutton');
      fireEvent.change(jumpInput, { target: { value: '2' } });
      fireEvent.keyDown(jumpInput, { key: 'Enter', code: 'Enter' });

      // Wait for page 2 to load
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { level: 6 }).length).toBe(5);
      });

      // Get all school names from page 2
      const secondPageSchools = screen.getAllByRole('heading', { level: 6 })
        .map(el => el.textContent);

      // Verify no overlap between pages
      secondPageSchools.forEach(school => {
        expect(firstPageSchools).not.toContain(school);
      });

      // Verify counts are correct
      expect(firstPageSchools.length).toBe(10);
      expect(secondPageSchools.length).toBe(5);
    });
});