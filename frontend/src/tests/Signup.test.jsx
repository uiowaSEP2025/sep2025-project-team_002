// This will be the testing file for Frontend Signup
import React from 'react';
import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

test('renders welcome message', () => {
  render(<App />);
  const linkElement = screen.getByText(/Are you a transfer athlete/);
  expect(linkElement).toBeInTheDocument();
});
