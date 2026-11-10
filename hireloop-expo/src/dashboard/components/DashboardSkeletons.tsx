import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {ShimmerBlock} from './ShimmerBlock';

const F = {
  bold: 'PlusJakartaSans_700Bold',
} as const;

function SkeletonSectionHeader({title}: {title: string}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ShimmerBlock borderRadius={5} height={10} width={52} />
    </View>
  );
}

export function SummaryGridSkeleton({compact, gap, minHeight}: {compact: boolean; gap: number; minHeight: number}) {
  return (
    <View accessible accessibilityLabel="Memuat ringkasan dashboard" accessibilityRole="progressbar" style={[styles.summaryGrid, {gap}]} testID="dashboard-summary-shimmer">
      {[0, 1, 2, 3].map(item => (
        <View key={item} style={[styles.summaryCard, {minHeight, paddingHorizontal: compact ? 10 : 12}]}>
          <ShimmerBlock borderRadius={compact ? 17 : 21} height={compact ? 42 : 50} width={compact ? 42 : 50} />
          <View style={styles.summaryCopy}>
            <ShimmerBlock height={compact ? 21 : 25} width="42%" />
            <ShimmerBlock height={9} width="82%" />
            <ShimmerBlock height={9} width="58%" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function InterviewCardSkeleton({compact, dateWidth}: {compact: boolean; dateWidth: number}) {
  return (
    <View accessible accessibilityLabel="Memuat interview terdekat" accessibilityRole="progressbar" testID="dashboard-interview-shimmer">
      <SkeletonSectionHeader title="Interview Terdekat" />
      <View style={[styles.interviewCard, compact && styles.cardCompact]}>
        <ShimmerBlock borderRadius={11} height={112} width={dateWidth} />
        <View style={styles.interviewCopy}>
          <ShimmerBlock height={18} width="84%" />
          <ShimmerBlock height={11} width="68%" />
          <ShimmerBlock height={13} width="60%" />
          <View style={[styles.interviewActions, compact && styles.interviewActionsCompact]}>
            <ShimmerBlock height={38} width={compact ? '58%' : '58%'} />
            <ShimmerBlock height={38} width={compact ? '36%' : '36%'} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function RecentApplicationsSkeleton({compact}: {compact: boolean}) {
  return (
    <View accessible accessibilityLabel="Memuat lamaran terbaru" accessibilityRole="progressbar" testID="dashboard-applications-shimmer">
      <SkeletonSectionHeader title="Lamaran Terbaru" />
      <View style={styles.recentCard}>
        {[0, 1].map(item => (
          <View key={item} style={[styles.recentRow, item === 0 && styles.divider]}>
            <ShimmerBlock borderRadius={12} height={compact ? 42 : 48} width={compact ? 42 : 48} />
            <View style={styles.recentCopy}>
              <ShimmerBlock height={13} width="76%" />
              <ShimmerBlock height={10} width="58%" />
              <ShimmerBlock height={9} width="38%" />
            </View>
            {!compact ? <ShimmerBlock borderRadius={14} height={28} width={88} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export function RecommendationSkeleton({cardWidth, compact}: {cardWidth: number; compact: boolean}) {
  return (
    <View accessible accessibilityLabel="Memuat rekomendasi pekerjaan" accessibilityRole="progressbar" testID="dashboard-recommendations-shimmer">
      <SkeletonSectionHeader title="Rekomendasi Pekerjaan" />
      <View style={styles.recommendationTrack}>
        <View style={[styles.jobCard, {minHeight: compact ? 390 : 440, width: cardWidth}]}>
          <View style={styles.jobHeader}>
            <ShimmerBlock borderRadius={12} height={48} width={48} />
            <View style={styles.jobCopy}>
              <ShimmerBlock height={16} width="82%" />
              <ShimmerBlock height={11} width="57%" />
            </View>
          </View>
          <ShimmerBlock height={25} width="42%" />
          <ShimmerBlock height={12} width="90%" />
          <ShimmerBlock height={14} width="72%" />
          <View style={styles.skillRow}>
            <ShimmerBlock borderRadius={13} height={26} width={92} />
            <ShimmerBlock borderRadius={13} height={26} width={78} />
          </View>
          <View style={styles.jobButtons}>
            <ShimmerBlock height={40} width={compact ? '100%' : '62%'} />
            {!compact ? <ShimmerBlock height={40} width="32%" /> : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const cardShadow = {
  shadowColor: '#152C5B',
  shadowOffset: {width: 0, height: 5},
  shadowOpacity: 0.08,
  shadowRadius: 9,
  elevation: 3,
};

const styles = StyleSheet.create({
  sectionHeader: {minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
  sectionTitle: {flex: 1, fontFamily: F.bold, fontSize: 19, color: '#111318'},
  summaryGrid: {zIndex: 3, elevation: 6, flexDirection: 'row', flexWrap: 'wrap'},
  summaryCard: {...cardShadow, flexBasis: '47%', flexGrow: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 16, backgroundColor: 'white', paddingVertical: 13},
  summaryCopy: {flex: 1, minWidth: 0, gap: 6},
  interviewCard: {...cardShadow, minHeight: 132, flexDirection: 'row', gap: 10, borderRadius: 18, backgroundColor: 'white', padding: 10, marginTop: 13},
  cardCompact: {gap: 10, padding: 10},
  interviewCopy: {flex: 1, minWidth: 0, gap: 10, paddingVertical: 4},
  interviewActions: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto'},
  interviewActionsCompact: {flexDirection: 'row', alignItems: 'center'},
  recentCard: {...cardShadow, borderRadius: 18, backgroundColor: 'white', paddingHorizontal: 16, marginTop: 14},
  recentRow: {minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12},
  divider: {borderBottomWidth: 1, borderBottomColor: '#EAEDF3'},
  recentCopy: {flex: 1, minWidth: 0, gap: 6},
  recommendationTrack: {paddingTop: 16, paddingBottom: 8},
  jobCard: {...cardShadow, borderWidth: 1, borderColor: '#EDF1F7', borderRadius: 18, backgroundColor: 'white', padding: 17, gap: 16},
  jobHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  jobCopy: {flex: 1, minWidth: 0, gap: 8},
  skillRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 7},
  jobButtons: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto'},
});
