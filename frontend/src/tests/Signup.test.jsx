import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Signup from "../account/Signup.jsx";
import userEvent from "@testing-library/user-event";


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
    //expect(passwordFields).toHaveLength(2);

    //const confrimPasswordField = screen.getByLabelText(/confirm password/i);

    expect(passwordFields[0]).toBeInTheDocument();
    expect(passwordFields[1]).toBeInTheDocument();
  });

   it('validates password matching', async () => {
        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        const passwordFields = screen.getAllByLabelText(/password/i);
        //expect(passwordFields).toHaveLength(2);


        // Simulate user typing in the password and confirm password fields
        fireEvent.change(passwordFields[0], { target: { value: 'password123' } });
        fireEvent.change(passwordFields[1], { target: { value: 'password321' } });

        // Wait for validation to reflect the error state
        await waitFor(() => {
            expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
        });
    });

    it('shows password matching success when passwords match', async () => {
        render(
            <MemoryRouter>
                <Signup/>
            </MemoryRouter>
        );

        const passwordFields = screen.getAllByLabelText(/password/i);
        //expect(passwordFields).toHaveLength(2);

        // Simulate user typing in the password and confirm password fields
        fireEvent.change(passwordFields[0], {target: {value: 'password123'}});
        fireEvent.change(passwordFields[1], {target: {value: 'password123'}});

        // Wait for validation to reflect the success state
        await waitFor(() => {
            expect(screen.getByText(/Passwords match/i)).toBeInTheDocument();
        });
    });
});
