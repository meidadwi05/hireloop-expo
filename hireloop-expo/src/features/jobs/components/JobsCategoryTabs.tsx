import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {CandidateJobQuery} from '../jobs.types';
import {JOBS_COLORS, JOBS_FONTS} from './jobs.ui';

type Priority = NonNullable<CandidateJobQuery['priority']>;
type JobsCategoryTabsProps = {value: Priority; onChange: (value: Priority) => void};

function Tab({active, label, onPress}: {active: boolean; label: string; onPress: () => void}) {
  if (active) {
    return (
      <Pressable accessibilityRole="tab" accessibilityState={{selected: true}} onPress={onPress} style={styles.tab}>
        <LinearGradient colors={['#0865FF', '#004FC8']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.activeFill}>
          <Text style={styles.activeText}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityRole="tab" accessibilityState={{selected: false}} onPress={onPress} style={[styles.tab, styles.inactive]}>
      <Text style={styles.inactiveText}>{label}</Text>
    </Pressable>
  );
}

export function JobsCategoryTabs({value, onChange}: JobsCategoryTabsProps) {
  return (
    <View accessibilityRole="tablist" style={styles.row}>
      <Tab active={value === 'all'} label="Semua Lowongan" onPress={() => onChange('all')} />
      <Tab active={value === 'high'} label="Dibutuhkan Segera" onPress={() => onChange('high')} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', gap: 10},
  tab: {flex: 1, height: 51, borderRadius: 12, overflow: 'hidden'},
  activeFill: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8},
  inactive: {borderWidth: 1.5, borderColor: JOBS_COLORS.blue, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'},
  activeText: {fontFamily: JOBS_FONTS.bold, fontSize: 12, color: 'white', textAlign: 'center'},
  inactiveText: {fontFamily: JOBS_FONTS.semibold, fontSize: 12, color: JOBS_COLORS.navy, textAlign: 'center'},
});
