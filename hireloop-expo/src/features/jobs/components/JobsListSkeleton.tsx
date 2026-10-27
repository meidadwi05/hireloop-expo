import React from 'react';
import {StyleSheet, View} from 'react-native';

import {jobsCardShadow} from './jobs.ui';

function Line({width, height = 12}: {width: `${number}%`; height?: number}) {
  return <View style={[styles.line, {width, height}]} />;
}

export function JobsListSkeleton() {
  return (
    <View accessibilityLabel="Memuat lowongan" style={styles.wrap}>
      {[0, 1].map(item => (
        <View key={item} style={styles.card}>
          <View style={styles.row}><View style={styles.icon} /><View style={styles.copy}><Line width="78%" height={15} /><Line width="52%" /></View></View>
          <Line width="38%" />
          <Line width="92%" />
          <Line width="67%" height={14} />
          <View style={styles.button} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 14},
  card: {...jobsCardShadow, minHeight: 300, borderRadius: 18, backgroundColor: 'white', padding: 18, gap: 16},
  row: {flexDirection: 'row', gap: 12},
  icon: {width: 50, height: 50, borderRadius: 13, backgroundColor: '#E8EDF5'},
  copy: {flex: 1, gap: 9, paddingTop: 6},
  line: {borderRadius: 6, backgroundColor: '#E8EDF5'},
  button: {height: 46, borderRadius: 10, backgroundColor: '#E8EDF5', marginTop: 'auto'},
});
