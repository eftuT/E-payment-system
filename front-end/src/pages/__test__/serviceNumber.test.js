import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import ServiceNumber from '../serviceNumber.js';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('ServiceNumber', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

 // ...

test('should navigate to /payment when form is submitted with service number', () => {
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);
  
    render(
      <MemoryRouter>
        <ServiceNumber />
      </MemoryRouter>
    );
  
    const serviceNumberInput = screen.getByDisplayValue('serviceNumber');
    const nextButton = screen.getByText('NEXT');
  
    fireEvent.change(serviceNumberInput, { target: { value: '12345' } });
    fireEvent.click(nextButton);
  
    expect(navigateMock).toHaveBeenCalledWith('/payment', { state: { serviceNumber: '12345' } });
  });
});