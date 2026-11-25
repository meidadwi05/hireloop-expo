import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {waitFor} from '@testing-library/react-native';

import {notificationsApi} from '../api/notifications.api';
import {enableInterviewPush, getInterviewPushStatus, registerPushNotifications} from '../push-notifications';

jest.mock('expo-device', () => ({isDevice: true}));
jest.mock('expo-constants', () => ({appOwnership: null, easConfig: {projectId: 'project'}}));
jest.mock('expo-notifications', () => ({
  AndroidImportance: {HIGH: 'high'},
  addPushTokenListener: jest.fn(() => ({remove: jest.fn()})),
  getExpoPushTokenAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));
jest.mock('../api/notifications.api', () => ({
  notificationsApi: {registerDeviceToken: jest.fn()},
}));

let dispose: (() => void) | undefined;

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({
    granted: true,
    canAskAgain: true,
    expires: 'never',
    status: 'granted',
  } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);
  jest.mocked(Notifications.getExpoPushTokenAsync).mockResolvedValue({type: 'expo', data: 'ExpoPushToken[review]' });
});

afterEach(() => dispose?.());

test('reports active only after the backend accepts the device token', async () => {
  let completeRegistration = () => undefined as void;
  jest.mocked(notificationsApi.registerDeviceToken).mockImplementationOnce(
    () => new Promise<void>(resolve => {completeRegistration = resolve;}),
  );
  dispose = await registerPushNotifications();
  await waitFor(() => expect(notificationsApi.registerDeviceToken).toHaveBeenCalledWith('ExpoPushToken[review]', undefined));
  expect(getInterviewPushStatus()).toBe('registering');
  completeRegistration();
  await waitFor(() => expect(getInterviewPushStatus()).toBe('registered'));
});

test('keeps registration retryable when the backend rejects an already permitted device', async () => {
  jest.mocked(notificationsApi.registerDeviceToken)
    .mockRejectedValueOnce({isAxiosError: true, response: {status: 422}})
    .mockResolvedValueOnce(undefined);
  dispose = await registerPushNotifications();
  await waitFor(() => expect(getInterviewPushStatus()).toBe('server-error'));
  await enableInterviewPush();
  expect(getInterviewPushStatus()).toBe('registered');
  expect(notificationsApi.registerDeviceToken).toHaveBeenCalledTimes(2);
});
