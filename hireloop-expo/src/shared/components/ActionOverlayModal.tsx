import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {ActivityIndicator, Modal, Pressable, StyleSheet, Text, View} from 'react-native';

export type ActionOverlay =
  | {kind: 'loading'; message: string}
  | {kind: 'success'; title: string; message: string}
  | {kind: 'error'; title: string; message: string};

export function ActionOverlayModal({overlay, onClose}: {
  overlay: ActionOverlay;
  onClose: () => void;
}) {
  const loading = overlay.kind === 'loading';
  const success = overlay.kind === 'success';
  const color = success ? '#087BFF' : '#D91E2B';

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          accessibilityState={{busy: loading}}
          style={styles.card}
        >
          {loading ? (
            <>
              <View style={[styles.icon, styles.loadingIcon]}>
                <ActivityIndicator size="large" color="#087BFF" />
              </View>
              <Text style={[styles.title, styles.loadingTitle]}>Mohon tunggu</Text>
              <Text style={styles.message}>{overlay.message}</Text>
            </>
          ) : (
            <>
              <View style={[styles.icon, {backgroundColor: success ? '#35C763' : '#EF3340'}]}>
                <Ionicons name={success ? 'checkmark' : 'close'} size={52} color="white" />
              </View>
              <Text style={[styles.title, {color}]}>{overlay.title}</Text>
              <Text style={styles.message}>{overlay.message}</Text>
              <Pressable accessibilityRole="button" onPress={onClose} style={[styles.button, {backgroundColor: color}]}>
                <Text style={styles.buttonText}>OK</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.82)', alignItems: 'center', justifyContent: 'center', padding: 16},
  card: {width: '100%', maxWidth: 390, backgroundColor: 'white', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 32, alignItems: 'center'},
  icon: {width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center'},
  loadingIcon: {backgroundColor: '#EEF5FF'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 29, lineHeight: 37, marginTop: 18, textAlign: 'center'},
  loadingTitle: {color: '#087BFF'},
  message: {fontFamily: 'PlusJakartaSans_400Regular', color: '#222', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10},
  button: {height: 48, minWidth: 170, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24},
  buttonText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 14},
});
