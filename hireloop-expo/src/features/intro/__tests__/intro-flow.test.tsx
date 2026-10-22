import {act, fireEvent, render} from '@testing-library/react-native';
import {router} from 'expo-router';
import React from 'react';

import WelcomeRoute from '../../../app/(public)/welcome';
import {ONBOARDING_SPLASH_DURATION_MS} from '../components/OnboardingSplash';

jest.mock('expo-router', () => ({
  router: {replace: jest.fn()},
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

const mockedRouter = router as jest.Mocked<typeof router>;

describe('alur onboarding intro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('menampilkan splash selama 3,5 detik sebelum onboarding pertama', () => {
    const screen = render(<WelcomeRoute />);

    expect(ONBOARDING_SPLASH_DURATION_MS).toBe(3500);
    expect(screen.getByTestId('onboarding-splash')).toBeTruthy();
    expect(screen.queryByText('Lamar kerja lebih\ncepat & tepat sasaran')).toBeNull();

    act(() => jest.advanceTimersByTime(3499));
    expect(screen.getByTestId('onboarding-splash')).toBeTruthy();

    act(() => jest.advanceTimersByTime(1));
    jest.useRealTimers();
    expect(screen.getAllByText('Lamar kerja lebih\ncepat & tepat sasaran')).toHaveLength(2);
    expect(screen.getByTestId('gradient-intro-title')).toBeTruthy();
  });

  it('memakai gradient hanya pada onboarding pertama dan ketiga', () => {
    const screen = render(<WelcomeRoute />);
    act(() => jest.advanceTimersByTime(ONBOARDING_SPLASH_DURATION_MS));
    jest.useRealTimers();

    expect(screen.getByTestId('gradient-intro-title')).toBeTruthy();
    fireEvent.press(screen.getByText('Lanjut'));
    expect(screen.getByText('Pantau Proses Lamaran\nSecara Real-Time')).toBeTruthy();
    expect(screen.queryByTestId('gradient-intro-title')).toBeNull();

    fireEvent.press(screen.getByText('Lanjut'));
    expect(screen.getAllByText('Lamar ke Banyak\nPerusahaan Sekaligus')).toHaveLength(2);
    expect(screen.getByTestId('gradient-intro-title')).toBeTruthy();

    fireEvent.press(screen.getByText('Lanjut'));
    expect(screen.getByText('Temukan Pekerjaan\nyang Tepat')).toBeTruthy();
    expect(screen.queryByTestId('gradient-intro-title')).toBeNull();
  });

  it('mengarahkan tombol lewati dan tombol terakhir ke login', () => {
    const screen = render(<WelcomeRoute />);
    act(() => jest.advanceTimersByTime(ONBOARDING_SPLASH_DURATION_MS));
    jest.useRealTimers();

    fireEvent.press(screen.getByText('Lewati'));
    expect(mockedRouter.replace).toHaveBeenCalledWith('/(public)/login');

    fireEvent.press(screen.getByText('Lanjut'));
    fireEvent.press(screen.getByText('Lanjut'));
    fireEvent.press(screen.getByText('Lanjut'));
    fireEvent.press(screen.getByText('Mulai Sekarang'));
    expect(mockedRouter.replace).toHaveBeenLastCalledWith('/(public)/login');
    screen.unmount();
  });
});
