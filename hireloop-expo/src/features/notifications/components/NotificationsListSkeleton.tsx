import React from 'react';
import {StyleSheet, View} from 'react-native';

import {ShimmerBlock, ShimmerGroup} from '../../../shared/components/shimmer';

export function NotificationsListSkeleton({horizontalPadding}: {horizontalPadding: number}) {
  return (
    <ShimmerGroup>
      <View accessible accessibilityLabel="Memuat notifikasi" accessibilityRole="progressbar" style={[styles.list, {paddingHorizontal: horizontalPadding}]} testID="notifications-list-skeleton">
        <ShimmerBlock height={12} width={74} />
        {[0, 1, 2, 3, 4].map(item => (
          <View key={item} style={styles.row}>
            <ShimmerBlock borderRadius={23} height={46} width={46} />
            <View style={styles.copy}>
              <View style={styles.meta}>
                <ShimmerBlock borderRadius={10} height={20} width={82} />
                <ShimmerBlock height={9} width={54} />
              </View>
              <ShimmerBlock height={13} width={item % 2 ? '68%' : '82%'} />
              <ShimmerBlock height={10} width="100%" />
              <ShimmerBlock height={10} width={item % 2 ? '72%' : '88%'} />
            </View>
          </View>
        ))}
      </View>
    </ShimmerGroup>
  );
}

const styles = StyleSheet.create({
  list: {gap: 12, paddingTop: 16, paddingBottom: 24},
  row: {minHeight: 128, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E4EAF3', backgroundColor: 'white', padding: 14},
  copy: {flex: 1, minWidth: 0, gap: 9},
  meta: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
});
