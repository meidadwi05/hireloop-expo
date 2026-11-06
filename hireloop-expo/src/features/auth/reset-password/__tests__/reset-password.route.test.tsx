import {render, screen} from '@testing-library/react-native';
import {useLocalSearchParams} from 'expo-router';
import React from 'react';

import ResetPasswordRoute from '../../../../app/reset-password';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('../ResetPasswordScreen', () => {
  const mockReact = jest.requireActual<typeof import('react')>('react');
  const {Text: MockText} = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    __esModule: true,
    default: ({email, token}: {email: string; token: string}) =>
      mockReact.createElement(MockText, null, `reset-screen:${email}:${token}`),
  };
});

const mockSearchParams = jest.mocked(useLocalSearchParams);

describe('/reset-password route', () => {
  it('renders the Expo reset screen with the email link parameters', () => {
    mockSearchParams.mockReturnValue({
      email: 'candidate@example.com',
      token: 'reset-token',
    });

    render(<ResetPasswordRoute/>);

    expect(screen.getByText('reset-screen:candidate@example.com:reset-token')).toBeTruthy();
  });

  it('normalizes repeated query parameters before rendering the screen', () => {
    mockSearchParams.mockReturnValue({
      email: ['candidate@example.com', 'ignored@example.com'],
      token: ['reset-token', 'ignored-token'],
    });

    render(<ResetPasswordRoute/>);

    expect(screen.getByText('reset-screen:candidate@example.com:reset-token')).toBeTruthy();
  });
});
