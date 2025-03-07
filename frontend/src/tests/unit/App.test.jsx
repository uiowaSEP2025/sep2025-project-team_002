import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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