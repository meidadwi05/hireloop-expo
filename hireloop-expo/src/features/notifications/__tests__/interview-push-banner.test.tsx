import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import {router} from 'expo-router';
import React from 'react';

import {notificationsApi} from '../api/notifications.api';
import {InterviewPushBanner} from '../components/InterviewPushBanner';

jest.mock('expo-router', () => ({router: {push: jest.fn()}, useRootNavigationState: () => ({key: 'root'})}));
jest.mock('react-native-safe-area-context', () => ({useSafeAreaInsets: () => ({top: 24})}));
jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-notifications', () => ({
  DEFAULT_ACTION_IDENTIFIER: 'default',
  addNotificationReceivedListener: jest.fn(() => ({remove: jest.fn()})),
  addNotificationResponseReceivedListener: jest.fn(() => ({remove: jest.fn()})),
  clearLastNotificationResponse: jest.fn(),
  getLastNotificationResponse: jest.fn(() => null),
  setNotificationHandler: jest.fn(),
}));
jest.mock('../api/notifications.api', () => ({notificationsApi: {markRead: jest.fn().mockResolvedValue(undefined)}}));

const notification = {
  request: {
    identifier: 'push-77',
    content: {
      title: 'Jadwal interview diperbarui',
      body: 'Buka HireLoop',
      data: {
        type: 'application_interview_scheduled',
        recipient_id: '10',
        native_category: 'recruitment-interview',
        notification_id: '77',
        action_url: '/lamaran-saya/project-lowongan/9',
        application_id: 17,
        stage_name: 'Interview HR',
      },
    },
  },
} as unknown as Notifications.Notification;

beforeEach(() => jest.clearAllMocks());

function renderBanner(userId: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <InterviewPushBanner userId={userId} />
    </QueryClientProvider>,
  );
}

test('foreground banner opens the exact application once and marks its inbox entry', async () => {
  const screen = renderBanner('10');
  const receive = jest.mocked(Notifications.addNotificationReceivedListener).mock.calls[0][0];
  act(() => {receive(notification); receive(notification);});
  expect(screen.getAllByText('Jadwal interview diperbarui')).toHaveLength(1);
  fireEvent.press(screen.getByText('Lihat Detail'));
  await waitFor(() => expect(notificationsApi.markRead).toHaveBeenCalledWith('77'));
  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith({
    pathname: '/(candidate)/applications/[source]/[id]',
    params: {source: 'project-lowongan', id: '9', applicationId: '17', interviewStage: 'Interview HR'},
  });
});

test('discards a cold-start push addressed to another account', () => {
  jest.mocked(Notifications.getLastNotificationResponse).mockReturnValueOnce({
    actionIdentifier: Notifications.DEFAULT_ACTION_IDENTIFIER,
    notification,
  });
  renderBanner('20');
  expect(Notifications.clearLastNotificationResponse).toHaveBeenCalled();
  expect(router.push).not.toHaveBeenCalled();
  expect(notificationsApi.markRead).not.toHaveBeenCalled();
});
