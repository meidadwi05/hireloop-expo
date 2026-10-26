import {act, fireEvent, render, within} from '@testing-library/react-native';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React from 'react';
import {StyleSheet} from 'react-native';

import WelcomeRoute from '../../../app/(public)/welcome';
import {ONBOARDING_SPLASH_DURATION_MS} from '../components/OnboardingSplash';

jest.mock('expo-router', () => ({
  router: {replace: jest.fn()},
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: jest.fn(() => null),
}));

const mockedRouter = router as jest.Mocked<typeof router>;
const mockedStatusBar = StatusBar as unknown as jest.Mock;

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
    const firstSlide = within(screen.getByTestId('intro-slide-discover'));
    expect(firstSlide.getAllByText('Lamar kerja lebih\ncepat & tepat sasaran')).toHaveLength(2);
    expect(firstSlide.getByTestId('gradient-intro-title')).toBeTruthy();
  });

  it('memakai gradient hanya pada onboarding pertama dan ketiga', () => {
    const screen = render(<WelcomeRoute />);
    act(() => jest.advanceTimersByTime(ONBOARDING_SPLASH_DURATION_MS));
    jest.useRealTimers();

    expect(within(screen.getByTestId('intro-slide-discover')).getByTestId('gradient-intro-title')).toBeTruthy();
    fireEvent.press(screen.getByText('Lanjut'));
    expect(within(screen.getByTestId('intro-slide-tracking')).getByText('Pantau Proses Lamaran\nSecara Real-Time')).toBeTruthy();
    expect(within(screen.getByTestId('intro-slide-tracking')).queryByTestId('gradient-intro-title')).toBeNull();

    fireEvent.press(screen.getByText('Lanjut'));
    const thirdSlide = within(screen.getByTestId('intro-slide-multi-apply'));
    expect(thirdSlide.getAllByText('Lamar ke Banyak\nPerusahaan Sekaligus')).toHaveLength(2);
    expect(thirdSlide.getByTestId('gradient-intro-title')).toBeTruthy();

    fireEvent.press(screen.getByText('Lanjut'));
    const fourthSlide = within(screen.getByTestId('intro-slide-recommendation'));
    expect(fourthSlide.getByText('Temukan Pekerjaan\nyang Tepat')).toBeTruthy();
    expect(fourthSlide.queryByTestId('gradient-intro-title')).toBeNull();
  });

  it('memperbarui slide dan titik aktif saat halaman digeser', () => {
    const screen = render(<WelcomeRoute />);
    act(() => jest.advanceTimersByTime(ONBOARDING_SPLASH_DURATION_MS));
    jest.useRealTimers();

    expect(StyleSheet.flatten(screen.getByTestId('intro-screen').props.style).backgroundColor).toBe('#FFFFFF');
    expect(StyleSheet.flatten(screen.getByText('Lewati').props.style).color).toBe('#00195E');

    fireEvent(screen.getByTestId('intro-slides'), 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: {x: 320, y: 0},
        layoutMeasurement: {width: 320, height: 700},
      },
    });

    expect(within(screen.getByTestId('intro-slide-tracking')).getByText('Pantau Proses Lamaran\nSecara Real-Time')).toBeTruthy();
    expect(screen.getByLabelText('Halaman onboarding 1').props.accessibilityState).toEqual({selected: false});
    expect(screen.getByLabelText('Halaman onboarding 2').props.accessibilityState).toEqual({selected: true});
    expect(StyleSheet.flatten(screen.getByTestId('intro-screen').props.style).backgroundColor).toBe('#050D49');
    expect(StyleSheet.flatten(screen.getByText('Lewati').props.style).color).toBe('#FFFFFF');
  });

  it('memperbarui state yang sama saat swipe maju dan kembali', () => {
    const screen = render(<WelcomeRoute />);
    act(() => jest.advanceTimersByTime(ONBOARDING_SPLASH_DURATION_MS));
    jest.useRealTimers();
    const carousel = screen.getByTestId('intro-slides');

    fireEvent(carousel, 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: {x: 640, y: 0},
        layoutMeasurement: {width: 320, height: 700},
      },
    });
    expect(screen.getByLabelText('Halaman onboarding 3').props.accessibilityState).toEqual({selected: true});
    expect(screen.getByText('Lanjut')).toBeTruthy();

    fireEvent(carousel, 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: {x: 0, y: 0},
        layoutMeasurement: {width: 320, height: 700},
      },
    });
    expect(screen.getByLabelText('Halaman onboarding 1').props.accessibilityState).toEqual({selected: true});
    expect(screen.getByLabelText('Halaman onboarding 3').props.accessibilityState).toEqual({selected: false});
    expect(StyleSheet.flatten(screen.getByTestId('intro-screen').props.style).backgroundColor).toBe('#FFFFFF');
    expect(StyleSheet.flatten(screen.getByText('Lewati').props.style).color).toBe('#00195E');
  });

  it('melanjutkan tombol dari halaman terakhir hasil swipe', () => {
    const screen = render(<WelcomeRoute />);
    act(() => jest.advanceTimersByTime(ONBOARDING_SPLASH_DURATION_MS));
    jest.useRealTimers();

    fireEvent(screen.getByTestId('intro-slides'), 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: {x: 640, y: 0},
        layoutMeasurement: {width: 320, height: 700},
      },
    });
    fireEvent.press(screen.getByText('Lanjut'));

    expect(screen.getByLabelText('Halaman onboarding 4').props.accessibilityState).toEqual({selected: true});
    expect(screen.getByText('Mulai Sekarang')).toBeTruthy();
  });

  it('menghasilkan state visual swipe yang sama dengan tombol Lanjut pada setiap halaman', () => {
    const readVisualState = (screen: ReturnType<typeof render>) => {
      const statusBarCall = mockedStatusBar.mock.calls[mockedStatusBar.mock.calls.length - 1];

      return {
        activeIndex: [1, 2, 3, 4].findIndex(itemIndex => (
          screen.getByLabelText(`Halaman onboarding ${itemIndex}`).props.accessibilityState.selected
        )),
        backgroundColor: StyleSheet.flatten(screen.getByTestId('intro-screen').props.style).backgroundColor,
        statusBarStyle: statusBarCall?.[0]?.style,
        skipColor: StyleSheet.flatten(screen.getByText('Lewati').props.style).color,
        buttonText: screen.queryByText('Mulai Sekarang') ? 'Mulai Sekarang' : 'Lanjut',
      };
    };

    const buttonScreen = render(<WelcomeRoute />);
    act(() => jest.advanceTimersByTime(ONBOARDING_SPLASH_DURATION_MS));
    jest.useRealTimers();

    const buttonStates = [readVisualState(buttonScreen)];
    for (let slideIndex = 1; slideIndex < 4; slideIndex += 1) {
      fireEvent.press(buttonScreen.getByText('Lanjut'));
      buttonStates.push(readVisualState(buttonScreen));
    }
    buttonScreen.unmount();

    mockedStatusBar.mockClear();
    jest.useFakeTimers();
    const swipeScreen = render(<WelcomeRoute />);
    act(() => jest.advanceTimersByTime(ONBOARDING_SPLASH_DURATION_MS));
    jest.useRealTimers();

    const swipeStates = [readVisualState(swipeScreen)];
    for (let slideIndex = 1; slideIndex < 4; slideIndex += 1) {
      fireEvent(swipeScreen.getByTestId('intro-slides'), 'momentumScrollEnd', {
        nativeEvent: {
          contentOffset: {x: 320 * slideIndex, y: 0},
          layoutMeasurement: {width: 320, height: 700},
        },
      });
      swipeStates.push(readVisualState(swipeScreen));
    }

    expect(swipeStates).toEqual(buttonStates);
    expect(swipeStates).toEqual([
      {activeIndex: 0, backgroundColor: '#FFFFFF', statusBarStyle: 'dark', skipColor: '#00195E', buttonText: 'Lanjut'},
      {activeIndex: 1, backgroundColor: '#050D49', statusBarStyle: 'light', skipColor: '#FFFFFF', buttonText: 'Lanjut'},
      {activeIndex: 2, backgroundColor: '#FFFFFF', statusBarStyle: 'dark', skipColor: '#00195E', buttonText: 'Lanjut'},
      {activeIndex: 3, backgroundColor: '#050D49', statusBarStyle: 'light', skipColor: '#FFFFFF', buttonText: 'Mulai Sekarang'},
    ]);
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
