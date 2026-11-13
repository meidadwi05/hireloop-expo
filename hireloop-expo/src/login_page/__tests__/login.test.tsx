import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import LoginPage from '../login';
import {LOGIN_WELCOME_GRADIENT_COLORS} from '../components/gradient-welcome.constants';

const baseProps = {
  email: '',
  password: '',
  errors: {},
  remember: true,
  notice: '',
  loading: false,
  googleLoading: false,
  onEmailChange: jest.fn(),
  onPasswordChange: jest.fn(),
  onRememberChange: jest.fn(),
  onLogin: jest.fn(),
  onGoogleLogin: jest.fn(),
  onForgotPassword: jest.fn(),
  onRegister: jest.fn(),
};

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('memakai background, heading gradient, dan asset Google yang ditentukan', () => {
    const screen = render(<LoginPage {...baseProps} />);

    expect(screen.getByTestId('login-background')).toBeTruthy();
    expect(screen.getByTestId('google-login-logo')).toBeTruthy();
    expect(screen.getByTestId('login-lock-image')).toBeTruthy();
    expect(screen.getByTestId('login-welcome-gradient')).toBeTruthy();
    expect(LOGIN_WELCOME_GRADIENT_COLORS).toEqual(['#0051FD', '#00DAFD']);
  });

  it('menampilkan fallback keamanan jika decoder gambar iOS gagal', () => {
    const screen = render(<LoginPage {...baseProps} />);

    fireEvent(screen.getByTestId('login-lock-image'), 'error');

    expect(screen.getByTestId('login-lock-fallback')).toBeTruthy();
  });

  it('tidak menampilkan copy debug atau akses kembali ke onboarding', () => {
    const screen = render(<LoginPage {...baseProps} />);

    expect(screen.queryByText(/API KANDIDAT/i)).toBeNull();
    expect(screen.queryByText(/LARAVEL SANCTUM/i)).toBeNull();
    expect(screen.queryByText(/Lihat onboarding/i)).toBeNull();
  });

  it('mempertahankan aksi login Google dan registrasi', () => {
    const screen = render(<LoginPage {...baseProps} />);

    fireEvent.press(screen.getByText('Masuk dengan Google'));
    fireEvent.press(screen.getByText('Daftar Sekarang'));

    expect(baseProps.onGoogleLogin).toHaveBeenCalledTimes(1);
    expect(baseProps.onRegister).toHaveBeenCalledTimes(1);
  });
});
