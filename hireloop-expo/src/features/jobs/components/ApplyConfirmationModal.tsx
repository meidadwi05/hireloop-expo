import React from 'react';
import {ActivityIndicator, Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import type {CandidateJobDetail} from '../jobs.types';
import {JOBS_COLORS, JOBS_FONTS, jobsCardShadow} from './jobs.ui';

type ApplyConfirmationModalProps = {
  job: CandidateJobDetail;
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ApplyConfirmationModal({job, visible, loading, onCancel, onConfirm}: ApplyConfirmationModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={loading ? undefined : onCancel}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.card}>
          <Text style={styles.title}>Kirim lamaran?</Text>
          <Text style={styles.message}>
            Anda akan melamar posisi {job.title} di {job.company}. Pastikan profil dan dokumen kandidat sudah benar.
          </Text>
          <Text style={styles.agreement}>Dengan melanjutkan, Anda menyetujui data profil digunakan untuk proses rekrutmen.</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={loading} onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Batal</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={loading} onPress={onConfirm} style={styles.confirmButton}>
              {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.confirmText}>Ya, kirim lamaran</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0, 15, 55, 0.62)', alignItems: 'center', justifyContent: 'center', padding: 22},
  card: {...jobsCardShadow, width: '100%', maxWidth: 430, borderRadius: 20, backgroundColor: 'white', padding: 22},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 20, color: JOBS_COLORS.ink},
  message: {fontFamily: JOBS_FONTS.regular, fontSize: 12.5, lineHeight: 20, color: JOBS_COLORS.body, marginTop: 10},
  agreement: {fontFamily: JOBS_FONTS.medium, fontSize: 10.5, lineHeight: 17, color: '#657188', backgroundColor: '#F2F6FC', borderRadius: 11, padding: 12, marginTop: 15},
  actions: {flexDirection: 'row', gap: 10, marginTop: 20},
  cancelButton: {flex: 1, height: 47, borderRadius: 11, borderWidth: 1, borderColor: JOBS_COLORS.border, alignItems: 'center', justifyContent: 'center'},
  cancelText: {fontFamily: JOBS_FONTS.semibold, fontSize: 11.5, color: JOBS_COLORS.body},
  confirmButton: {flex: 1.5, height: 47, borderRadius: 11, backgroundColor: JOBS_COLORS.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8},
  confirmText: {fontFamily: JOBS_FONTS.bold, fontSize: 11.5, color: 'white', textAlign: 'center'},
});
