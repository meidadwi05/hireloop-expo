import {render} from '@testing-library/react-native';
import React from 'react';

import CandidateTabsLayout from '../(candidate)/(tabs)/_layout';

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({data: 0}),
}));

jest.mock('../../features/notifications/api/notifications.api', () => ({
  notificationsApi: {unreadCount: jest.fn()},
}));

jest.mock('../../features/notifications/notifications.keys', () => ({
  notificationsKeys: {unreadCount: () => ['notifications', 'unread-count']},
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 16, left: 0}),
}));

jest.mock('@expo/vector-icons/Ionicons', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {Text} = jest.requireActual<typeof import('react-native')>('react-native');
  return ({name}: {name: string}) => ReactModule.createElement(Text, {testID: `tab-icon-${name}`}, name);
});

jest.mock('expo-router', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {Text, View} = jest.requireActual<typeof import('react-native')>('react-native');
  const Tabs = ({children}: {children: React.ReactNode}) => ReactModule.createElement(View, null, children);
  Tabs.Screen = ({name, options = {}}: {
    name: string;
    options?: Record<string, unknown>;
  }) => {
    const icon = typeof options.tabBarIcon === 'function'
      ? (options.tabBarIcon as (mockIconProps: {color: string; focused: boolean; size: number}) => React.ReactNode)({color: '#000', focused: false, size: 24})
      : null;
    const activeIcon = typeof options.tabBarIcon === 'function'
      ? (options.tabBarIcon as (mockIconProps: {color: string; focused: boolean; size: number}) => React.ReactNode)({color: '#000', focused: true, size: 24})
      : null;
    return ReactModule.createElement(
      View,
      {accessibilityElementsHidden: options.href === null, testID: `tab-${name}`},
      ReactModule.createElement(Text, null, String(options.title ?? '')),
      icon,
      activeIcon,
    );
  };
  return {Tabs};
});

describe('candidate tabs', () => {
  it('menggunakan route tab saved untuk Disimpan dan menyembunyikan route career dari bottom bar', () => {
    const screen = render(<CandidateTabsLayout />);

    expect(screen.getByTestId('tab-saved')).toBeTruthy();
    expect(screen.getByText('Disimpan')).toBeTruthy();
    expect(screen.getByTestId('tab-icon-bookmark-outline')).toBeTruthy();
    expect(screen.getByTestId('tab-icon-bookmark')).toBeTruthy();
    expect(screen.queryByText('Lamaran')).toBeNull();
    expect(screen.UNSAFE_getByProps({testID: 'tab-career'}).props.accessibilityElementsHidden).toBe(true);
  });
});
