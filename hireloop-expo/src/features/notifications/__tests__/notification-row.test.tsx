import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {useNotifications} from '../hooks/use-notifications';
import {NotificationRow, NotificationsScreen} from '../screens/NotificationsScreen';
import type {CandidateNotification} from '../notifications.types';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-router', () => ({router: {push: jest.fn()}}));
jest.mock('../hooks/use-notifications', () => ({useNotifications: jest.fn()}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 24, right: 0, bottom: 12, left: 0}),
}));

const mockGoBackOrReplace = jest.fn();
jest.mock('../../../core/navigation/go-back-or-replace', () => ({
  goBackOrReplace: (...args: unknown[]) => mockGoBackOrReplace(...args),
}));

const mockedUseNotifications = useNotifications as jest.Mock;

const notification: CandidateNotification = {
  id: '9',
  type: 'blacklist',
  level: 'warning',
  title: 'Anda Menerima Peringatan dengan judul yang cukup panjang',
  body: 'Anda menerima peringatan terkait pelanggaran pada proyek. Silakan lihat detail dan bukti pelanggaran yang tersedia.',
  isRead: false,
  createdAt: new Date().toISOString(),
  meta: {tier: 'tier_1', action_url: '/dashboard'},
};

describe('NotificationRow', () => {
  it('lets title and body grow vertically without clipping or overlapping', () => {
    const onPress = jest.fn();
    const screen = render(<NotificationRow item={notification} onPress={onPress} />);
    const rowStyle = StyleSheet.flatten(screen.getByTestId('notification-9').props.style);
    const title = screen.getByText(notification.title);
    const body = screen.getByText(notification.body);

    expect(rowStyle.alignItems).toBe('flex-start');
    expect(rowStyle.minHeight).toBe(148);
    expect(title.props.numberOfLines).toBeUndefined();
    expect(body.props.numberOfLines).toBeUndefined();
    expect(StyleSheet.flatten(title.props.style).lineHeight).toBe(21);
    expect(StyleSheet.flatten(body.props.style).lineHeight).toBe(18);
    expect(screen.getByText('Peringatan')).toBeTruthy();
    expect(screen.getByText('Lihat Detail')).toBeTruthy();

    fireEvent.press(screen.getByTestId('notification-9'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a white responsive header without the branded artwork overlay', () => {
    const markAllRead = jest.fn();
    mockedUseNotifications.mockReturnValue({
      items: [],
      unreadCount: 2,
      mutationError: null,
      markingAllRead: false,
      markAllRead,
      markRead: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refresh: jest.fn(),
    });

    const screen = render(<NotificationsScreen />);
    const screenStyle = StyleSheet.flatten(screen.getByTestId('notifications-screen').props.style);
    const headerStyle = StyleSheet.flatten(screen.getByTestId('notifications-header').props.style);
    const filterRowStyle = StyleSheet.flatten(screen.getByTestId('notifications-filter-row').props.style);
    const allFilterStyle = StyleSheet.flatten(screen.getByTestId('notification-filter-all').props.style);
    const unreadFilterStyle = StyleSheet.flatten(screen.getByTestId('notification-filter-unread').props.style);

    expect(screenStyle.width).toBe('100%');
    expect(screenStyle.maxWidth).toBe(440);
    expect(headerStyle.backgroundColor).toBe('white');
    expect(headerStyle.height).toBeUndefined();
    expect(filterRowStyle.flexWrap).toBe('wrap');
    expect(allFilterStyle.flex).toBeUndefined();
    expect(allFilterStyle.minWidth).toBe(92);
    expect(unreadFilterStyle.minWidth).toBe(134);
    expect(screen.queryByTestId('notifications-header-artwork')).toBeNull();
    expect(screen.getByText('Notifikasi')).toBeTruthy();
    expect(screen.getByText('Belum Dibaca (2)')).toBeTruthy();
    expect(screen.queryByText('Semua pemberitahuan sudah dibaca')).toBeNull();

    fireEvent.press(screen.getByLabelText('Kembali ke Beranda'));
    expect(mockGoBackOrReplace).toHaveBeenCalledWith('/(candidate)/(tabs)/home');
    fireEvent.press(screen.getByText('Tandai dibaca'));
    expect(markAllRead).toHaveBeenCalledTimes(1);
  });
});
