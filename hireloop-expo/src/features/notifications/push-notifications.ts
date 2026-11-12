import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {router} from 'expo-router';
import {Platform} from 'react-native';

import {notificationsApi} from './api/notifications.api';
import {resolveNotificationDestination} from './notifications.navigation';
import type {CandidateNotification, CandidateNotificationMeta, NotificationLevel} from './notifications.types';

export type PushNotificationCleanup = () => void;

const TOKEN_STORAGE_KEY = 'hireloop.native-push-token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function asLevel(value: unknown): NotificationLevel {
  return value === 'success' || value === 'warning' || value === 'error' ? value : 'info';
}

function notificationFromResponse(response: Notifications.NotificationResponse): CandidateNotification {
  const request = response.notification.request;
  const data = request.content.data as CandidateNotificationMeta;
  return {
    id: request.identifier,
    type: typeof data.type === 'string' ? data.type : 'system',
    level: asLevel(data.level),
    title: request.content.title || (typeof data.title === 'string' ? data.title : 'HireLoop'),
    body: request.content.body || (typeof data.body === 'string' ? data.body : 'Ada pembaruan untuk akun Anda.'),
    isRead: false,
    createdAt: new Date().toISOString(),
    meta: data,
  };
}

function openNotification(response: Notifications.NotificationResponse): void {
  const destination = resolveNotificationDestination(notificationFromResponse(response));
  if (destination) router.push(destination as never);
}

export async function registerPushNotifications(): Promise<PushNotificationCleanup> {
  if (!Device.isDevice || Constants.appOwnership === 'expo') return () => undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      importance: Notifications.AndroidImportance.HIGH,
      name: 'HireLoop',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  const permission = currentPermission.status === 'granted'
    ? currentPermission
    : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return () => undefined;

  const deviceToken = await Notifications.getDevicePushTokenAsync();
  const token = typeof deviceToken.data === 'string' ? deviceToken.data.trim() : '';
  if (!token) return () => undefined;

  await notificationsApi.registerDeviceToken(token);
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(openNotification);
  const lastResponse = Notifications.getLastNotificationResponse();
  if (lastResponse) openNotification(lastResponse);

  return () => responseSubscription.remove();
}

export async function revokePushNotifications(): Promise<void> {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return;
  await notificationsApi.revokeDeviceToken(token);
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function clearLocalPushToken(): void {
  void AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
}
