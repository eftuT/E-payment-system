import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import UserLogin from '../userLogin.js';

jest.mock('axios'); // Mock axios module

describe('UserLogin', () => {
  test('renders the login form', () => {
    render(<UserLogin />);
    
    // Assert that the login form elements are rendered
    expect(screen.getByLabelText('User Name or Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
  });

  test('submits the login form and redirects on successful login', async () => {
    const mockResponse = {
      status: 200,
      data: {
        user: { id: 123, name: 'John Doe', email: 'johndoe@example.com' }
      }
    };
    axios.post.mockResolvedValue(mockResponse); // Mock the axios post method to resolve with a mock response

    render(<UserLogin />);

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText('User Name or Email Address'), {
      target: { value: 'johndoe@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    // Assert that the form submission is handled correctly
    expect(axios.post).toHaveBeenCalledWith('http://localhost:3000/Users/login', {
      identifier: 'johndoe@example.com',
      Password: 'password'
    });
    expect(screen.getByText('User logged in successfully')).toBeInTheDocument();

    // Wait for the redirect to happen
    await waitFor(() => {
      expect(screen.getByText('HomePage')).toBeInTheDocument();
    });
  });

  test('displays an error message on failed login', async () => {
    const mockResponse = {
      status: 400,
      data: {
        error: 'Invalid credentials'
      }
    };
    axios.post.mockRejectedValue({ response: mockResponse }); // Mock the axios post method to reject with a mock response

    render(<UserLogin />);

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText('User Name or Email Address'), {
      target: { value: 'johndoe@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    // Assert that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Incorrect User name or password')).toBeInTheDocument();
    });
  });
});