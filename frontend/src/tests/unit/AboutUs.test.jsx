import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AboutUs from '../../components/AboutUs.jsx';
import { describe, it, expect, vi } from 'vitest';

// Mocking images to prevent errors during test rendering
vi.mock('../assets/anna.png', () => 'anna.png');
vi.mock('../assets/yusuf.png', () => 'yusuf.png');
vi.mock('../assets/sam.png', () => 'sam.png');
vi.mock('../assets/rod.png', () => 'rod.png');
vi.mock('../assets/jingming.png', () => 'jingming.png');

describe('AboutUs Component', () => {
  it('renders the header title correctly', () => {
    render(
      <MemoryRouter>
        <AboutUs />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Athletic Insider' })).toBeInTheDocument();
  });

  it('renders the description correctly', () => {
    render(
      <MemoryRouter>
        <AboutUs />
      </MemoryRouter>
    );

    expect(screen.getByText(/Who we are:/)).toBeInTheDocument();
    expect(screen.getByText(/Your go-to platform for the latest in sports transfer insights./)).toBeInTheDocument();
  });

  it('renders all team members with images and names', () => {
    render(
      <MemoryRouter>
        <AboutUs />
      </MemoryRouter>
    );

    const teamMembers = [
      "Samantha Pothitakis",
      "Rodrigo Medina",
      "Jingming Liang",
      "Yusuf Halim",
      "Anna Davis"
    ];

    teamMembers.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByAltText(name)).toBeInTheDocument();
    });
  });

  it('renders the back button', () => {
    render(
      <MemoryRouter>
        <AboutUs />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /← Back/ })).toBeInTheDocument();
  });
});
