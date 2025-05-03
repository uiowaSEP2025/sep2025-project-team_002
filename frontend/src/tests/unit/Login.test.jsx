import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from "../../account/Login.jsx";
import { useNavigate, Routes, Route } from "react-router-dom";
import {useUser} from "../../context/UserContext.jsx";
import userEvent from '@testing-library/user-event';

vi.mock('../../context/UserContext', () => ({
  useUser: vi.fn(), // Mock the entire hook
}));

// Mock the navigate function from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

// Mock API_BASE_URL
vi.mock('../utils/config.js', () => ({ default: 'http://mock-api.com' }));

describe('Login Component', () => {
    it('renders login form correctly', () => {
        render(
            <MemoryRouter>
                <Login/>
            </MemoryRouter>
        );
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /login/i})).toBeInTheDocument();
    });

    it('updates input fields on user typing', () => {
        render(
            <MemoryRouter>
                <Login/>
            </MemoryRouter>
        );
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
        fireEvent.change(passwordInput, {target: {value: 'password123'}});

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

  it('handles successful login', async () => {
    const mockNavigate = vi.fn();
    const mockFetchUser = vi.fn().mockResolvedValue({}); // Mocking fetchUser
    // Set up useUser mock to return fetchUser
    useUser.mockReturnValue({ fetchUser: mockFetchUser });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access: 'mock-token' })
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securepassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/secure-home');
    });
  });

  it('shows error message on failed login', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed: /i)).toBeInTheDocument();
    });
  });

  it('uses errorData.detail when present on failed login', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ detail: 'Bad stuff happened' }),
        })
      );

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'u@x.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      expect(
        await screen.findByText(/Login failed: Bad stuff happened/i)
      ).toBeInTheDocument();
    });

  it('shows server unreachable message on fetch failure', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Failed to fetch')));

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'u@x.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      expect(
        await screen.findByText(/Unable to reach the server\. Please check your internet connection or try again later\./i)
      ).toBeInTheDocument();
    });

  it('shows generic network error if fetch throws other error', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Server died')));

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'u@x.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      expect(
        await screen.findByText(/Network error: Server died/i)
      ).toBeInTheDocument();
    });

  it('renders Back to Home link and navigates there', async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div data-testid="home-page">Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      // It's rendered as an <a> with role="link"
      const backLink = screen.getByRole('link', { name: /back to home/i });
      await userEvent.click(backLink);

      expect(await screen.findByTestId('home-page')).toBeInTheDocument();
    });

  it('has a Forgot Password link pointing to /forgot-password', () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const forgot = screen.getByText(/forgot password\?/i);
      expect(forgot).toHaveAttribute('href', '/forgot-password');
    });

  it('has a Sign up here link pointing to /signup', () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const signup = screen.getByText(/sign up here/i);
      expect(signup).toHaveAttribute('href', '/signup');
    });

  it('delays fadeIn when location.state.fromSignup is set', () => {
      vi.useFakeTimers();

      const { container } = render(
        <MemoryRouter
          initialEntries={[{ pathname: '/login', state: { fromSignup: true } }]}
        >
          <Login />
        </MemoryRouter>
      );

      const rootBox = container.firstChild;
      // before timeout
      expect(rootBox).toHaveStyle('opacity: 0');

      act(() => {
        vi.advanceTimersByTime(50);
      });

      // after 50ms
      expect(rootBox).toHaveStyle('opacity: 1');
      vi.useRealTimers();
    });

   it('shows validation error when email or password is missing', async () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

        // Manually submit the form so handleSubmit runs for empty inputs
    const form = container.querySelector('form');
    fireEvent.submit(form);

    // Now the validation message should appear
    const errorMsg = await screen.findByText(/Please enter both email and password!/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('toggles feature list visibility when clicking the "peek" box', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByTestId('ArrowDropDownIcon')).toBeInTheDocument();
    const peekBox = screen.getByText(/Take a peek at our top features/i);
    fireEvent.click(peekBox);

    expect(screen.getByTestId('ArrowDropUpIcon')).toBeInTheDocument();
    fireEvent.click(peekBox);
    expect(screen.getByTestId('ArrowDropDownIcon')).toBeInTheDocument();
  });

  it('immediately fades in when no navigation state is provided', async () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const rootBox = container.firstChild;
    // Wait for the useEffect to run and setFadeIn(true)
    await waitFor(() => {
      expect(rootBox).toHaveStyle('opacity: 1');
    });
  });

  it('uses fallback message when errorData has neither detail nor error', async () => {
    // Mock a failed login with an empty error object
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({})  // no detail, no error
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Fill in credentials and submit
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'u@x.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Should show the fallback message "Invalid credentials"
    expect(
      await screen.findByText(/Login failed: Invalid credentials/i)
    ).toBeInTheDocument();
  });

  it('immediately sets opacity to 1 when no location.state is provided', async () => {
  const { container } = render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
  const rootBox = container.firstChild;

  // Wait for the effect to flush and set fadeIn → true
  await waitFor(() => {
    expect(rootBox).toHaveStyle('opacity: 1');
  });

});

  it('delays fadeIn when location.state.fromHome is set', () => {
  vi.useFakeTimers();

  const { container } = render(
    <MemoryRouter
      initialEntries={[{ pathname: '/login', state: { fromHome: true } }]}
    >
      <Login />
    </MemoryRouter>
  );

  const rootBox = container.firstChild;
  // before the 50ms timer, opacity should still be 0
  expect(rootBox).toHaveStyle('opacity: 0');

  // advance the fake timer to trigger the timeout
  act(() => {
    vi.advanceTimersByTime(50);
  });

  // after the timeout, fadeIn(true) runs and opacity becomes 1
  expect(rootBox).toHaveStyle('opacity: 1');

  vi.useRealTimers();
});

  it('delays fadeIn when location.state.fromNavbar is set', () => {
    vi.useFakeTimers();

    const { container } = render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { fromNavbar: true } }]}
      >
        <Login />
      </MemoryRouter>
    );

    const rootBox = container.firstChild;
    // before timeout, fadeIn(false) → opacity:0
    expect(rootBox).toHaveStyle('opacity: 0');

    // advance the 50ms timer
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // after timer, fadeIn(true) → opacity:1
    expect(rootBox).toHaveStyle('opacity: 1');

    vi.useRealTimers();
  });

});

