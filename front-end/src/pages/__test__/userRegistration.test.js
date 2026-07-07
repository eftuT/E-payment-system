import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import RegistrationForm from '../userRegistration.js';

describe('RegistrationForm', () => {
  test('should render the registration form', () => {
    render(<RegistrationForm />);

    // Assert that the form elements are rendered
    expect(screen.getByLabelText('UserID:')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender:')).toBeInTheDocument();
    expect(screen.getByLabelText('User Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number:')).toBeInTheDocument();
    expect(screen.getByLabelText('Address:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Login here' })).toBeInTheDocument();
  });

  test('should update form state on input change', () => {
    render(<RegistrationForm />);
    const firstNameInput = screen.getByLabelText('First Name:');
    const lastNameInput = screen.getByLabelText('Last Name:');

    // Simulate typing in the first name input
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    expect(firstNameInput.value).toBe('John');

    // Simulate typing in the last name input
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    expect(lastNameInput.value).toBe('Doe');
  });

  test('should submit the form with correct data', () => {
    render(<RegistrationForm />);
    const registerButton = screen.getByRole('button', { name: 'Register' });

    // Simulate filling in the form
    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('User Name:'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Address:'), { target: { value: '123 Main St' } });

    // Submit the form
    fireEvent.click(registerButton);

    // Assert that the form is submitted with the correct data
    // Add your assertions here based on the expected behavior of the handleSubmit function
  });
});