import React from 'react';
import {StyleSheet, View} from 'react-native';

import {ShimmerBlock, ShimmerGroup} from '../../../shared/components/shimmer';
import {jobsCardShadow} from './jobs.ui';

function Line({width, height = 12}: {width: `${number}%`; height?: number}) {
  return <ShimmerBlock height={height} width={width} />;
}

export function JobsListSkeleton() {
  return (
    <ShimmerGroup>
      <View accessible accessibilityLabel="Memuat lowongan" accessibilityRole="progressbar" style={styles.wrap} testID="jobs-list-skeleton">
        {[0, 1].map(item => (
          <View key={item} style={styles.card}>
            <View style={styles.row}><ShimmerBlock borderRadius={13} height={50} width={50} /><View style={styles.copy}><Line width="78%" height={15} /><Line width="52%" /></View></View>
            <Line width="38%" />
            <Line width="92%" />
            <Line width="67%" height={14} />
            <ShimmerBlock borderRadius={10} height={46} width="100%" style={styles.button} />
          </View>
        ))}
      </View>
    </ShimmerGroup>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 14},
  card: {...jobsCardShadow, minHeight: 300, borderRadius: 18, backgroundColor: 'white', padding: 18, gap: 16},
  row: {flexDirection: 'row', gap: 12},
  copy: {flex: 1, gap: 9, paddingTop: 6},
  button: {marginTop: 'auto'},
});
