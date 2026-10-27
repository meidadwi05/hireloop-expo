import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';
import {JOBS_FONTS} from './jobs.ui';
import {JobsSearchField} from './JobsSearchField';

const headerBackground = require('../../../assets/up_background.png');

type JobsHeaderProps = {
  search: string;
  onChangeSearch: (value: string) => void;
  onOpenSaved: () => void;
};

export function JobsHeader({search, onChangeSearch, onOpenSaved}: JobsHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={headerBackground}
      resizeMode="cover"
      style={[styles.background, {paddingTop: insets.top + 10}]}
      imageStyle={styles.image}
      testID="jobs-header-background"
    >
      <View style={styles.titleRow}>
        <Pressable
          accessibilityLabel="Kembali ke Beranda"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => goBackOrReplace('/(candidate)/(tabs)/home')}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" color="white" size={27} />
        </Pressable>
        <View style={styles.copy}>
          <Text style={styles.title}>Lowongan Kerja</Text>
          <Text style={styles.subtitle}>Temukan peluang yang sesuai untukmu</Text>
        </View>
        <Pressable
          accessibilityLabel="Lowongan tersimpan"
          accessibilityRole="button"
          hitSlop={10}
          onPress={onOpenSaved}
          style={styles.iconButton}
        >
          <Ionicons name="bookmark-outline" color="white" size={26} />
        </Pressable>
      </View>
      <JobsSearchField value={search} onChangeText={onChangeSearch} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {paddingHorizontal: 20, paddingBottom: 50, gap: 23, backgroundColor: '#00419E'},
  image: {opacity: 0.96},
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: 11},
  iconButton: {width: 34, height: 44, alignItems: 'center', justifyContent: 'center'},
  copy: {flex: 1, minWidth: 0},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 24, lineHeight: 31, color: 'white'},
  subtitle: {fontFamily: JOBS_FONTS.regular, fontSize: 12.5, lineHeight: 18, color: 'rgba(255,255,255,0.88)', marginTop: 2},
});
