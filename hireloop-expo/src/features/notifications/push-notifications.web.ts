import {router} from 'expo-router';

import {notificationsApi} from './api/notifications.api';
import {resolveNotificationDestination} from './notifications.navigation';
import type {CandidateNotification, CandidateNotificationMeta, NotificationLevel} from './notifications.types';

const FIREBASE_VERSION = '11.10.0';
const TOKEN_STORAGE_KEY = 'hireloop.web-push-token';
type PushNotificationCleanup = () => void;

type FirebaseAppModule = {
  getApp: () => unknown;
  getApps: () => unknown[];
  initializeApp: (config: FirebaseConfig) => unknown;
};

type FirebaseMessagePayload = {
  data?: Record<string, string>;
  messageId?: string;
  notification?: {body?: string; title?: string};
};

type FirebaseMessagingModule = {
  getMessaging: (app?: unknown) => unknown;
  getToken: (messaging: unknown, options: {serviceWorkerRegistration: ServiceWorkerRegistration; vapidKey: string}) => Promise<string>;
  isSupported: () => Promise<boolean>;
  onMessage: (messaging: unknown, listener: (payload: FirebaseMessagePayload) => void) => () => void;
};

type FirebaseConfig = {
  apiKey: string;
  appId: string;
  authDomain: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket?: string;
};

type PushConfiguration = {
  firebase: FirebaseConfig;
  vapidKey: string;
};

function readConfiguration(): PushConfiguration | null {
  const firebase: FirebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
  };
  const vapidKey = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY?.trim() ?? '';

  if (!firebase.apiKey || !firebase.appId || !firebase.authDomain || !firebase.messagingSenderId || !firebase.projectId || !vapidKey) {
    return null;
  }

  return {firebase, vapidKey};
}

async function importFromCdn<T>(path: string): Promise<T> {
  const importModule = new Function('url', 'return import(url)') as (url: string) => Promise<T>;
  return importModule(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/${path}`);
}

function asLevel(value: unknown): NotificationLevel {
  return value === 'success' || value === 'warning' || value === 'error' ? value : 'info';
}

function toCandidateNotification(payload: FirebaseMessagePayload): CandidateNotification {
  const data = payload.data ?? {};
  const meta: CandidateNotificationMeta = {...data};
  return {
    id: payload.messageId ?? `push-${Date.now()}`,
    type: data.type || 'system',
    level: asLevel(data.level),
    title: payload.notification?.title || data.title || 'HireLoop',
    body: payload.notification?.body || data.body || 'Ada pembaruan untuk akun Anda.',
    isRead: false,
    createdAt: new Date().toISOString(),
    meta,
  };
}

function showForegroundNotification(payload: FirebaseMessagePayload): void {
  const item = toCandidateNotification(payload);
  const notification = new Notification(item.title, {body: item.body, data: item.meta, icon: '/icon-192.png'});
  notification.onclick = () => {
    window.focus();
    const destination = resolveNotificationDestination(item);
    if (destination) router.push(destination as never);
    notification.close();
  };
}

export async function registerPushNotifications(): Promise<PushNotificationCleanup> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return () => undefined;

  const configuration = readConfiguration();
  if (!configuration) return () => undefined;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return () => undefined;

  const permission = Notification.permission === 'default'
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== 'granted') return () => undefined;

  const [appModule, messagingModule] = await Promise.all([
    importFromCdn<FirebaseAppModule>('firebase-app.js'),
    importFromCdn<FirebaseMessagingModule>('firebase-messaging.js'),
  ]);
  if (!await messagingModule.isSupported()) return () => undefined;

  const app = appModule.getApps().length > 0
    ? appModule.getApp()
    : appModule.initializeApp(configuration.firebase);
  const messaging = messagingModule.getMessaging(app);
  const token = await messagingModule.getToken(messaging, {
    serviceWorkerRegistration: registration,
    vapidKey: configuration.vapidKey,
  });
  if (!token) return () => undefined;

  await notificationsApi.registerDeviceToken(token);
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);

  return messagingModule.onMessage(messaging, payload => {
    if (Notification.permission === 'granted') showForegroundNotification(payload);
  });
}

export async function revokePushNotifications(): Promise<void> {
  if (typeof window === 'undefined') return;
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return;
  await notificationsApi.revokeDeviceToken(token);
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function clearLocalPushToken(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}
