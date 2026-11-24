import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {Alert, AppState, Linking, Platform} from 'react-native';

import {notificationsApi} from './api/notifications.api';
import type {CandidateNotification, CandidateNotificationMeta, NotificationLevel} from './notifications.types';

export type PushNotificationCleanup = () => void;

const TOKEN_STORAGE_KEY = 'hireloop.native-push-token';
const PERMISSION_OFFER_KEY = 'hireloop.native-push-permission-offered';
const INTERVIEW_CHANNEL = 'recruitment-interview';
let syncForSession: (() => void) | undefined;
let registration: Promise<void> | undefined;
let offeringPermission = false;

Notifications.setNotificationHandler({
  handleNotification: async notification => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: notification.request.content.data?.native_category !== INTERVIEW_CHANNEL,
    shouldShowList: true,
  }),
});

function asLevel(value: unknown): NotificationLevel {
  return value === 'success' || value === 'warning' || value === 'error' ? value : 'info';
}

export function notificationFromPush(notification: Notifications.Notification): CandidateNotification {
  const request = notification.request;
  const data = (request.content.data ?? {}) as CandidateNotificationMeta;
  return {
    id: typeof data.notification_id === 'string' ? data.notification_id : request.identifier,
    type: typeof data.type === 'string' ? data.type : 'system',
    level: asLevel(data.level),
    title: request.content.title || (typeof data.title === 'string' ? data.title : 'HireLoop'),
    body: request.content.body || (typeof data.body === 'string' ? data.body : 'Ada pembaruan untuk akun Anda.'),
    isRead: false,
    createdAt: new Date().toISOString(),
    meta: data,
  };
}

function supportsPush(): boolean {
  return Device.isDevice && Constants.appOwnership !== 'expo' && Platform.OS !== 'web';
}

export async function needsInterviewPushPermission(): Promise<boolean> {
  return supportsPush() && !(await Notifications.getPermissionsAsync()).granted;
}

export async function enableInterviewPush(): Promise<void> {
  if (!supportsPush() || !syncForSession) return;
  const session = syncForSession;
  await prepareChannel();
  const current = await Notifications.getPermissionsAsync();
  if (syncForSession !== session) return;
  if (!current.granted && !current.canAskAgain) {
    await Linking.openSettings();
    return;
  }
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (permission.granted) await Promise.resolve(registration).then(session);
}

async function prepareChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(INTERVIEW_CHANNEL, {
      importance: Notifications.AndroidImportance.HIGH,
      name: 'Jadwal Interview',
      sound: 'default',
    });
  }
}

async function syncToken(isActive: () => boolean): Promise<void> {
  await prepareChannel();
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted' || !isActive()) return;
  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof projectId !== 'string' || !projectId) return;
  const {data: token} = await Notifications.getExpoPushTokenAsync({projectId});
  const previousToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (!isActive()) return;
  await notificationsApi.registerDeviceToken(token, previousToken ?? undefined);
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export async function registerPushNotifications(): Promise<PushNotificationCleanup> {
  if (!supportsPush()) return () => undefined;
  const sync = () => {
    if (syncForSession !== sync || registration) return;
    registration = syncToken(() => syncForSession === sync)
      .catch(() => undefined)
      .finally(() => {registration = undefined;});
  };
  syncForSession = sync;
  const appState = AppState.addEventListener('change', state => {
    if (state === 'active') sync();
  });
  const tokenListener = Notifications.addPushTokenListener(sync);
  void Promise.resolve(registration).then(sync);
  return () => {
    if (syncForSession === sync) syncForSession = undefined;
    appState.remove();
    tokenListener.remove();
  };
}

export async function offerInterviewPushPermission(): Promise<void> {
  if (!supportsPush() || offeringPermission) return;
  offeringPermission = true;
  const session = syncForSession;
  try {
    await prepareChannel();
    const permission = await Notifications.getPermissionsAsync();
    if (permission.status === 'granted' || !permission.canAskAgain
        || await AsyncStorage.getItem(PERMISSION_OFFER_KEY)) return;
    if (!session || syncForSession !== session) return;
    await AsyncStorage.setItem(PERMISSION_OFFER_KEY, '1');
    Alert.alert(
      'Aktifkan notifikasi interview?',
      'HireLoop dapat memberi tahu Anda ketika undangan interview masuk atau jadwalnya berubah.',
      [
        {text: 'Nanti', style: 'cancel'},
        {text: 'Aktifkan', onPress: () => {
          if (syncForSession === session) void enableInterviewPush().catch(() => undefined);
        }},
      ],
    );
  } finally {
    offeringPermission = false;
  }
}

export async function revokePushNotifications(): Promise<void> {
  syncForSession = undefined;
  await registration;
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (supportsPush()) {
    Notifications.clearLastNotificationResponse();
    void Notifications.dismissAllNotificationsAsync().catch(() => undefined);
  }
  if (!token) return;
  await notificationsApi.revokeDeviceToken(token);
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function clearLocalPushToken(): void {
  syncForSession = undefined;
}
