import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../App.jsx';

// Mock API response
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: "Test API Response" }),
  })
);

describe('App Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test
  });

  it('renders the Footer', () => {
    render(<App />);
    expect(screen.getByText(/©/)).toBeInTheDocument(); // Assuming the footer has a copyright symbol
  });
});