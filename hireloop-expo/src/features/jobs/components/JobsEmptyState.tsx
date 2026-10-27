import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {JOBS_COLORS, JOBS_FONTS} from './jobs.ui';

type JobsEmptyStateProps = {error?: string; onReset: () => void};

export function JobsEmptyState({error, onReset}: JobsEmptyStateProps) {
  return (
    <View style={styles.card}>
      <Ionicons name={error ? 'cloud-offline-outline' : 'search-outline'} size={42} color="#9AA7BB" />
      <Text style={styles.title}>{error ? 'Lowongan belum dapat dimuat' : 'Lowongan tidak ditemukan'}</Text>
      <Text style={styles.message}>{error ?? 'Coba kata kunci lain atau tampilkan kembali semua lowongan.'}</Text>
      <Pressable accessibilityRole="button" onPress={onReset} style={styles.button}>
        <Text style={styles.buttonText}>{error ? 'Coba lagi' : 'Reset pencarian'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {minHeight: 260, borderRadius: 18, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', padding: 28, borderWidth: 1, borderColor: JOBS_COLORS.border},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 16, color: JOBS_COLORS.ink, textAlign: 'center', marginTop: 12},
  message: {fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 18, color: JOBS_COLORS.body, textAlign: 'center', marginTop: 6},
  button: {minHeight: 40, borderRadius: 10, backgroundColor: JOBS_COLORS.blue, justifyContent: 'center', paddingHorizontal: 22, marginTop: 18},
  buttonText: {fontFamily: JOBS_FONTS.semibold, fontSize: 11, color: 'white'},
});
