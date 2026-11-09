import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
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
                <ActivityIndicator size="small" color="#087BFF" />
              </View>
              <Text style={[styles.title, styles.loadingTitle]}>Mohon tunggu</Text>
              <Text style={styles.message}>{overlay.message}</Text>
            </>
          ) : (
            <>
              <View style={[styles.icon, {backgroundColor: success ? '#35C763' : '#EF3340'}]}>
                <Ionicons name={success ? 'checkmark' : 'close'} size={34} color="white" />
              </View>
              <Text style={[styles.title, {color}]}>{overlay.title}</Text>
              <Text style={styles.message}>{overlay.message}</Text>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.button}>
                <LinearGradient colors={success ? ['#0051FD', '#00DAFD'] : ['#E5313D', '#B31222']} end={{x: 1, y: 0}} start={{x: 0, y: 0}} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>OK</Text>
                </LinearGradient>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.78)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28},
  card: {width: '100%', maxWidth: 320, backgroundColor: 'white', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 22, alignItems: 'center'},
  icon: {width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center'},
  loadingIcon: {backgroundColor: '#EEF5FF'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, lineHeight: 27, marginTop: 14, textAlign: 'center'},
  loadingTitle: {color: '#087BFF'},
  message: {fontFamily: 'PlusJakartaSans_400Regular', color: '#475467', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7},
  button: {height: 42, minWidth: 140, borderRadius: 10, overflow: 'hidden', marginTop: 18},
  buttonGradient: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  buttonText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 14},
});
