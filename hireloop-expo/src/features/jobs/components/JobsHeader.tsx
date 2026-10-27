import Ionicons from '@expo/vector-icons/Ionicons';
import React, {type ReactNode} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';
import {getJobsIconLayout} from '../jobs-header.layout';
import {JOBS_FONTS} from './jobs.ui';
import {JobsSearchField} from './JobsSearchField';

const headerBackground = require('../../../assets/up_background.png');

type JobsHeaderProps = {
  children: ReactNode;
  containerWidth: number;
  horizontalPadding: number;
  search: string;
  onChangeSearch: (value: string) => void;
  onOpenSaved: () => void;
};

export function JobsHeader({children, containerWidth, horizontalPadding, search, onChangeSearch, onOpenSaved}: JobsHeaderProps) {
  const insets = useSafeAreaInsets();
  const iconLayout = getJobsIconLayout(containerWidth);

  return (
    <View
      style={[
        styles.background,
        {paddingHorizontal: horizontalPadding, paddingTop: insets.top + 10},
      ]}
      testID="jobs-header-background"
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={headerBackground}
        style={styles.image}
        testID="jobs-header-artwork"
      />
      <View style={styles.titleRow}>
        <Pressable
          accessibilityLabel="Kembali ke Beranda"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => goBackOrReplace('/(candidate)/(tabs)/home')}
          style={[
            styles.iconButton,
            {height: iconLayout.navigationButtonSize, width: iconLayout.navigationButtonSize},
          ]}
        >
          <Ionicons name="arrow-back" color="white" size={iconLayout.navigationIconSize} />
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
          style={[
            styles.iconButton,
            {height: iconLayout.navigationButtonSize, width: iconLayout.navigationButtonSize},
          ]}
        >
          <Ionicons name="bookmark-outline" color="white" size={iconLayout.navigationIconSize} />
        </Pressable>
      </View>
      <JobsSearchField
        value={search}
        iconSize={iconLayout.searchIconSize}
        iconSlotSize={iconLayout.iconSlotSize}
        height={iconLayout.searchFieldHeight}
        onChangeText={onChangeSearch}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {position: 'relative', overflow: 'hidden', paddingBottom: 12, gap: 12, backgroundColor: '#00419E'},
  image: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%', opacity: 0.96},
  titleRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 11},
  iconButton: {alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  copy: {flex: 1, minWidth: 0},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 24, lineHeight: 31, color: 'white'},
  subtitle: {fontFamily: JOBS_FONTS.regular, fontSize: 12.5, lineHeight: 18, color: 'rgba(255,255,255,0.88)', marginTop: 2},
});
