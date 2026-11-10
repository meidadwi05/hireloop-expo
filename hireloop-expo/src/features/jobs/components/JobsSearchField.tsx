import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {FormTextInput} from '../../../components/forms/FormTextInput';
import {JOBS_COLORS, JOBS_FONTS} from './jobs.ui';

type JobsSearchFieldProps = {
  value: string;
  height: number;
  iconSize: number;
  iconSlotSize: number;
  onChangeText: (value: string) => void;
};

export function JobsSearchField({value, height, iconSize, iconSlotSize, onChangeText}: JobsSearchFieldProps) {
  return (
    <FormTextInput
      accessibilityLabel="Cari posisi, perusahaan, atau lokasi"
      autoCapitalize="none"
      autoCorrect={false}
      containerStyle={[styles.container, {height, minHeight: height}]}
      fieldTestID="jobs-search-frame"
      inputStyle={styles.input}
      leftAccessory={<View style={[styles.iconSlot, {width: iconSlotSize}]}>
        <Ionicons name="search-outline" color="#536684" size={iconSize} />
      </View>}
      onChangeText={onChangeText}
      placeholder="Cari posisi, perusahaan, atau lokasi"
      placeholderTextColor="#8F9AB0"
      returnKeyType="search"
      rightAccessory={value ? (
        <Pressable
          accessibilityLabel="Hapus pencarian"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChangeText('')}
        >
          <Ionicons name="close-circle" color="#8F9AB0" size={Math.max(18, iconSize - 1)} />
        </Pressable>
      ) : undefined}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  iconSlot: {alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontFamily: JOBS_FONTS.regular,
    fontSize: 15,
    color: JOBS_COLORS.ink,
  },
});
