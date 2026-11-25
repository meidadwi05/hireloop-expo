import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useSyncExternalStore} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {enableInterviewPush, getInterviewPushStatus, subscribeToInterviewPushStatus} from '../push-notifications';

export function InterviewPushPermissionButton() {
  const status = useSyncExternalStore(subscribeToInterviewPushStatus, getInterviewPushStatus, getInterviewPushStatus);
  if (status === 'unsupported') return null;
  if (status === 'checking' || status === 'registering' || status === 'registered') {
    return (
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {status === 'registered' ? 'Notifikasi interview aktif' : 'Memeriksa notifikasi interview…'}
      </Text>
    );
  }
  const message = {
    'permission-required': null,
    'permission-error': 'Izin notifikasi belum dapat diperiksa.',
    'token-error': 'Perangkat belum mendapat token notifikasi.',
    'server-error': 'Perangkat belum terdaftar untuk menerima notifikasi.',
  }[status];
  return (
    <View>
      {message && <Text accessibilityLiveRegion="polite" style={styles.status}>{message}</Text>}
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => void enableInterviewPush()}>
        <Ionicons name="notifications-outline" size={17} color="#0051FD" />
        <Text style={styles.label}>{message ? 'Coba lagi' : 'Aktifkan notifikasi interview'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 44, paddingHorizontal: 12},
  label: {color: '#0051FD', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12},
  status: {color: '#475569', fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, paddingVertical: 8, textAlign: 'center'},
});
