// This will be the testing file for Frontend Signup

import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders welcome message', () => {
  render(<App />);
  const linkElement = screen.getByText(/welcome to athletic insider/i);
  expect(linkElement).toBeInTheDocument();
});
