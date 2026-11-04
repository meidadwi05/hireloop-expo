import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import CandidateTabsLayout from '../(candidate)/(tabs)/_layout';

const mockRouterPush = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({data: 0}),
}));

jest.mock('../../features/notifications/api/notifications.api', () => ({
  notificationsApi: {unreadCount: jest.fn()},
}));

jest.mock('../../features/notifications/notifications.keys', () => ({
  notificationsKeys: {unreadCount: () => ['notifications', 'unread-count']},
}));

jest.mock('@expo/vector-icons/Ionicons', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {Text} = jest.requireActual<typeof import('react-native')>('react-native');
  return ({name}: {name: string}) => ReactModule.createElement(Text, {testID: `tab-icon-${name}`}, name);
});

jest.mock('expo-router', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {Pressable, Text, View} = jest.requireActual<typeof import('react-native')>('react-native');
  const Tabs = ({children}: {children: React.ReactNode}) => ReactModule.createElement(View, null, children);
  Tabs.Screen = ({listeners, name, options = {}}: {
    listeners?: {tabPress?: (event: {preventDefault: () => void}) => void};
    name: string;
    options?: Record<string, unknown>;
  }) => {
    const icon = typeof options.tabBarIcon === 'function'
      ? (options.tabBarIcon as (mockIconProps: {color: string; focused: boolean; size: number}) => React.ReactNode)({color: '#000', focused: false, size: 24})
      : null;
    const activeIcon = typeof options.tabBarIcon === 'function'
      ? (options.tabBarIcon as (mockIconProps: {color: string; focused: boolean; size: number}) => React.ReactNode)({color: '#000', focused: true, size: 24})
      : null;
    const trigger = listeners?.tabPress
      ? ReactModule.createElement(
        Pressable,
        {onPress: () => listeners.tabPress?.({preventDefault: jest.fn()}), testID: `press-tab-${name}`},
        ReactModule.createElement(Text, null, `Buka ${name}`),
      )
      : null;

    return ReactModule.createElement(
      View,
      {testID: `tab-${name}`},
      ReactModule.createElement(Text, null, String(options.title ?? '')),
      icon,
      activeIcon,
      trigger,
    );
  };
  return {router: {push: (...mockArgs: unknown[]) => mockRouterPush(...mockArgs)}, Tabs};
});

describe('candidate tabs', () => {
  beforeEach(() => mockRouterPush.mockClear());

  it('mengubah hanya item career pada menu bar menjadi Disimpan dengan ikon bookmark', () => {
    const screen = render(<CandidateTabsLayout />);

    expect(screen.getByTestId('tab-career')).toBeTruthy();
    expect(screen.getByText('Disimpan')).toBeTruthy();
    expect(screen.getByTestId('tab-icon-bookmark-outline')).toBeTruthy();
    expect(screen.getByTestId('tab-icon-bookmark')).toBeTruthy();
    expect(screen.queryByText('Lamaran')).toBeNull();
    expect(screen.queryByTestId('tab-saved')).toBeNull();
  });

  it('mengarahkan tekanan item ketiga ke route lowongan tersimpan existing', () => {
    const screen = render(<CandidateTabsLayout />);

    fireEvent.press(screen.getByTestId('press-tab-career'));

    expect(mockRouterPush).toHaveBeenCalledWith('/(candidate)/jobs/saved');
  });
});
