import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {JOBS_COLORS, JOBS_FONTS, jobsCardShadow} from './jobs.ui';

type JobsLocationFilterProps = {
  controlHeight: number;
  controlIconSize: number;
  chevronIconSize: number;
  iconSlotSize: number;
  onUnavailablePress: () => void;
};

export function JobsLocationFilter({controlHeight, controlIconSize, chevronIconSize, iconSlotSize, onUnavailablePress}: JobsLocationFilterProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityHint="Filter lokasi khusus belum didukung oleh server"
        accessibilityRole="button"
        onPress={onUnavailablePress}
        style={({pressed}) => [styles.control, styles.location, {height: controlHeight, minHeight: controlHeight}, pressed && styles.pressed]}
      >
        <View style={[styles.iconSlot, {width: iconSlotSize}]}>
          <Ionicons name="location-outline" size={controlIconSize} color="#49607F" />
        </View>
        <Text numberOfLines={1} style={styles.text}>Semua lokasi</Text>
        <Ionicons name="chevron-down" size={chevronIconSize} color="#49607F" />
      </Pressable>
      <Pressable
        accessibilityHint="Filter lanjutan belum didukung oleh server"
        accessibilityRole="button"
        onPress={onUnavailablePress}
        style={({pressed}) => [styles.control, styles.filter, {height: controlHeight, minHeight: controlHeight}, pressed && styles.pressed]}
      >
        <View style={[styles.iconSlot, {width: iconSlotSize}]}>
          <Ionicons name="options-outline" size={controlIconSize} color="#49607F" />
        </View>
        <Text style={styles.text}>Filter</Text>
        <View style={styles.dot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', gap: 10},
  control: {...jobsCardShadow, borderRadius: 14, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 7},
  location: {flex: 1},
  filter: {flexBasis: 112},
  text: {flex: 1, fontFamily: JOBS_FONTS.medium, fontSize: 14, color: JOBS_COLORS.body},
  iconSlot: {alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  dot: {position: 'absolute', right: 10, top: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: JOBS_COLORS.blue},
  pressed: {opacity: 0.76},
});
