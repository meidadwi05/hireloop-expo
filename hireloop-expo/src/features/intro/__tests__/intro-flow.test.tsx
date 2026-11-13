import {act, fireEvent, render, within} from '@testing-library/react-native';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React from 'react';
import {AccessibilityInfo, Animated, StyleSheet} from 'react-native';

import WelcomeRoute from '../../../app/(public)/welcome';
import {
  ONBOARDING_SPLASH_DURATION_MS,
  ONBOARDING_SPLASH_LINE_DURATION_MS,
  ONBOARDING_SPLASH_LOGO_DURATION_MS,
  ONBOARDING_SPLASH_TAGLINE_DURATION_MS,
  ONBOARDING_SPLASH_TAGLINE_STAGGER_MS,
} from '../components/OnboardingSplash';

jest.mock('expo-router', () => ({router: {replace: jest.fn()}}));
jest.mock('expo-status-bar', () => ({StatusBar: jest.fn(() => null)}));

const mockedRouter = router as jest.Mocked<typeof router>;
const mockedStatusBar = StatusBar as unknown as jest.Mock;
const TEST_PAGE_WIDTH = 320;
const slideIds = ['discover', 'tracking', 'multi-apply', 'recommendation'] as const;

async function finishSplash() {
  act(() => jest.advanceTimersByTime(ONBOARDING_SPLASH_DURATION_MS));
  await act(async () => Promise.resolve());
}

function settleOnSlide(screen: ReturnType<typeof render>, slideIndex: number) {
  fireEvent(screen.getByTestId('intro-slides'), 'momentumScrollEnd', {
    nativeEvent: {
      contentOffset: {x: TEST_PAGE_WIDTH * slideIndex, y: 0},
      layoutMeasurement: {width: TEST_PAGE_WIDTH, height: 700},
    },
  });
}

function activeSlide(screen: ReturnType<typeof render>, index: number) {
  return within(screen.getByTestId(`intro-slide-${slideIds[index]}`));
}

describe('alur onboarding intro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('menampilkan splash 3,5 detik dengan logo, loading line, dan tagline terpisah', async () => {
    const timingSpy = jest.spyOn(Animated, 'timing');
    const screen = render(<WelcomeRoute />);

    expect(ONBOARDING_SPLASH_DURATION_MS).toBe(3500);
    expect(ONBOARDING_SPLASH_LINE_DURATION_MS).toBe(3500);
    expect(ONBOARDING_SPLASH_LOGO_DURATION_MS).toBe(900);
    expect(ONBOARDING_SPLASH_TAGLINE_DURATION_MS).toBe(720);
    expect(ONBOARDING_SPLASH_TAGLINE_STAGGER_MS).toBe(220);
    expect(screen.getByTestId('splash-logo')).toBeTruthy();
    expect(screen.getByTestId('splash-gradient-line')).toBeTruthy();
    expect(screen.getByTestId('splash-tagline-one')).toBeTruthy();
    expect(screen.getByTestId('splash-tagline-two')).toBeTruthy();
    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({duration: 3500, toValue: 1, useNativeDriver: true}),
    );

    act(() => jest.advanceTimersByTime(3499));
    expect(screen.getByTestId('onboarding-splash')).toBeTruthy();
    await finishSplash();
    expect(screen.getByTestId('intro-screen')).toBeTruthy();
  }, 10000);

  it('menempatkan seluruh kontrol di dalam setiap halaman pager', async () => {
    const screen = render(<WelcomeRoute />);
    await finishSplash();

    for (let index = 0; index < slideIds.length; index += 1) {
      settleOnSlide(screen, index);
      const slide = activeSlide(screen, index);
      expect(slide.getByTestId('intro-vertical-scroll')).toBeTruthy();
      expect(slide.getByLabelText('Lewati onboarding')).toBeTruthy();
      expect(slide.getByTestId('intro-hero-image')).toBeTruthy();
      expect(slide.getByTestId('intro-dots')).toBeTruthy();
      expect(slide.getByText(index === 3 ? 'Mulai Sekarang' : 'Selanjutnya')).toBeTruthy();
    }

    expect(screen.queryByTestId('intro-footer-controls')).toBeNull();
  });

  it('menjaga label CTA tepat di tengah', async () => {
    const screen = render(<WelcomeRoute />);
    await finishSplash();

    const slide = activeSlide(screen, 0);
    const rowStyle = StyleSheet.flatten(slide.getByTestId('intro-next-label-row').props.style);
    const labelStyle = StyleSheet.flatten(slide.getByTestId('intro-next-label').props.style);

    expect(rowStyle.justifyContent).toBe('center');
    expect(labelStyle.textAlign).toBe('center');
  });

  it('memakai judul gradient hanya pada halaman pertama dan ketiga', async () => {
    const screen = render(<WelcomeRoute />);
    await finishSplash();

    expect(activeSlide(screen, 0).getByTestId('gradient-intro-title')).toBeTruthy();
    settleOnSlide(screen, 1);
    expect(activeSlide(screen, 1).queryByTestId('gradient-intro-title')).toBeNull();
    settleOnSlide(screen, 2);
    expect(activeSlide(screen, 2).getByTestId('gradient-intro-title')).toBeTruthy();
    settleOnSlide(screen, 3);
    expect(activeSlide(screen, 3).queryByTestId('gradient-intro-title')).toBeNull();
  });

  it('mengubah seluruh tema, status bar, indikator, dan CTA saat swipe maju maupun mundur', async () => {
    const screen = render(<WelcomeRoute />);
    await finishSplash();

    const assertState = (index: number, background: string, statusBar: 'dark' | 'light') => {
      const slide = activeSlide(screen, index);
      expect(StyleSheet.flatten(screen.getByTestId(`intro-slide-${slideIds[index]}`).props.style).backgroundColor).toBe(background);
      expect(slide.getByLabelText(`Halaman onboarding ${index + 1}`).props.accessibilityState).toEqual({selected: true});
      expect(slide.getByText(index === 3 ? 'Mulai Sekarang' : 'Selanjutnya')).toBeTruthy();
      expect(mockedStatusBar.mock.calls[mockedStatusBar.mock.calls.length - 1]?.[0]?.style).toBe(statusBar);
    };

    assertState(0, '#FFFFFF', 'dark');
    settleOnSlide(screen, 1);
    assertState(1, '#050D49', 'light');
    settleOnSlide(screen, 3);
    assertState(3, '#050D49', 'light');
    settleOnSlide(screen, 2);
    assertState(2, '#FFFFFF', 'dark');
    settleOnSlide(screen, 0);
    assertState(0, '#FFFFFF', 'dark');
  });

  it('memberikan hasil state yang sama antara tombol selanjutnya dan swipe', async () => {
    const buttonScreen = render(<WelcomeRoute />);
    await finishSplash();
    fireEvent.press(activeSlide(buttonScreen, 0).getByText('Selanjutnya'));
    settleOnSlide(buttonScreen, 1);
    expect(activeSlide(buttonScreen, 1).getByLabelText('Halaman onboarding 2').props.accessibilityState.selected).toBe(true);
    buttonScreen.unmount();

    jest.useFakeTimers();
    const swipeScreen = render(<WelcomeRoute />);
    await finishSplash();
    settleOnSlide(swipeScreen, 1);
    expect(activeSlide(swipeScreen, 1).getByLabelText('Halaman onboarding 2').props.accessibilityState.selected).toBe(true);
  });

  it('mengarahkan Lewati dan CTA terakhir ke login', async () => {
    const screen = render(<WelcomeRoute />);
    await finishSplash();

    fireEvent.press(activeSlide(screen, 0).getByLabelText('Lewati onboarding'));
    expect(mockedRouter.replace).toHaveBeenCalledWith('/(public)/login');

    settleOnSlide(screen, 3);
    fireEvent.press(activeSlide(screen, 3).getByText('Mulai Sekarang'));
    expect(mockedRouter.replace).toHaveBeenLastCalledWith('/(public)/login');
  });
});
