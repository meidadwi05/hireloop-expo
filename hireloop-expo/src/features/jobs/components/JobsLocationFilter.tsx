import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {JOBS_COLORS, JOBS_FONTS, jobsCardShadow} from './jobs.ui';

type JobsLocationFilterProps = {
  controlIconSize: number;
  chevronIconSize: number;
  onUnavailablePress: () => void;
};

export function JobsLocationFilter({controlIconSize, chevronIconSize, onUnavailablePress}: JobsLocationFilterProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityHint="Filter lokasi khusus belum didukung oleh server"
        accessibilityRole="button"
        onPress={onUnavailablePress}
        style={({pressed}) => [styles.control, styles.location, pressed && styles.pressed]}
      >
        <Ionicons name="location-outline" size={controlIconSize} color="#49607F" />
        <Text numberOfLines={1} style={styles.text}>Semua lokasi</Text>
        <Ionicons name="chevron-down" size={chevronIconSize} color="#49607F" />
      </Pressable>
      <Pressable
        accessibilityHint="Filter lanjutan belum didukung oleh server"
        accessibilityRole="button"
        onPress={onUnavailablePress}
        style={({pressed}) => [styles.control, styles.filter, pressed && styles.pressed]}
      >
        <Ionicons name="options-outline" size={controlIconSize} color="#49607F" />
        <Text style={styles.text}>Filter</Text>
        <View style={styles.dot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', gap: 10},
  control: {...jobsCardShadow, minHeight: 58, borderRadius: 14, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9},
  location: {flex: 1},
  filter: {flexBasis: 112},
  text: {flex: 1, fontFamily: JOBS_FONTS.medium, fontSize: 14, color: JOBS_COLORS.body},
  dot: {position: 'absolute', right: 10, top: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: JOBS_COLORS.blue},
  pressed: {opacity: 0.76},
});
