import React from 'react';
import {ActivityIndicator, Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import {APPLICATION_COLORS, APPLICATION_FONTS, applicationShadow} from './applications.ui';

export function CancelApplicationModal({
  visible,
  title,
  loading,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={loading ? undefined : onClose}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.card}>
          <Text style={styles.title}>Batalkan lamaran?</Text>
          <Text style={styles.message}>
            Lamaran untuk {title} akan dibatalkan. Tindakan ini hanya dapat dilakukan selama status masih Applied.
          </Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={loading} onPress={onClose} style={styles.secondary}>
              <Text style={styles.secondaryText}>Kembali</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={loading} onPress={onConfirm} style={styles.danger}>
              {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.dangerText}>Ya, Batalkan</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0, 18, 58, 0.62)', alignItems: 'center', justifyContent: 'center', padding: 22},
  card: {...applicationShadow, width: '100%', maxWidth: 430, borderRadius: 20, backgroundColor: 'white', padding: 22},
  title: {fontFamily: APPLICATION_FONTS.bold, fontSize: 20, color: APPLICATION_COLORS.navy},
  message: {fontFamily: APPLICATION_FONTS.regular, fontSize: 12, lineHeight: 20, color: APPLICATION_COLORS.body, marginTop: 10},
  actions: {flexDirection: 'row', gap: 10, marginTop: 22},
  secondary: {flex: 1, height: 47, borderRadius: 11, borderWidth: 1, borderColor: APPLICATION_COLORS.border, alignItems: 'center', justifyContent: 'center'},
  secondaryText: {fontFamily: APPLICATION_FONTS.semibold, fontSize: 11.5, color: APPLICATION_COLORS.body},
  danger: {flex: 1, height: 47, borderRadius: 11, backgroundColor: APPLICATION_COLORS.red, alignItems: 'center', justifyContent: 'center'},
  dangerText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 11.5, color: 'white'},
});
