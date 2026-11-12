import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {
  interviewClock,
  interviewCompany,
  interviewPosition,
} from '../dashboard.interviews';
import type {DashboardInterview} from '../dashboard.types';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

function dateParts(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return {day: '--', month: '---'};
  return {day: String(date.getDate()).padStart(2, '0'), month: MONTHS[date.getMonth()]};
}

function relativeDay(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Jadwal';
  const today = new Date();
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const interviewDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const difference = Math.round((interviewDay - currentDay) / 86_400_000);
  if (difference === 0) return 'Hari ini';
  if (difference === 1) return 'Besok';
  return difference > 1 ? `${difference} hari lagi` : 'Terlewat';
}

function DateBlock({compact, interview}: {compact: boolean; interview: DashboardInterview}) {
  const value = dateParts(interview.date);
  return (
    <View style={[styles.dateBlock, compact && styles.dateBlockCompact]}>
      <View style={styles.dateMain}>
        <Text style={[styles.dateDay, compact && styles.dateDayCompact]}>{value.day}</Text>
        <Text style={styles.dateMonth}>{value.month}</Text>
        <Text numberOfLines={1} style={styles.dateRelative}>{relativeDay(interview.date)}</Text>
      </View>
      <View style={styles.dateTimeFooter}>
        <Text numberOfLines={2} style={styles.dateTime}>{interviewClock(interview)}</Text>
      </View>
    </View>
  );
}

export function InterviewScheduleCard({
  compact,
  interview,
  onDetail,
}: {
  compact: boolean;
  interview: DashboardInterview;
  onDetail: () => void;
}) {
  const online = interview.mode === 'online';
  const modeText = online
    ? interview.location_platform || interview.method || 'Online Interview'
    : interview.location || 'Lokasi menyusul';
  const stage = interview.stage_name || interview.interview_type || interview.category || interview.agenda;

  return (
    <View
      accessibilityLabel={`${interviewPosition(interview)}, ${interviewCompany(interview)}, ${online ? 'online' : 'offline'}`}
      style={[styles.card, compact && styles.cardCompact]}
      testID={`interview-schedule-card-${interview.id}`}
    >
      <DateBlock compact={compact} interview={interview} />
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text numberOfLines={2} style={[styles.position, compact && styles.positionCompact]}>{interviewPosition(interview)}</Text>
              <Pressable
                accessibilityLabel={`Lihat detail ${interviewPosition(interview)}`}
                accessibilityRole="button"
                hitSlop={6}
                onPress={onDetail}
                style={styles.cardChevron}
                testID="interview-card-chevron"
              >
                <Ionicons name="chevron-forward" size={18} color="#0876E8" />
              </Pressable>
            </View>
            <Text numberOfLines={1} style={styles.company}>{interviewCompany(interview)}</Text>
            <View style={styles.modeRow}>
              <Ionicons name={online ? 'videocam-outline' : 'location-outline'} size={14} color="#0876E8" />
              <Text numberOfLines={1} style={styles.modeText}>{modeText}</Text>
            </View>
            {stage ? <View style={styles.stageBadge}><Text numberOfLines={1} style={styles.stageText}>{stage}</Text></View> : null}
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={`${online ? 'Lihat detail' : 'Lihat detail lokasi'} ${interviewPosition(interview)}`}
            accessibilityRole="button"
            hitSlop={3}
            onPress={onDetail}
            style={({pressed}) => [styles.detailButton, styles.detailButtonFull, pressed && styles.pressed]}
          >
            <Text style={styles.detailText}>{online ? 'Detail' : 'Detail Lokasi'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const shadow = {
  shadowColor: '#17376D',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.09,
  shadowRadius: 10,
  elevation: 3,
};

const styles = StyleSheet.create({
  card: {...shadow, minHeight: 150, flexDirection: 'row', gap: 9, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E7EF', borderRadius: 17, backgroundColor: '#FFFFFF', padding: 9},
  cardCompact: {minHeight: 144, gap: 7, padding: 8},
  dateBlock: {width: 68, minHeight: 130, overflow: 'hidden', borderRadius: 11, flexShrink: 0},
  dateBlockCompact: {width: 62, minHeight: 126},
  dateMain: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0643AA', paddingHorizontal: 3, paddingVertical: 5},
  dateDay: {fontFamily: F.bold, fontSize: 25, lineHeight: 28, color: '#FFFFFF'},
  dateDayCompact: {fontSize: 22, lineHeight: 25},
  dateMonth: {fontFamily: F.medium, fontSize: 12, color: '#FFFFFF'},
  dateRelative: {fontFamily: F.medium, fontSize: 7.5, color: 'rgba(255,255,255,0.92)', marginTop: 4},
  dateTimeFooter: {minHeight: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9E8FF', paddingHorizontal: 3, paddingVertical: 3},
  dateTime: {fontFamily: F.semibold, fontSize: 7.5, lineHeight: 10, color: '#071C4D', textAlign: 'center'},
  content: {flex: 1, minWidth: 0},
  infoRow: {flex: 1, minHeight: 78},
  copy: {flex: 1, minWidth: 0, alignSelf: 'stretch'},
  titleRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 3},
  position: {flex: 1, minWidth: 0, fontFamily: F.bold, fontSize: 12.5, lineHeight: 16, color: '#111827'},
  positionCompact: {fontSize: 11.5, lineHeight: 15},
  cardChevron: {width: 28, height: 28, flexShrink: 0, alignItems: 'center', justifyContent: 'center', marginTop: -5, marginRight: -3},
  company: {fontFamily: F.regular, fontSize: 9, lineHeight: 12, color: '#667085', marginTop: 2},
  modeRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5},
  modeText: {flex: 1, minWidth: 0, fontFamily: F.medium, fontSize: 8.5, lineHeight: 12, color: '#344054'},
  stageBadge: {maxWidth: '100%', alignSelf: 'flex-start', borderRadius: 9, backgroundColor: '#EAF2FF', paddingHorizontal: 7, paddingVertical: 3, marginTop: 5},
  stageText: {fontFamily: F.semibold, fontSize: 7.5, color: '#1F63D8'},
  actions: {minHeight: 38, flexDirection: 'row', gap: 6, marginTop: 6},
  detailButton: {flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#EDF3FC', paddingHorizontal: 6},
  detailButtonFull: {flex: 1, backgroundColor: '#F1ECFF'},
  detailText: {fontFamily: F.semibold, fontSize: 9, color: '#0B56B4'},
  pressed: {opacity: 0.82},
});
