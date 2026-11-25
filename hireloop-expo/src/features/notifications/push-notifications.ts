import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {Alert, AppState, Linking, Platform} from 'react-native';

import {toAppApiError} from '../../core/api/api-error';
import {notificationsApi} from './api/notifications.api';
import type {CandidateNotification, CandidateNotificationMeta, InterviewPushStatus, NotificationLevel} from './notifications.types';

export type PushNotificationCleanup = () => void;

const TOKEN_STORAGE_KEY = 'hireloop.native-push-token';
const PERMISSION_OFFER_KEY = 'hireloop.native-push-permission-offered';
const INTERVIEW_CHANNEL = 'recruitment-interview';
let syncForSession: (() => Promise<void>) | undefined;
let registration: Promise<void> | undefined;
let offeringPermission = false;
let pushStatus: InterviewPushStatus = 'unsupported';
const statusListeners = new Set<() => void>();

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

export function getInterviewPushStatus(): InterviewPushStatus {
  return pushStatus;
}

export function subscribeToInterviewPushStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => {statusListeners.delete(listener);};
}

function setPushStatus(status: InterviewPushStatus): void {
  if (pushStatus === status) return;
  pushStatus = status;
  statusListeners.forEach(listener => listener());
}

export async function enableInterviewPush(): Promise<void> {
  if (!supportsPush() || !syncForSession) return;
  const session = syncForSession;
  try {
    await prepareChannel();
    const current = await Notifications.getPermissionsAsync();
    if (syncForSession !== session) return;
    if (!current.granted && !current.canAskAgain) {
      await Linking.openSettings();
      return;
    }
    const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
    if (syncForSession !== session) return;
    if (!permission.granted) {
      setPushStatus('permission-required');
      return;
    }
    await registration;
    if (getInterviewPushStatus() !== 'registered') await session();
  } catch {
    if (syncForSession === session) setPushStatus('permission-error');
  }
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

async function retryOnce<T>(
  operation: () => Promise<T>,
  isTransient: (error: unknown) => boolean,
  isActive: () => boolean,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isActive() || !isTransient(error)) throw error;
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    if (!isActive()) throw error;
    return operation();
  }
}

async function syncToken(isActive: () => boolean): Promise<void> {
  let failure: InterviewPushStatus = 'permission-error';
  try {
    await prepareChannel();
    const permission = await Notifications.getPermissionsAsync();
    if (!isActive()) return;
    if (!permission.granted) {
      setPushStatus('permission-required');
      return;
    }

    setPushStatus('registering');
    failure = 'token-error';
    const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
    if (typeof projectId !== 'string' || !projectId) {
      setPushStatus(failure);
      return;
    }
    const {data: token} = await retryOnce(
      () => Notifications.getExpoPushTokenAsync({projectId}),
      error => (error as {code?: string} | null)?.code === 'ERR_NOTIFICATIONS_NETWORK_ERROR',
      isActive,
    );
    const previousToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (!isActive()) return;

    failure = 'server-error';
    await retryOnce(
      () => notificationsApi.registerDeviceToken(token, previousToken ?? undefined),
      error => {
        const {status} = toAppApiError(error);
        return status === null || status === 429 || status >= 500;
      },
      isActive,
    );
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (isActive()) setPushStatus('registered');
  } catch {
    if (isActive()) setPushStatus(failure);
  }
}

export async function registerPushNotifications(): Promise<PushNotificationCleanup> {
  if (!supportsPush()) return () => undefined;
  const sync = async () => {
    if (syncForSession !== sync) return;
    if (registration) return registration;
    registration = syncToken(() => syncForSession === sync)
      .finally(() => {registration = undefined;});
    return registration;
  };
  syncForSession = sync;
  setPushStatus('checking');
  const appState = AppState.addEventListener('change', state => {
    if (state === 'active') void sync();
  });
  const tokenListener = Notifications.addPushTokenListener(sync);
  void Promise.resolve(registration).then(sync);
  return () => {
    if (syncForSession === sync) clearLocalPushToken();
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
    if (permission.granted || !permission.canAskAgain
        || await AsyncStorage.getItem(PERMISSION_OFFER_KEY)) return;
    if (!session || syncForSession !== session) return;
    await AsyncStorage.setItem(PERMISSION_OFFER_KEY, '1');
    Alert.alert(
      'Aktifkan notifikasi interview?',
      'HireLoop dapat memberi tahu Anda ketika undangan interview masuk atau jadwalnya berubah.',
      [
        {text: 'Nanti', style: 'cancel'},
        {text: 'Aktifkan', onPress: () => {
          if (syncForSession === session) void enableInterviewPush();
        }},
      ],
    );
  } finally {
    offeringPermission = false;
  }
}

export async function revokePushNotifications(): Promise<void> {
  clearLocalPushToken();
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
  setPushStatus('unsupported');
}
