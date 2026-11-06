import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';
import {getJobsIconLayout} from '../jobs-header.layout';
import {JOBS_FONTS} from './jobs.ui';
import {JobsSearchField} from './JobsSearchField';

type JobsHeaderProps = {
  containerWidth: number;
  horizontalPadding: number;
  search: string;
  onChangeSearch: (value: string) => void;
};

export function JobsHeader({containerWidth, horizontalPadding, search, onChangeSearch}: JobsHeaderProps) {
  const insets = useSafeAreaInsets();
  const iconLayout = getJobsIconLayout(containerWidth);

  return (
    <BrandedHeaderBackground
      artworkTestID="jobs-header-artwork"
      containerWidth={containerWidth}
      contentTestID="jobs-header-content"
      topInset={insets.top}
      variant="jobs-list"
      contentStyle={[
        styles.content,
        {paddingHorizontal: horizontalPadding, paddingTop: insets.top + 8},
      ]}
      testID="jobs-header-background"
    >
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
      </View>
      <View style={styles.searchOffset}>
        <JobsSearchField
          value={search}
          iconSize={iconLayout.searchIconSize}
          iconSlotSize={iconLayout.iconSlotSize}
          height={iconLayout.searchFieldHeight}
          onChangeText={onChangeSearch}
        />
      </View>
    </BrandedHeaderBackground>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 10, gap: 10},
  titleRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 11},
  iconButton: {alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  copy: {flex: 1, minWidth: 0},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 24, lineHeight: 31, color: 'white'},
  subtitle: {fontFamily: JOBS_FONTS.regular, fontSize: 12.5, lineHeight: 18, color: 'rgba(255,255,255,0.88)', marginTop: 2},
  searchOffset: {marginTop: 8},
});
