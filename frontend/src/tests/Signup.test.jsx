import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Signup from "../account/Signup.jsx";

describe('Signup Component', () => {
  it('renders signup form correctly', () => {
    render(
        <MemoryRouter>
          <Signup/>
        </MemoryRouter>
    );

    // Check if all required fields are rendered
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    const passwordFields = screen.getAllByLabelText(/password/i);
    expect(passwordFields).toHaveLength(2);

    //const confrimPasswordField = screen.getByLabelText(/confirm password/i);

    expect(passwordFields[0]).toBeInTheDocument();
    expect(passwordFields[1]).toBeInTheDocument();
  });
});