import React from 'react';
import {StyleSheet, View} from 'react-native';

import {ShimmerBlock, ShimmerGroup} from '../../../shared/components/shimmer';
import {jobsCardShadow} from './jobs.ui';

export function JobDetailSkeleton() {
  return (
    <ShimmerGroup>
      <View accessible accessibilityLabel="Memuat detail lowongan" accessibilityRole="progressbar" style={styles.wrap} testID="job-detail-skeleton">
        <View style={styles.card}>
          <View style={styles.row}>
            <ShimmerBlock borderRadius={14} height={54} width={54} />
            <View style={styles.copy}>
              <ShimmerBlock height={18} width="78%" />
              <ShimmerBlock height={11} width="48%" />
            </View>
          </View>
          <View style={styles.badges}>
            <ShimmerBlock borderRadius={14} height={27} width={68} />
            <ShimmerBlock borderRadius={14} height={27} width={116} />
          </View>
          {[0, 1, 2, 3].map(item => (
            <View key={item} style={styles.infoRow}>
              <ShimmerBlock borderRadius={9} height={18} width={18} />
              <ShimmerBlock height={11} width={item === 2 ? '58%' : '76%'} />
            </View>
          ))}
        </View>

        {[0, 1, 2].map(section => (
          <View key={section} style={styles.card}>
            <ShimmerBlock height={15} width={section === 1 ? '48%' : '38%'} />
            <ShimmerBlock height={10} width="100%" />
            <ShimmerBlock height={10} width="94%" />
            <ShimmerBlock height={10} width={section === 2 ? '68%' : '82%'} />
          </View>
        ))}

        <ShimmerBlock borderRadius={12} height={52} width="100%" />
      </View>
    </ShimmerGroup>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 15},
  card: {...jobsCardShadow, borderRadius: 18, backgroundColor: 'white', padding: 18, gap: 14},
  row: {flexDirection: 'row', gap: 12},
  copy: {flex: 1, minWidth: 0, gap: 9, paddingTop: 4},
  badges: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  infoRow: {flexDirection: 'row', alignItems: 'center', gap: 9},
});
