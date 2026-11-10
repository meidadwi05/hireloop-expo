import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {ShimmerBlock, ShimmerGroup} from '../../../shared/components/shimmer';
import {APPLICATION_COLORS, APPLICATION_FONTS, applicationShadow} from './applications.ui';

export function ApplicationsListSkeleton({horizontalPadding}: {horizontalPadding: number}) {
  return (
    <ShimmerGroup>
      <View accessible accessibilityLabel="Memuat daftar lamaran" accessibilityRole="progressbar" style={[styles.list, {paddingHorizontal: horizontalPadding}]} testID="applications-list-skeleton">
        {[0, 1, 2].map(item => (
          <View key={item} style={styles.applicationCard}>
            <View style={styles.row}>
              <ShimmerBlock borderRadius={13} height={50} width={50} />
              <View style={styles.flexCopy}>
                <ShimmerBlock height={15} width="76%" />
                <ShimmerBlock height={11} width="52%" />
              </View>
              <ShimmerBlock borderRadius={14} height={28} width={72} />
            </View>
            <ShimmerBlock height={11} width="42%" />
            <ShimmerBlock height={11} width="64%" />
            <View style={styles.cardFooter}>
              <ShimmerBlock height={10} width="38%" />
              <ShimmerBlock borderRadius={10} height={39} width={92} />
            </View>
          </View>
        ))}
      </View>
    </ShimmerGroup>
  );
}

export function ApplicationTimelineSkeleton() {
  return (
    <ShimmerGroup>
      <View accessible accessibilityLabel="Memuat progres seleksi" accessibilityRole="progressbar" style={styles.timeline} testID="application-timeline-skeleton">
        {[0, 1, 2].map(item => (
          <View key={item} style={styles.timelineRow}>
            <ShimmerBlock borderRadius={14} height={28} width={28} />
            <View style={styles.flexCopy}>
              <ShimmerBlock height={12} width={item === 2 ? '48%' : '65%'} />
              <ShimmerBlock height={9} width={item === 1 ? '76%' : '54%'} />
            </View>
          </View>
        ))}
      </View>
    </ShimmerGroup>
  );
}

export function ApplicationDetailSkeleton({
  bottomInset,
  containerWidth,
  horizontalPadding,
  topInset,
  onBack,
}: {
  bottomInset: number;
  containerWidth: number;
  horizontalPadding: number;
  topInset: number;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']} testID="application-detail-skeleton">
      <ScrollView contentContainerStyle={{paddingBottom: Math.max(bottomInset, 16) + 18}} showsVerticalScrollIndicator={false}>
        <BrandedHeaderBackground
          containerWidth={containerWidth}
          topInset={topInset}
          variant="compact-detail"
          contentStyle={[styles.headerContent, {paddingTop: topInset + 8}]}
        >
          <Pressable accessibilityLabel="Kembali ke Lamaran Saya" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Lamaran</Text>
          <View style={styles.backButton} />
        </BrandedHeaderBackground>

        <ShimmerGroup>
          <View accessible accessibilityLabel="Memuat detail lamaran" accessibilityRole="progressbar" style={[styles.detailContent, {paddingHorizontal: horizontalPadding}]}>
            <View style={styles.detailCard}>
              <View style={styles.row}>
                <ShimmerBlock borderRadius={14} height={54} width={54} />
                <View style={styles.flexCopy}>
                  <ShimmerBlock height={17} width="78%" />
                  <ShimmerBlock height={11} width="48%" />
                </View>
                <ShimmerBlock borderRadius={10} height={42} width={42} />
              </View>
              {[0, 1, 2, 3].map(item => (
                <View key={item} style={styles.metadataRow}>
                  <ShimmerBlock borderRadius={8} height={16} width={16} />
                  <ShimmerBlock height={11} width={item % 2 ? '58%' : '74%'} />
                </View>
              ))}
              <ShimmerBlock borderRadius={13} height={28} width="46%" />
            </View>

            <View style={styles.statusCard}>
              <ShimmerBlock borderRadius={21} height={42} width={42} />
              <View style={styles.flexCopy}>
                <ShimmerBlock height={15} width="48%" />
                <ShimmerBlock height={10} width="88%" />
              </View>
            </View>

            <View style={styles.detailCard}>
              <ShimmerBlock height={15} width="42%" />
              <ApplicationTimelineSkeleton />
            </View>

            {[0, 1].map(card => (
              <View key={card} style={styles.detailCard}>
                <ShimmerBlock height={15} width="44%" />
                {[0, 1, 2].map(line => <ShimmerBlock key={line} height={10} width={line === 2 ? '72%' : '100%'} />)}
              </View>
            ))}
          </View>
        </ShimmerGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: APPLICATION_COLORS.background},
  list: {gap: 15, paddingTop: 15},
  applicationCard: {...applicationShadow, minHeight: 210, borderRadius: 16, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', padding: 16, gap: 14},
  row: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  flexCopy: {flex: 1, minWidth: 0, gap: 9, paddingTop: 4},
  cardFooter: {marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  timeline: {gap: 17, paddingTop: 8},
  timelineRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  headerContent: {paddingHorizontal: 14, paddingBottom: 12, flexDirection: 'row', alignItems: 'center'},
  backButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {flex: 1, fontFamily: APPLICATION_FONTS.bold, fontSize: 22, color: 'white', textAlign: 'center'},
  detailContent: {paddingTop: 17, gap: 15},
  detailCard: {...applicationShadow, borderRadius: 16, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', padding: 16, gap: 14},
  metadataRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  statusCard: {minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, borderColor: '#D8E5F8', backgroundColor: '#F4F8FF', padding: 16},
});
