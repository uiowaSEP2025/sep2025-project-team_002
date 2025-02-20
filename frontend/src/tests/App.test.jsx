import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

describe('App Component', () => {
  it('renders welcome message', () => {
    render(<App />);
    const linkElement = screen.getByText(/welcome to athletic insider/i);
    expect(linkElement).toBeInTheDocument();
  });
});