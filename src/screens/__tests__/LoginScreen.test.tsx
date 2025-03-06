import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../state/slices/authSlice';
import LoginScreen from '../LoginScreen';

// Create a mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

// Mock the auth service
jest.mock('../../api/authService', () => ({
  authService: {
    login: jest.fn().mockImplementation(() => Promise.resolve({ token: 'test-token' })),
  },
}));

describe('LoginScreen', () => {
  const renderComponent = () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    return render(
      <Provider store={store}>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </Provider>
    );
  };

  it('renders correctly', () => {
    const { getByText, getAllByText } = renderComponent();
    
    // Check if title is rendered
    expect(getByText('Odoo')).toBeTruthy();
    expect(getByText('Voice Assistant')).toBeTruthy();
    
    // Check if login button is rendered
    expect(getByText('Login')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByText } = renderComponent();
    
    // Tap login without entering data
    fireEvent.press(getByText('Login'));
    
    // Check for validation error (we're using Alert.alert in the component)
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('attempts login with valid inputs', async () => {
    const { getByText, getByLabelText } = renderComponent();
    
    // Fill in the form
    fireEvent.changeText(getByLabelText('Username'), 'testuser');
    fireEvent.changeText(getByLabelText('Password'), 'password123');
    fireEvent.changeText(getByLabelText('Server URL'), 'https://test.odoo.com');
    
    // Submit the form
    fireEvent.press(getByText('Login'));
    
    // Check that navigation occurred after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Main');
    });
  });
});