// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock `window.location`
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost/',
    origin: 'http://localhost/',
    pathname: '/',
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});
