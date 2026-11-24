import Ionicons from '@expo/vector-icons/Ionicons';
import {useQueryClient} from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import {router, useRootNavigationState} from 'expo-router';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {applicationsKeys} from '../../applications/applications.keys';
import {notificationsApi} from '../api/notifications.api';
import {notificationsKeys} from '../notifications.keys';
import {resolveNotificationDestination} from '../notifications.navigation';
import type {CandidateNotification} from '../notifications.types';
import {notificationFromPush} from '../push-notifications';

export function InterviewPushBanner({userId}: {userId: string}) {
  const insets = useSafeAreaInsets();
  const navigationReady = Boolean(useRootNavigationState()?.key);
  const queryClient = useQueryClient();
  const [banner, setBanner] = useState<CandidateNotification | null>(null);
  const received = useRef(new Set<string>());
  const opened = useRef(new Set<string>());

  const refreshInbox = useCallback(
    () => queryClient.invalidateQueries({queryKey: notificationsKeys.all}),
    [queryClient],
  );

  const open = useCallback((item: CandidateNotification) => {
    const nativeInterview = item.meta.native_category === 'recruitment-interview';
    if (nativeInterview && String(item.meta.recipient_id) !== userId) return;
    if (item.meta.recipient_id != null && String(item.meta.recipient_id) !== userId) return;
    if (opened.current.has(item.id)) return;
    opened.current.add(item.id);
    setBanner(current => current?.id === item.id ? null : current);
    const historyId = item.meta.notification_id;
    if (typeof historyId === 'string' && /^\d+$/.test(historyId)) {
      void notificationsApi.markRead(historyId).catch(() => undefined).then(refreshInbox);
    }
    const destination = resolveNotificationDestination(nativeInterview && item.meta.action_url === '/lamaran-saya'
      ? {...item, meta: {...item.meta, action_url: undefined}}
      : item);
    if (destination?.pathname === '/(candidate)/applications/[source]/[id]'
        && nativeInterview) {
      void queryClient.invalidateQueries({queryKey: applicationsKeys.all});
      const applicationId = String(item.meta.application_id ?? '');
      const stage = typeof item.meta.stage_name === 'string' ? item.meta.stage_name : 'Interview';
      router.push({
        ...destination,
        params: {
          ...destination.params,
          ...(/^\d+$/.test(applicationId) && {applicationId}),
          interviewStage: stage,
        },
      } as never);
      return;
    }
    router.push(destination && !nativeInterview ? destination as never : '/(candidate)/(tabs)/notifications');
  }, [queryClient, refreshInbox, userId]);

  useEffect(() => {
    if (!navigationReady) return;
    const onResponse = (response: Notifications.NotificationResponse) => {
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      Notifications.clearLastNotificationResponse();
      open(notificationFromPush(response.notification));
    };
    const responses = Notifications.addNotificationResponseReceivedListener(onResponse);
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') void refreshInbox();
      else if (state === 'background') setBanner(null);
    });
    const incoming = Notifications.addNotificationReceivedListener(notification => {
      const item = notificationFromPush(notification);
      if (item.meta.native_category !== 'recruitment-interview' || String(item.meta.recipient_id) !== userId
          || received.current.has(item.id) || opened.current.has(item.id)) return;
      received.current.add(item.id);
      void refreshInbox();
      setBanner(item);
    });
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) onResponse(lastResponse);
    return () => {
      responses.remove();
      incoming.remove();
      appState.remove();
    };
  }, [navigationReady, open, refreshInbox, userId]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 8000);
    return () => clearTimeout(timer);
  }, [banner]);

  if (!banner) return null;
  return (
    <View pointerEvents="box-none" style={[styles.overlay, {top: insets.top + 8}]}>
      <View style={styles.banner} accessibilityLiveRegion="polite">
        <Ionicons name="calendar-outline" size={23} color="#0051FD" />
        <Pressable style={styles.content} accessibilityRole="button" onPress={() => open(banner)}>
          <Text style={styles.title}>{banner.title}</Text>
          <Text style={styles.action}>Lihat Detail</Text>
        </Pressable>
        <Pressable accessibilityLabel="Tutup pemberitahuan" accessibilityRole="button" hitSlop={4} onPress={() => setBanner(null)} style={styles.close}>
          <Ionicons name="close" size={20} color="#475569" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {alignItems: 'center', left: 0, paddingHorizontal: 12, position: 'absolute', right: 0, zIndex: 20},
  banner: {alignItems: 'center', backgroundColor: '#FFF', borderColor: '#DBEAFE', borderRadius: 16, borderWidth: 1, elevation: 6, flexDirection: 'row', gap: 12, maxWidth: 480, padding: 12, shadowColor: '#122958', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 8, width: '100%'},
  content: {flex: 1, minHeight: 44, justifyContent: 'center'},
  title: {color: '#0F234D', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14},
  action: {color: '#0051FD', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, marginTop: 3},
  close: {alignItems: 'center', height: 40, justifyContent: 'center', width: 40},
});
