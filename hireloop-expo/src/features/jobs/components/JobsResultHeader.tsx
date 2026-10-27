import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {JOBS_COLORS, JOBS_FONTS} from './jobs.ui';

type JobsResultHeaderProps = {total: number; onSortPress: () => void};

export function JobsResultHeader({total, onSortPress}: JobsResultHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.total}>{total} lowongan ditemukan</Text>
      <Pressable accessibilityRole="button" onPress={onSortPress} style={styles.sort}>
        <Text style={styles.sortText}>Terbaru</Text>
        <Ionicons name="chevron-down" size={18} color={JOBS_COLORS.body} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  total: {flex: 1, fontFamily: JOBS_FONTS.medium, fontSize: 13, color: JOBS_COLORS.body},
  sort: {flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5},
  sortText: {fontFamily: JOBS_FONTS.semibold, fontSize: 12, color: JOBS_COLORS.body},
});
