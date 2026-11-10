import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import {
  interviewClock,
  interviewCompany,
  interviewPosition,
  isSafeExternalUrl,
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
  onJoin,
}: {
  compact: boolean;
  interview: DashboardInterview;
  onDetail: () => void;
  onJoin: () => void;
}) {
  const online = interview.mode === 'online';
  const canJoin = online && isSafeExternalUrl(interview.meeting_link);
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
            <Text numberOfLines={2} style={[styles.position, compact && styles.positionCompact]}>{interviewPosition(interview)}</Text>
            <Text numberOfLines={1} style={styles.company}>{interviewCompany(interview)}</Text>
            <View style={styles.modeRow}>
              <Ionicons name={online ? 'videocam-outline' : 'location-outline'} size={15} color="#0876E8" />
              <Text numberOfLines={1} style={styles.modeText}>{modeText}</Text>
            </View>
            {stage ? <View style={styles.stageBadge}><Text numberOfLines={1} style={styles.stageText}>{stage}</Text></View> : null}
          </View>
          <Image
            accessibilityIgnoresInvertColors
            accessible={false}
            resizeMode="contain"
            source={require('../../../assets/interview.png')}
            style={[styles.illustration, compact && styles.illustrationCompact]}
          />
        </View>
        <View style={styles.actions}>
          {canJoin ? (
            <Pressable
              accessibilityLabel={`Gabung interview ${interviewPosition(interview)}`}
              accessibilityRole="button"
              onPress={onJoin}
              style={({pressed}) => [styles.joinButton, pressed && styles.pressed]}
            >
              <Text style={styles.joinText}>Gabung Interview</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel={`${online ? 'Lihat detail' : 'Lihat detail lokasi'} ${interviewPosition(interview)}`}
            accessibilityRole="button"
            onPress={onDetail}
            style={({pressed}) => [styles.detailButton, !canJoin && styles.detailButtonFull, pressed && styles.pressed]}
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
  card: {...shadow, minHeight: 174, flexDirection: 'row', gap: 11, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E7EF', borderRadius: 18, backgroundColor: '#FFFFFF', padding: 11},
  cardCompact: {minHeight: 164, gap: 8, padding: 9},
  dateBlock: {width: 78, minHeight: 152, overflow: 'hidden', borderRadius: 12, flexShrink: 0},
  dateBlockCompact: {width: 70, minHeight: 146},
  dateMain: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0643AA', paddingHorizontal: 4, paddingVertical: 7},
  dateDay: {fontFamily: F.bold, fontSize: 29, lineHeight: 33, color: '#FFFFFF'},
  dateDayCompact: {fontSize: 25, lineHeight: 29},
  dateMonth: {fontFamily: F.medium, fontSize: 13.5, color: '#FFFFFF'},
  dateRelative: {fontFamily: F.medium, fontSize: 8, color: 'rgba(255,255,255,0.92)', marginTop: 5},
  dateTimeFooter: {minHeight: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9E8FF', paddingHorizontal: 3, paddingVertical: 4},
  dateTime: {fontFamily: F.semibold, fontSize: 8, lineHeight: 11, color: '#071C4D', textAlign: 'center'},
  content: {flex: 1, minWidth: 0},
  infoRow: {flex: 1, minHeight: 94, flexDirection: 'row', alignItems: 'center'},
  copy: {flex: 1, minWidth: 0, alignSelf: 'stretch'},
  position: {fontFamily: F.bold, fontSize: 13.5, lineHeight: 18, color: '#111827'},
  positionCompact: {fontSize: 12, lineHeight: 16},
  company: {fontFamily: F.regular, fontSize: 9.5, lineHeight: 13, color: '#667085', marginTop: 2},
  modeRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7},
  modeText: {flex: 1, minWidth: 0, fontFamily: F.medium, fontSize: 9, lineHeight: 13, color: '#344054'},
  stageBadge: {maxWidth: '100%', alignSelf: 'flex-start', borderRadius: 10, backgroundColor: '#EAF2FF', paddingHorizontal: 8, paddingVertical: 4, marginTop: 7},
  stageText: {fontFamily: F.semibold, fontSize: 8, color: '#1F63D8'},
  illustration: {width: 68, height: 63, flexShrink: 0, marginLeft: 4},
  illustrationCompact: {width: 52, height: 52},
  actions: {minHeight: 44, flexDirection: 'row', gap: 7, marginTop: 7},
  joinButton: {flex: 1.5, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#0649B8', paddingHorizontal: 7},
  joinText: {fontFamily: F.semibold, fontSize: 9.5, color: '#FFFFFF'},
  detailButton: {flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#EDF3FC', paddingHorizontal: 7},
  detailButtonFull: {flex: 1, backgroundColor: '#F1ECFF'},
  detailText: {fontFamily: F.semibold, fontSize: 9.5, color: '#0B56B4'},
  pressed: {opacity: 0.82},
});
