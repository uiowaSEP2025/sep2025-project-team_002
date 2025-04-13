import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from '../../home/Home.jsx';
import { act } from 'react';

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
    fireEvent.change(headCoachSelect, { target: { value: '9' } });

    // Click the Apply button using getByRole with exact match
    const applyButton = screen.getByRole('button', { name: /^Apply$/i });
    fireEvent.click(applyButton);

    // Wait for the filtered school to appear
    await waitFor(() => {
      expect(screen.getByText(/Filtered Home School/i)).toBeInTheDocument();
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
    }));

    // Mock global.fetch to return the fake schools.
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeSchools),
      })
    );
  });

  it('allows the jump to page input to change pages', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Wait until the first page school cards (headings with level 6) are rendered.
    await waitFor(() => {
      const schoolHeadings = screen.getAllByRole('heading', { level: 6 });
      expect(schoolHeadings.length).toBe(10); // 10 schools on page 1
    });

    // Locate the jump-to input (a number input with role "spinbutton").
    const jumpInput = screen.getByRole('spinbutton');

    // Simulate changing the input value to "2".
    fireEvent.change(jumpInput, { target: { value: '2' } });
    // Trigger an event to ensure the change is processed (Enter key press or blur)
    fireEvent.keyDown(jumpInput, { key: 'Enter', code: 'Enter' });
    // Alternatively, you could use:
    // fireEvent.blur(jumpInput);

    // Wait until the page updates to page 2.
    await waitFor(() => {
      const schoolHeadings = screen.getAllByRole('heading', { level: 6 });
      // With 15 total schools, page 2 should contain only 5 schools.
      expect(schoolHeadings.length).toBe(5);
    });

    // Retrieve the school names on page 2.
    const schoolHeadings = screen.getAllByRole('heading', { level: 6 });
    const secondPageNames = schoolHeadings.map((el) => el.textContent);

    // Verify that schools 11-15 are present on page 2.
    for (let i = 11; i <= 15; i++) {
      expect(secondPageNames).toContain(`School ${i}`);
    }
    // Verify that schools 1-10 are not present on page 2.
    for (let i = 1; i <= 10; i++) {
      expect(secondPageNames).not.toContain(`School ${i}`);
    }
  });
});