import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {Alert, StyleSheet} from 'react-native';

import {useAuth} from '../../auth/auth-provider';
import {AccountSettingsScreen} from '../screens/AccountSettingsScreen';

jest.mock('@expo/vector-icons/Ionicons', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {View: MockView} = jest.requireActual<typeof import('react-native')>('react-native');
  return function MockIonicon(props: Record<string, unknown>) {
    return ReactModule.createElement(MockView, props);
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 24, right: 0, bottom: 12, left: 0}),
}));

jest.mock('../../auth/auth-provider', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;

describe('AccountSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: {
        full_name: 'Andi Pratama',
        email: 'andi@example.com',
        avatar_url: null,
      },
      logout: jest.fn(),
    });
  });

  it('menampilkan identitas dan pengaturan akun dengan jarak baris konsisten', () => {
    const screen = render(<AccountSettingsScreen />);

    expect(screen.getByText('Akun')).toBeTruthy();
    expect(screen.getByText('Andi Pratama')).toBeTruthy();
    expect(screen.getByText('andi@example.com')).toBeTruthy();
    expect(screen.getByText('Pengaturan Akun')).toBeTruthy();
    expect(screen.getByText('Informasi')).toBeTruthy();
    expect(screen.getByText('Ubah Kata Sandi')).toBeTruthy();
    expect(screen.getByText('Kebijakan Privasi')).toBeTruthy();
    expect(screen.getByText('Syarat & Ketentuan')).toBeTruthy();

    const passwordRow = screen.getByLabelText('Ubah Kata Sandi');
    expect(StyleSheet.flatten(passwordRow.props.style).minHeight).toBe(68);
  });

  it('menggunakan artwork header bersama dan meminta konfirmasi sebelum logout', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const screen = render(<AccountSettingsScreen />);

    expect(screen.getByTestId('account-header-artwork').props.source).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Keluar dari akun'));

    expect(alert).toHaveBeenCalledWith(
      'Keluar dari akun?',
      expect.any(String),
      expect.arrayContaining([expect.objectContaining({text: 'Keluar', style: 'destructive'})]),
    );
  });
});
