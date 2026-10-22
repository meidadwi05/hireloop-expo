import {render} from '@testing-library/react-native';
import React from 'react';

import {useAuth} from '../../features/auth/auth-provider';
import IndexRoute from '../index';

jest.mock('expo-router', () => ({
  Redirect: ({href}: {href: string}) => {
    const ReactModule = jest.requireActual<typeof import('react')>('react');
    const {Text} = jest.requireActual<typeof import('react-native')>('react-native');
    return ReactModule.createElement(Text, {testID: 'redirect-target'}, href);
  },
}));

jest.mock('../../features/auth/auth-provider', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;

describe('routing awal aplikasi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mengarahkan user tanpa session ke onboarding intro', () => {
    mockedUseAuth.mockReturnValue({status: 'unauthenticated', user: null});
    const screen = render(<IndexRoute />);
    expect(screen.getByTestId('redirect-target').props.children).toBe('/(public)/welcome');
  });

  it('mempertahankan onboarding profil untuk user yang belum selesai', () => {
    mockedUseAuth.mockReturnValue({status: 'authenticated', user: {onboarding_finished: false}});
    const screen = render(<IndexRoute />);
    expect(screen.getByTestId('redirect-target').props.children).toBe('/(onboarding)/onboarding');
  });

  it('mengarahkan user yang sudah selesai ke dashboard', () => {
    mockedUseAuth.mockReturnValue({status: 'authenticated', user: {onboarding_finished: true}});
    const screen = render(<IndexRoute />);
    expect(screen.getByTestId('redirect-target').props.children).toBe('/(candidate)/(tabs)/home');
  });
});
