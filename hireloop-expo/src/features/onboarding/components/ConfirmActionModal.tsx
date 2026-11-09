import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';

export function ConfirmActionModal({visible, title, message, destructive = false, onCancel, onConfirm}: {
  visible: boolean;
  title: string;
  message: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View accessibilityRole="alert" style={styles.card}>
          <View style={[styles.icon, destructive && styles.iconDanger]}>
            <Ionicons name={destructive ? 'trash-outline' : 'help-outline'} size={42} color={destructive ? '#EF3340' : '#087BFF'} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancel}><Text style={styles.cancelText}>Batal</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.confirm}>
              <LinearGradient colors={destructive ? ['#E5313D', '#B31222'] : ['#0051FD', '#00DAFD']} end={{x: 1, y: 0}} start={{x: 0, y: 0}} style={styles.gradient}>
                <Text style={styles.confirmText}>{destructive ? 'Hapus' : 'Lanjutkan'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(1,5,20,0.82)', alignItems: 'center', justifyContent: 'center', padding: 18},
  card: {width: '100%', maxWidth: 390, borderRadius: 24, backgroundColor: 'white', padding: 24, alignItems: 'center'},
  icon: {width: 88, height: 88, borderRadius: 44, backgroundColor: '#EEF5FF', alignItems: 'center', justifyContent: 'center'},
  iconDanger: {backgroundColor: '#FFF0F1'},
  title: {fontFamily: 'PlusJakartaSans_700Bold', color: '#111827', fontSize: 23, lineHeight: 31, textAlign: 'center', marginTop: 16},
  message: {fontFamily: 'PlusJakartaSans_400Regular', color: '#586174', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8},
  actions: {width: '100%', flexDirection: 'row', gap: 12, marginTop: 24},
  cancel: {flex: 1, height: 50, borderRadius: 11, borderWidth: 1, borderColor: '#B7C0CE', alignItems: 'center', justifyContent: 'center'},
  cancelText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: '#344054', fontSize: 14},
  confirm: {flex: 1, height: 50, borderRadius: 11, overflow: 'hidden'},
  gradient: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  confirmText: {fontFamily: 'PlusJakartaSans_600SemiBold', color: 'white', fontSize: 14},
});
