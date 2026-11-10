import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  interviewClock,
  interviewCompany,
  interviewDestination,
  interviewPosition,
  isSafeExternalUrl,
} from '../dashboard.interviews';
import {openInterviewDestination} from '../interview-linking';
import type {DashboardInterview} from '../dashboard.types';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

function longDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Tanggal belum ditentukan';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function InterviewDetailModal({
  interview,
  onClose,
}: {
  interview: DashboardInterview | null;
  onClose: () => void;
}) {
  const [opening, setOpening] = useState(false);
  if (!interview) return null;

  const online = interview.mode === 'online';
  const destination = interviewDestination(interview);
  const canOpenDestination = isSafeExternalUrl(destination);
  const stage = interview.stage_name || interview.interview_type || interview.category || interview.agenda;
  const platform = interview.location_platform || interview.method || (online ? 'Online Interview' : interview.location || 'Lokasi menyusul');
  const offlineAddress = interview.location || 'Alamat interview belum tersedia';
  const sessionTitle = interview.interview_type || interview.stage_name || interview.agenda || 'Sesi Interview';
  const rows = [
    {icon: 'time-outline' as const, label: 'Waktu', value: interviewClock(interview)},
    {icon: online ? 'videocam-outline' as const : 'location-outline' as const, label: online ? 'Platform' : 'Lokasi', value: platform},
    {icon: 'person-outline' as const, label: 'PIC', value: interview.pic_name || 'Belum ditentukan'},
  ];

  const join = async () => {
    if (opening) return;
    setOpening(true);
    try {
      await openInterviewDestination(interview);
      onClose();
    } catch (error) {
      Alert.alert('Tautan Tidak Dapat Dibuka', error instanceof Error ? error.message : 'Coba lagi beberapa saat lagi.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible>
      <Pressable accessibilityRole="button" accessibilityLabel="Tutup detail interview" onPress={onClose} style={styles.backdrop}>
        <Pressable
          accessibilityViewIsModal
          onPress={event => event.stopPropagation()}
          style={styles.card}
          testID="interview-detail-modal"
        >
          <View style={styles.header}>
            <View style={[styles.calendarIcon, !online && styles.locationHeaderIcon]}>
              <Ionicons name={online ? 'calendar-outline' : 'location-outline'} size={23} color={online ? '#1268FF' : '#7B2FF7'} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>{online ? 'Jadwal Interview' : 'Detail Lokasi Interview'}</Text>
              <Text style={styles.headerDate}>{longDate(interview.date)}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Tutup detail interview" hitSlop={8} onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={23} color="#7A8496" />
            </Pressable>
          </View>

          {online ? (
            <>
              <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.summary}>
                  <View style={styles.summaryTopline}>
                    <View style={styles.companyBadge}>
                      <Text numberOfLines={1} style={styles.companyBadgeText}>{interviewCompany(interview)}</Text>
                    </View>
                    <Text numberOfLines={2} style={styles.position}>{interviewPosition(interview)}</Text>
                  </View>
                  {stage ? <Text style={styles.stage}>{stage}</Text> : null}
                  <Text style={styles.agenda}>{interview.agenda || 'Jadwal interview kandidat'}</Text>
                </View>

                <View style={styles.detailCard}>
                  {rows.map(row => (
                    <View key={row.label} style={styles.detailRow}>
                      <View style={styles.rowIcon}><Ionicons name={row.icon} size={18} color="#1268FF" /></View>
                      <View style={styles.rowCopy}>
                        <Text style={styles.rowLabel}>{row.label}</Text>
                        <Text style={styles.rowValue}>{row.value}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={styles.linkState}>
                    <Ionicons name={canOpenDestination ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={18} color={canOpenDestination ? '#0A9B63' : '#98A2B3'} />
                    <Text style={[styles.linkStateText, canOpenDestination && styles.linkStateReady]}>{canOpenDestination ? 'Tautan Zoom tersedia' : 'Tautan belum tersedia'}</Text>
                  </View>
                </View>

                {interview.note ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>Catatan</Text>
                    <Text style={styles.noteText}>{interview.note}</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.footer}>
                {canOpenDestination ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Gabung interview ${interviewPosition(interview)}`}
                    disabled={opening}
                    onPress={() => void join()}
                    style={[styles.primaryButton, opening && styles.disabled]}
                  >
                    {opening ? <ActivityIndicator color="white" /> : <Ionicons name="open-outline" size={19} color="white" />}
                    <Text style={styles.primaryButtonText}>Buka Link Interview</Text>
                  </Pressable>
                ) : <Text style={styles.unavailable}>Tautan interview belum tersedia.</Text>}
              </View>
            </>
          ) : (
            <ScrollView contentContainerStyle={styles.offlineContent} showsVerticalScrollIndicator={false}>
              <View style={styles.offlineCard}>
                <View style={styles.offlineTitleRow}>
                  <View style={styles.offlineSessionCopy}>
                    <Ionicons name="business-outline" size={21} color="#1268FF" />
                    <Text numberOfLines={2} style={styles.offlineSessionTitle}>{sessionTitle}</Text>
                  </View>
                  <View style={styles.scheduleBadge}><Text style={styles.scheduleBadgeText}>Jadwal Anda</Text></View>
                </View>
                <View style={styles.offlineTimeRow}>
                  <Ionicons name="time-outline" size={18} color="#98A2B3" />
                  <Text style={styles.offlineTime}>{interviewClock(interview)}</Text>
                </View>
                <View style={styles.offlineDivider} />
                <Text style={styles.offlineLabel}>PIC</Text>
                <Text style={styles.offlineValue}>{interview.pic_name || 'Belum ditentukan'}</Text>
                <Text style={[styles.offlineLabel, styles.offlineAddressLabel]}>ALAMAT INTERVIEW</Text>
                <Text style={styles.offlineAddress}>{offlineAddress}</Text>
                {interview.note ? (
                  <View style={styles.offlineNote}>
                    <Text style={styles.offlineLabel}>CATATAN</Text>
                    <Text style={styles.offlineAddress}>{interview.note}</Text>
                  </View>
                ) : null}
                {canOpenDestination ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Buka lokasi interview ${interviewPosition(interview)}`}
                    disabled={opening}
                    onPress={() => void join()}
                    style={[styles.mapsButton, opening && styles.disabled]}
                  >
                    {opening ? <ActivityIndicator color="white" /> : <Ionicons name="location-outline" size={19} color="white" />}
                    <Text style={styles.mapsButtonText}>Buka Maps</Text>
                  </Pressable>
                ) : <Text style={styles.mapsUnavailable}>Tautan Maps belum tersedia.</Text>}
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,18,51,0.62)', paddingHorizontal: 16, paddingVertical: 16},
  card: {width: '100%', maxWidth: 420, maxHeight: '85%', borderRadius: 24, backgroundColor: '#FFFFFF', overflow: 'hidden'},
  header: {minHeight: 86, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#E9EDF3', paddingHorizontal: 18, paddingVertical: 14},
  calendarIcon: {width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF5FF', flexShrink: 0},
  locationHeaderIcon: {backgroundColor: '#F4EEFF'},
  headerCopy: {flex: 1, minWidth: 0},
  headerTitle: {fontFamily: F.bold, fontSize: 18, lineHeight: 24, color: '#111827'},
  headerDate: {fontFamily: F.regular, fontSize: 11, lineHeight: 16, color: '#667085', marginTop: 2},
  closeButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  content: {padding: 16},
  summary: {borderRadius: 16, backgroundColor: '#EAF3FF', padding: 15},
  summaryTopline: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  companyBadge: {maxWidth: '42%', minHeight: 24, flexShrink: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#1268FF', paddingHorizontal: 10, paddingVertical: 3},
  companyBadgeText: {maxWidth: '100%', fontFamily: F.semibold, fontSize: 10, lineHeight: 14, color: 'white', textAlign: 'center'},
  position: {flex: 1, minWidth: 0, fontFamily: F.semibold, fontSize: 13, lineHeight: 18, color: '#102450', paddingTop: 3},
  stage: {fontFamily: F.bold, fontSize: 16, lineHeight: 22, color: '#111827', marginTop: 12},
  agenda: {fontFamily: F.regular, fontSize: 11, lineHeight: 17, color: '#667085', marginTop: 4},
  detailCard: {borderWidth: 1, borderColor: '#DCE6F4', borderRadius: 16, paddingHorizontal: 14, marginTop: 14},
  detailRow: {minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: '#EDF1F6', paddingVertical: 9},
  rowIcon: {width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F6FF'},
  rowCopy: {flex: 1, minWidth: 0},
  rowLabel: {fontFamily: F.medium, fontSize: 9.5, color: '#98A2B3'},
  rowValue: {fontFamily: F.semibold, fontSize: 11.5, lineHeight: 17, color: '#111827', marginTop: 2},
  linkState: {minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8},
  linkStateText: {flex: 1, fontFamily: F.medium, fontSize: 10.5, color: '#98A2B3'},
  linkStateReady: {color: '#0A7D53'},
  noteBox: {borderRadius: 14, backgroundColor: '#F5F7FA', padding: 13, marginTop: 14},
  noteLabel: {fontFamily: F.semibold, fontSize: 10.5, color: '#102450'},
  noteText: {fontFamily: F.regular, fontSize: 10.5, lineHeight: 17, color: '#475467', marginTop: 4},
  footer: {borderTopWidth: 1, borderTopColor: '#E9EDF3', padding: 16},
  primaryButton: {minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, backgroundColor: '#1268FF', paddingHorizontal: 16},
  primaryButtonText: {fontFamily: F.bold, fontSize: 12, color: 'white'},
  disabled: {opacity: 0.6},
  unavailable: {fontFamily: F.medium, fontSize: 10.5, lineHeight: 16, color: '#667085', textAlign: 'center'},
  offlineContent: {padding: 16},
  offlineCard: {borderWidth: 1, borderColor: '#E2E6EF', borderRadius: 18, backgroundColor: '#FFFFFF', padding: 18},
  offlineTitleRow: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10},
  offlineSessionCopy: {flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9},
  offlineSessionTitle: {flex: 1, minWidth: 0, fontFamily: F.bold, fontSize: 15, lineHeight: 21, color: '#111827'},
  scheduleBadge: {flexShrink: 0, borderRadius: 999, backgroundColor: '#F4EEFF', paddingHorizontal: 12, paddingVertical: 6},
  scheduleBadgeText: {fontFamily: F.semibold, fontSize: 10.5, color: '#7C2FD0'},
  offlineTimeRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9},
  offlineTime: {fontFamily: F.medium, fontSize: 13, lineHeight: 18, color: '#202737'},
  offlineDivider: {height: 1, backgroundColor: '#E9EDF3', marginVertical: 16},
  offlineLabel: {fontFamily: F.semibold, fontSize: 10.5, lineHeight: 15, color: '#98A2B3'},
  offlineValue: {fontFamily: F.semibold, fontSize: 13, lineHeight: 19, color: '#111827', marginTop: 3},
  offlineAddressLabel: {marginTop: 15},
  offlineAddress: {fontFamily: F.medium, fontSize: 12, lineHeight: 18, color: '#303747', marginTop: 3},
  offlineNote: {borderRadius: 12, backgroundColor: '#F7F8FB', padding: 12, marginTop: 15},
  mapsButton: {minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, backgroundColor: '#7B2FF7', paddingHorizontal: 16, marginTop: 22},
  mapsButtonText: {fontFamily: F.bold, fontSize: 12, color: '#FFFFFF'},
  mapsUnavailable: {fontFamily: F.medium, fontSize: 10.5, lineHeight: 16, color: '#667085', textAlign: 'center', marginTop: 20},
});
