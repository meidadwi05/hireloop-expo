import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {NotificationRow} from '../screens/NotificationsScreen';
import type {CandidateNotification} from '../notifications.types';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-router', () => ({router: {push: jest.fn()}}));
jest.mock('../hooks/use-notifications', () => ({useNotifications: jest.fn()}));

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
});
