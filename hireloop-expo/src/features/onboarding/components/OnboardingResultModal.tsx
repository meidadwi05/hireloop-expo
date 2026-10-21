import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import type {OnboardingResult} from '../onboarding.types';

export function OnboardingResultModal({result, onClose}: {result: OnboardingResult | null; onClose: () => void}) {
  const success = result?.status === 'success';
  return (
    <Modal visible={Boolean(result)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card} accessibilityRole="alert">
          <View style={[styles.icon, {backgroundColor: success ? '#35C763' : '#EF3340'}]}>
            <Ionicons name={success ? 'checkmark' : 'close'} size={52} color="white" />
          </View>
          <Text style={[styles.title, {color: success ? '#087BFF' : '#D91E2B'}]}>{result?.title}</Text>
          <Text style={styles.message}>{result?.message}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={[styles.button, {backgroundColor: success ? '#087BFF' : '#D91E2B'}]}>
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.82)', alignItems: 'center', justifyContent: 'center', padding: 28},
  card: {width: '100%', maxWidth: 390, backgroundColor: 'white', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 32, alignItems: 'center'},
  icon: {width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 32, marginTop: 18, textAlign: 'center'},
  message: {fontFamily: 'PlusJakartaSans_400Regular', color: '#222', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10},
  button: {height: 48, minWidth: 170, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24},
  buttonText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 14},
});
