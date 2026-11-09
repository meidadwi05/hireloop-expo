import Ionicons from '@expo/vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';
import {LinearGradient} from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import {router} from 'expo-router';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import {toAppApiError} from '../../../core/api/api-error';
import {useActionFeedback} from '../../../shared/components/ActionFeedbackProvider';
import {dashboardApi} from '../api/dashboard.api';
import {
  interviewClock,
  interviewCompany,
  interviewDestination,
  interviewPosition,
  isSafeExternalUrl,
  selectUpcomingInterviews,
} from '../dashboard.interviews';
import {dashboardKeys} from '../dashboard.keys';
import type {DashboardInterview} from '../dashboard.types';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

const C = {
  background: '#F7F9FD',
  card: '#FFFFFF',
  ink: '#111827',
  navy: '#071C4D',
  blue: '#0051FD',
  cyan: '#00DAFD',
  muted: '#667085',
  border: '#E5EAF2',
  date: '#0643AA',
  dateFooter: '#D9E8FF',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

function dateParts(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return {day: '--', month: '---'};
  return {day: String(date.getDate()).padStart(2, '0'), month: MONTHS[date.getMonth()]};
}

function longDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Tanggal belum ditentukan';
  return new Intl.DateTimeFormat('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}).format(date);
}

function relativeDay(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Jadwal';
  const today = new Date();
  const difference = Math.round((date.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86_400_000);
  if (difference === 0) return 'Hari ini';
  if (difference === 1) return 'Besok';
  return `${difference} hari lagi`;
}

function ContextTabs() {
  const tabs = [
    {label: 'Progress Lamaran', onPress: () => router.push('/(candidate)/(tabs)/career' as never)},
    {label: 'Interview Mendatang', active: true, onPress: () => undefined},
    {label: 'Pengumuman', onPress: () => router.push('/(candidate)/(tabs)/notifications' as never)},
  ];

  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {tabs.map(tab => (
        <Pressable
          key={tab.label}
          accessibilityRole="tab"
          accessibilityState={{selected: Boolean(tab.active)}}
          onPress={tab.onPress}
          style={styles.tab}
        >
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.tabText, tab.active && styles.tabTextActive]}>{tab.label}</Text>
          {tab.active ? (
            <LinearGradient
              colors={[C.blue, C.cyan]}
              end={{x: 1, y: 0}}
              start={{x: 0, y: 0}}
              style={styles.activeIndicator}
              testID="interview-active-indicator"
            />
          ) : <View style={styles.inactiveIndicator} />}
        </Pressable>
      ))}
    </View>
  );
}

function DateBlock({interview, compact}: {interview: DashboardInterview; compact: boolean}) {
  const date = dateParts(interview.date);
  return (
    <View style={[styles.dateBlock, compact && styles.dateBlockCompact]}>
      <View style={styles.dateMain}>
        <Text style={[styles.dateDay, compact && styles.dateDayCompact]}>{date.day}</Text>
        <Text style={styles.dateMonth}>{date.month}</Text>
        <Text numberOfLines={1} style={styles.dateRelative}>{relativeDay(interview.date)}</Text>
      </View>
      <View style={styles.dateTimeFooter}>
        <Text numberOfLines={2} style={styles.dateTime}>{interviewClock(interview)}</Text>
      </View>
    </View>
  );
}

function InterviewCard({compact, interview, onOpen}: {compact: boolean; interview: DashboardInterview; onOpen: () => void}) {
  const online = interview.mode === 'online';
  const detail = online
    ? interview.location_platform || interview.method || 'Online Interview'
    : interview.location || 'Lokasi menyusul';
  const stage = interview.stage_name || interview.interview_type || interview.category || interview.agenda;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${interviewPosition(interview)}, ${interviewCompany(interview)}, ${longDate(interview.date)}, ${interviewClock(interview)}, ${online ? 'online' : 'offline'}`}
      onPress={onOpen}
      style={({pressed}) => [styles.card, compact && styles.cardCompact, pressed && styles.pressed]}
    >
      <DateBlock compact={compact} interview={interview} />
      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={[styles.position, compact && styles.positionCompact]}>{interviewPosition(interview)}</Text>
        <Text numberOfLines={1} style={styles.company}>{interviewCompany(interview)}</Text>
        <View style={styles.modeRow}>
          <Ionicons name={online ? 'videocam-outline' : 'location-outline'} size={16} color={C.blue} />
          <Text numberOfLines={1} style={styles.modeText}>{detail}</Text>
        </View>
        {stage ? <View style={styles.stageBadge}><Text numberOfLines={1} style={styles.stageText}>{stage}</Text></View> : null}
      </View>
      <View style={[styles.illustrationWrap, compact && styles.illustrationWrapCompact]}>
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={require('../../../assets/interview.png')}
          style={styles.illustration}
        />
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.blue} style={styles.cardChevron} />
    </Pressable>
  );
}

function InterviewSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[0, 1, 2].map(item => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonDate} />
          <View style={styles.skeletonBody}>
            <View style={[styles.skeletonLine, {width: '75%'}]} />
            <View style={[styles.skeletonLine, {width: '55%'}]} />
            <View style={[styles.skeletonLine, {width: '65%'}]} />
          </View>
          <View style={styles.skeletonImage} />
        </View>
      ))}
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.stateCard}>
      <Image resizeMode="contain" source={require('../../../assets/interview.png')} style={styles.emptyImage} />
      <Text style={styles.stateTitle}>Belum ada interview mendatang</Text>
      <Text style={styles.stateText}>Jadwal interview aktif akan muncul di halaman ini.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push('/(candidate)/(tabs)/career' as never)} style={styles.stateButton}>
        <Text style={styles.stateButtonText}>Lihat Lamaran Saya</Text>
      </Pressable>
    </View>
  );
}

function DetailSheet({interview, onClose}: {interview: DashboardInterview | null; onClose: () => void}) {
  const insets = useSafeAreaInsets();
  const actionFeedback = useActionFeedback();
  const [opening, setOpening] = useState(false);
  if (!interview) return null;

  const destination = interviewDestination(interview);
  const canOpenDestination = isSafeExternalUrl(destination);
  const online = interview.mode === 'online';
  const rows = [
    ['Tanggal', longDate(interview.date)],
    ['Waktu', interviewClock(interview)],
    ['Metode', interview.method || (online ? 'Online' : 'Offline')],
    ['Lokasi / Platform', interview.location_platform || interview.location || (online ? 'Online Interview' : 'Lokasi menyusul')],
    ['Tahap', interview.stage_name || interview.interview_type || interview.category || interview.agenda],
    ['PIC', interview.pic_name || 'Belum ditentukan'],
  ];

  const confirmExternalOpen = () => {
    if (!destination || !canOpenDestination || opening) return;
    Alert.alert(
      online ? 'Gabung interview?' : 'Buka lokasi interview?',
      online ? 'Tautan meeting akan dibuka di aplikasi atau browser eksternal.' : 'Lokasi akan dibuka di aplikasi peta atau browser.',
      [
        {text: 'Batal', style: 'cancel'},
        {text: 'Lanjutkan', onPress: () => void (async () => {
          setOpening(true);
          await actionFeedback.runAction({
            loadingMessage: online ? 'Membuka ruang interview...' : 'Membuka lokasi interview...',
            successTitle: online ? 'Ruang Interview Dibuka' : 'Lokasi Interview Dibuka',
            successMessage: online
              ? 'Tautan interview berhasil diteruskan ke aplikasi atau browser.'
              : 'Lokasi interview berhasil diteruskan ke aplikasi peta atau browser.',
            errorTitle: 'Tautan Tidak Dapat Dibuka',
            operation: async () => {
              const supported = await Linking.canOpenURL(destination);
              if (!supported) throw new Error('Periksa kembali tautan interview atau coba dari perangkat lain.');
              await Linking.openURL(destination);
            },
            onSuccessExit: onClose,
          });
          setOpening(false);
        })()},
      ],
    );
  };

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.modalBackdrop}>
        <Pressable onPress={() => undefined} style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, 18)}]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeading}>
              <Text style={styles.sheetTitle}>{interviewPosition(interview)}</Text>
              <Text style={styles.sheetCompany}>{interviewCompany(interview)}</Text>
            </View>
            <Pressable accessibilityLabel="Tutup detail interview" hitSlop={8} onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={C.navy} />
            </Pressable>
          </View>
          <View style={styles.sheetRows}>
            {rows.map(([label, value]) => value ? (
              <View key={label} style={styles.sheetRow}>
                <Text style={styles.sheetLabel}>{label}</Text>
                <Text style={styles.sheetValue}>{value}</Text>
              </View>
            ) : null)}
          </View>
          {interview.note ? <View style={styles.noteBox}><Text style={styles.noteLabel}>Catatan</Text><Text style={styles.noteText}>{interview.note}</Text></View> : null}
          {canOpenDestination ? (
            <Pressable accessibilityRole="button" disabled={opening} onPress={confirmExternalOpen} style={[styles.primaryButton, opening && styles.disabled]}>
              {opening ? <ActivityIndicator color="white" /> : <Ionicons name={online ? 'videocam-outline' : 'map-outline'} size={19} color="white" />}
              <Text style={styles.primaryButtonText}>{online ? 'Gabung Interview' : 'Buka Maps'}</Text>
            </Pressable>
          ) : <Text style={styles.unavailableLink}>Tautan belum tersedia.</Text>}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function UpcomingInterviewsScreen() {
  const {width} = useWindowDimensions();
  const compact = Math.min(width, 720) < 360;
  const query = useQuery({queryKey: dashboardKeys.home(), queryFn: dashboardApi.get});
  const interviews = useMemo(() => selectUpcomingInterviews(query.data?.interviews ?? []), [query.data?.interviews]);
  const [selected, setSelected] = useState<DashboardInterview | null>(null);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(candidate)/(tabs)/home' as never);
  };

  const header = (
    <>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Kembali ke Dashboard" accessibilityRole="button" hitSlop={8} onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={23} color={C.navy} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Interview Mendatang</Text>
          <Text style={styles.subtitle}>{interviews.length} jadwal interview aktif</Text>
        </View>
      </View>
      <ContextTabs />
      {query.isError && query.data ? (
        <Pressable onPress={() => void query.refetch()} style={styles.warningBanner}>
          <Ionicons name="cloud-offline-outline" size={18} color="#8A5A12" />
          <Text style={styles.warningText}>Pembaruan jadwal gagal. Ketuk untuk mencoba lagi.</Text>
        </Pressable>
      ) : null}
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.page}>
        {query.isLoading ? (
          <View style={styles.loadingPage}>{header}<InterviewSkeleton /></View>
        ) : query.isError && !query.data ? (
          <View style={styles.loadingPage}>
            {header}
            <View style={styles.stateCard}>
              <Ionicons name="cloud-offline-outline" size={42} color="#98A2B3" />
              <Text style={styles.stateTitle}>Jadwal belum dapat dimuat</Text>
              <Text style={styles.stateText}>{toAppApiError(query.error).message || 'Periksa koneksi lalu coba lagi.'}</Text>
              <Pressable accessibilityRole="button" onPress={() => void query.refetch()} style={styles.stateButton}>
                <Text style={styles.stateButtonText}>Coba lagi</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={[styles.listContent, !interviews.length && styles.emptyListContent]}
            data={interviews}
            keyExtractor={item => String(item.id)}
            ListEmptyComponent={<EmptyState />}
            ListHeaderComponent={header}
            refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} colors={[C.blue]} tintColor={C.blue} />}
            renderItem={({item}) => <InterviewCard compact={compact} interview={item} onOpen={() => setSelected(item)} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <DetailSheet interview={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

const shadow = {
  shadowColor: '#17376D',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 3,
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: C.background},
  page: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: C.background},
  loadingPage: {flex: 1, paddingHorizontal: 18},
  listContent: {paddingHorizontal: 18, paddingBottom: 32, gap: 14},
  emptyListContent: {flexGrow: 1},
  header: {minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8},
  backButton: {width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  headerCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: F.bold, fontSize: 21, lineHeight: 27, color: C.navy},
  subtitle: {fontFamily: F.regular, fontSize: 11.5, lineHeight: 17, color: C.muted, marginTop: 2},
  tabs: {height: 60, flexDirection: 'row', alignItems: 'flex-end', borderRadius: 15, backgroundColor: '#F0F2F6', paddingHorizontal: 4, marginBottom: 4},
  tab: {flex: 1, minWidth: 0, height: 56, alignItems: 'center', justifyContent: 'flex-end'},
  tabText: {width: '100%', fontFamily: F.medium, fontSize: 9.5, color: '#98A2B3', textAlign: 'center', paddingHorizontal: 2, marginBottom: 10},
  tabTextActive: {fontFamily: F.semibold, color: '#164DB7'},
  activeIndicator: {width: '62%', maxWidth: 72, minWidth: 45, height: 4, borderRadius: 4},
  inactiveIndicator: {height: 4},
  warningBanner: {minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 12, backgroundColor: '#FFF6E8', paddingHorizontal: 13, marginTop: 10},
  warningText: {flex: 1, fontFamily: F.regular, fontSize: 10.5, lineHeight: 15, color: '#8A5A12'},
  card: {...shadow, minHeight: 154, flexDirection: 'row', alignItems: 'stretch', borderWidth: 1, borderColor: C.border, borderRadius: 18, backgroundColor: C.card, padding: 13, overflow: 'hidden'},
  cardCompact: {minHeight: 142, padding: 10},
  pressed: {opacity: 0.82, transform: [{scale: 0.99}]},
  dateBlock: {width: 78, minHeight: 126, borderRadius: 12, overflow: 'hidden', flexShrink: 0},
  dateBlockCompact: {width: 68, minHeight: 120},
  dateMain: {flex: 1, minHeight: 91, alignItems: 'center', justifyContent: 'center', backgroundColor: C.date, paddingHorizontal: 4, paddingVertical: 7},
  dateDay: {fontFamily: F.bold, fontSize: 30, lineHeight: 34, color: 'white'},
  dateDayCompact: {fontSize: 26, lineHeight: 30},
  dateMonth: {fontFamily: F.medium, fontSize: 14, color: 'white'},
  dateRelative: {fontFamily: F.medium, fontSize: 8.5, color: 'rgba(255,255,255,0.9)', marginTop: 5},
  dateTimeFooter: {minHeight: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: C.dateFooter, paddingHorizontal: 3, paddingVertical: 5},
  dateTime: {fontFamily: F.semibold, fontSize: 8, lineHeight: 11, color: C.navy, textAlign: 'center'},
  cardBody: {flex: 1, minWidth: 0, paddingLeft: 12, paddingRight: 3, paddingVertical: 2},
  position: {fontFamily: F.bold, fontSize: 14, lineHeight: 18, color: C.ink, paddingRight: 2},
  positionCompact: {fontSize: 12, lineHeight: 16},
  company: {fontFamily: F.regular, fontSize: 9.5, lineHeight: 14, color: C.muted, marginTop: 3},
  modeRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10},
  modeText: {flex: 1, minWidth: 0, fontFamily: F.medium, fontSize: 9, lineHeight: 13, color: '#344054'},
  stageBadge: {maxWidth: '100%', alignSelf: 'flex-start', borderRadius: 10, backgroundColor: '#EAF2FF', paddingHorizontal: 8, paddingVertical: 4, marginTop: 9},
  stageText: {fontFamily: F.semibold, fontSize: 8, color: '#1F63D8'},
  illustrationWrap: {width: 78, height: 72, alignSelf: 'center', flexShrink: 0, marginLeft: 3},
  illustrationWrapCompact: {width: 62, height: 62},
  illustration: {width: '100%', height: '100%'},
  cardChevron: {position: 'absolute', right: 9, bottom: 8},
  skeletonList: {gap: 14, paddingTop: 14},
  skeletonCard: {minHeight: 154, flexDirection: 'row', alignItems: 'center', borderRadius: 18, backgroundColor: 'white', padding: 13},
  skeletonDate: {width: 78, height: 126, borderRadius: 12, backgroundColor: '#D9E2F0'},
  skeletonBody: {flex: 1, gap: 10, paddingHorizontal: 12},
  skeletonLine: {height: 12, borderRadius: 6, backgroundColor: '#E7ECF3'},
  skeletonImage: {width: 72, height: 62, borderRadius: 14, backgroundColor: '#E7ECF3'},
  stateCard: {...shadow, flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: 'white', padding: 28, marginTop: 14, marginBottom: 18},
  emptyImage: {width: 150, height: 125},
  stateTitle: {fontFamily: F.bold, fontSize: 16, lineHeight: 22, color: C.ink, textAlign: 'center', marginTop: 14},
  stateText: {fontFamily: F.regular, fontSize: 11.5, lineHeight: 18, color: C.muted, textAlign: 'center', marginTop: 6},
  stateButton: {minWidth: 155, minHeight: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: C.blue, paddingHorizontal: 18, marginTop: 20},
  stateButtonText: {fontFamily: F.semibold, fontSize: 11, color: 'white'},
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2,18,51,0.52)'},
  sheet: {width: '100%', maxWidth: 720, alignSelf: 'center', maxHeight: '88%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 10},
  sheetHandle: {width: 44, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 14},
  sheetHeader: {flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  sheetHeading: {flex: 1, minWidth: 0},
  sheetTitle: {fontFamily: F.bold, fontSize: 18, lineHeight: 24, color: C.navy},
  sheetCompany: {fontFamily: F.regular, fontSize: 11, lineHeight: 16, color: C.muted, marginTop: 3},
  closeButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#F2F5F9'},
  sheetRows: {marginTop: 18, borderTopWidth: 1, borderTopColor: C.border},
  sheetRow: {minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 9},
  sheetLabel: {width: 112, fontFamily: F.medium, fontSize: 10.5, color: C.muted},
  sheetValue: {flex: 1, fontFamily: F.semibold, fontSize: 11, lineHeight: 16, color: C.ink, textAlign: 'right'},
  noteBox: {borderRadius: 12, backgroundColor: '#F4F7FB', padding: 13, marginTop: 14},
  noteLabel: {fontFamily: F.semibold, fontSize: 10.5, color: C.navy},
  noteText: {fontFamily: F.regular, fontSize: 10.5, lineHeight: 17, color: '#475467', marginTop: 4},
  primaryButton: {minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, backgroundColor: C.blue, marginTop: 18},
  primaryButtonText: {fontFamily: F.bold, fontSize: 12, color: 'white'},
  disabled: {opacity: 0.6},
  unavailableLink: {fontFamily: F.medium, fontSize: 10.5, color: C.muted, textAlign: 'center', marginTop: 18},
});
