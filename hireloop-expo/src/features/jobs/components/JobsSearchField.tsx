import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useState} from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';

import {JOBS_COLORS, JOBS_FONTS} from './jobs.ui';

type JobsSearchFieldProps = {
  value: string;
  iconSize: number;
  onChangeText: (value: string) => void;
};

export function JobsSearchField({value, iconSize, onChangeText}: JobsSearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused]}>
      <Ionicons name="search-outline" color="#536684" size={iconSize} />
      <TextInput
        accessibilityLabel="Cari posisi atau perusahaan"
        autoCapitalize="none"
        autoCorrect={false}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        placeholder="Cari posisi atau perusahaan"
        placeholderTextColor="#8F9AB0"
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
      {!!value && (
        <Pressable
          accessibilityLabel="Hapus pencarian"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChangeText('')}
        >
          <Ionicons name="close-circle" color="#8F9AB0" size={Math.max(18, iconSize - 1)} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 59,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'white',
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  focused: {borderColor: JOBS_COLORS.blue},
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontFamily: JOBS_FONTS.regular,
    fontSize: 15,
    color: JOBS_COLORS.ink,
  },
});
