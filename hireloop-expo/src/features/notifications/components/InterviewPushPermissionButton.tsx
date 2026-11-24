import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useEffect, useState} from 'react';
import {AppState, Pressable, StyleSheet, Text} from 'react-native';

import {enableInterviewPush, needsInterviewPushPermission} from '../push-notifications';

export function InterviewPushPermissionButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => void needsInterviewPushPermission()
      .then(needed => {if (active) setShow(needed);})
      .catch(() => undefined);
    refresh();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  if (!show) return null;
  return (
    <Pressable
      accessibilityRole="button"
      style={styles.button}
      onPress={() => void enableInterviewPush()
        .then(needsInterviewPushPermission)
        .then(setShow)
        .catch(() => undefined)}
    >
      <Ionicons name="notifications-outline" size={17} color="#0051FD" />
      <Text style={styles.label}>Aktifkan notifikasi interview</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 44, paddingHorizontal: 12},
  label: {color: '#0051FD', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12},
});
