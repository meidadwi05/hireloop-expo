import Ionicons from '@expo/vector-icons/Ionicons';
import {useQuery} from '@tanstack/react-query';
import {router} from 'expo-router';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {toAppApiError} from '../../../core/api/api-error';
import {ShimmerBlock, ShimmerGroup} from '../../../shared/components/shimmer';
import {dashboardApi} from '../api/dashboard.api';
import {InterviewCalendarCard} from '../components/interview-calendar/InterviewCalendarCard';
import {interviewsForDate} from '../components/interview-calendar/interview-calendar.utils';
import {InterviewDetailModal} from '../components/InterviewDetailModal';
import {InterviewScheduleCard} from '../components/InterviewScheduleCard';
import {selectUpcomingInterviews} from '../dashboard.interviews';
import {dashboardKeys} from '../dashboard.keys';
import {openInterviewDestination} from '../interview-linking';
import type {DashboardInterview} from '../dashboard.types';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

const C = {
  background: '#F3F7FD',
  ink: '#111827',
  navy: '#071C4D',
  blue: '#0051FD',
  muted: '#667085',
};

function PageHeader({count, onBack}: {count: number; onBack: () => void}) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="Kembali ke Dashboard" accessibilityRole="button" hitSlop={8} onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={23} color={C.navy} />
      </Pressable>
      <View style={styles.headerCopy}>
        <Text numberOfLines={1} style={styles.title}>Interview Mendatang</Text>
        <Text style={styles.subtitle}>{count} jadwal interview aktif</Text>
      </View>
    </View>
  );
}

function CalendarSkeleton() {
  return (
    <ShimmerGroup>
      <View accessibilityLabel="Memuat kalender interview" accessibilityRole="progressbar" style={styles.calendarSkeleton} testID="interview-calendar-skeleton">
        <View style={styles.calendarSkeletonHeader}>
          <ShimmerBlock height={20} width={94} />
          <View style={styles.calendarSkeletonFilters}>
            <ShimmerBlock height={44} width={132} />
            <ShimmerBlock height={44} width={84} />
          </View>
        </View>
        <ShimmerBlock height={246} width="100%" />
      </View>
    </ShimmerGroup>
  );
}

function InterviewSkeleton() {
  return (
    <ShimmerGroup>
      <View accessible accessibilityLabel="Memuat jadwal interview" accessibilityRole="progressbar" style={styles.skeletonList} testID="interviews-list-skeleton">
        {[0, 1, 2].map(item => (
          <View key={item} style={styles.skeletonCard}>
            <ShimmerBlock borderRadius={12} height={152} width={78} />
            <View style={styles.skeletonBody}>
              <ShimmerBlock height={15} width="75%" />
              <ShimmerBlock height={10} width="55%" />
              <ShimmerBlock height={11} width="65%" />
              <View style={styles.skeletonButtons}>
                <ShimmerBlock height={44} width="58%" />
                <ShimmerBlock height={44} width="36%" />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ShimmerGroup>
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

function FilteredEmptyState({onClear}: {onClear: () => void}) {
  return (
    <View style={styles.filteredEmpty}>
      <Ionicons name="calendar-outline" size={36} color="#98A2B3" />
      <Text style={styles.stateTitle}>Tidak ada interview pada tanggal ini</Text>
      <Text style={styles.stateText}>Pilih tanggal lain atau tampilkan kembali seluruh jadwal.</Text>
      <Pressable accessibilityRole="button" onPress={onClear} style={styles.stateButton}>
        <Text style={styles.stateButtonText}>Tampilkan semua</Text>
      </Pressable>
    </View>
  );
}

function selectedDateSummary(value: string, count: number) {
  const date = new Date(`${value}T00:00:00`);
  const label = Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
  return `${count} interview pada ${label}`;
}

export function UpcomingInterviewsScreen() {
  const {width} = useWindowDimensions();
  const compact = Math.min(width, 720) < 380;
  const today = useMemo(() => new Date(), []);
  const query = useQuery({queryKey: dashboardKeys.home(), queryFn: dashboardApi.get});
  const interviews = useMemo(() => selectUpcomingInterviews(query.data?.interviews ?? []), [query.data?.interviews]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth());
  const [visibleYear, setVisibleYear] = useState(today.getFullYear());
  const [openDropdown, setOpenDropdown] = useState<'month' | 'year' | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<DashboardInterview | null>(null);
  const visibleInterviews = useMemo(() => interviewsForDate(interviews, selectedDate), [interviews, selectedDate]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(candidate)/(tabs)/home' as never);
  };

  const joinInterview = async (interview: DashboardInterview) => {
    try {
      await openInterviewDestination(interview);
    } catch (error) {
      Alert.alert('Tautan Tidak Dapat Dibuka', error instanceof Error ? error.message : 'Coba lagi beberapa saat lagi.');
    }
  };

  const calendar = (
    <InterviewCalendarCard
      compact={compact}
      interviews={interviews}
      onChangeMonth={setVisibleMonth}
      onChangeOpenDropdown={setOpenDropdown}
      onChangeYear={setVisibleYear}
      onSelectDate={setSelectedDate}
      openDropdown={openDropdown}
      selectedDate={selectedDate}
      today={today}
      visibleMonth={visibleMonth}
      visibleYear={visibleYear}
    />
  );

  const header = (
    <>
      <PageHeader count={interviews.length} onBack={goBack} />
      {calendar}
      {query.isError && query.data ? (
        <Pressable onPress={() => void query.refetch()} style={styles.warningBanner}>
          <Ionicons name="cloud-offline-outline" size={18} color="#8A5A12" />
          <Text style={styles.warningText}>Pembaruan jadwal gagal. Ketuk untuk mencoba lagi.</Text>
        </Pressable>
      ) : null}
      {interviews.length ? (
        <View style={styles.resultHeader}>
          <Text style={styles.resultText}>{selectedDate ? selectedDateSummary(selectedDate, visibleInterviews.length) : `${interviews.length} interview mendatang`}</Text>
          {selectedDate ? (
            <Pressable accessibilityRole="button" onPress={() => setSelectedDate(null)} style={styles.clearButton}>
              <Text style={styles.clearText}>Tampilkan semua</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.page}>
        {query.isLoading ? (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={[]}
            ListHeaderComponent={<><PageHeader count={0} onBack={goBack} /><CalendarSkeleton /><InterviewSkeleton /></>}
            renderItem={null}
            showsVerticalScrollIndicator={false}
          />
        ) : query.isError && !query.data ? (
          <FlatList
            contentContainerStyle={[styles.listContent, styles.emptyListContent]}
            data={[]}
            ListHeaderComponent={<PageHeader count={0} onBack={goBack} />}
            ListEmptyComponent={(
              <View style={styles.stateCard}>
                <Ionicons name="cloud-offline-outline" size={42} color="#98A2B3" />
                <Text style={styles.stateTitle}>Jadwal belum dapat dimuat</Text>
                <Text style={styles.stateText}>{toAppApiError(query.error).message || 'Periksa koneksi lalu coba lagi.'}</Text>
                <Pressable accessibilityRole="button" onPress={() => void query.refetch()} style={styles.stateButton}>
                  <Text style={styles.stateButtonText}>Coba lagi</Text>
                </Pressable>
              </View>
            )}
            renderItem={null}
          />
        ) : (
          <FlatList
            contentContainerStyle={[styles.listContent, !visibleInterviews.length && styles.emptyListContent]}
            data={visibleInterviews}
            extraData={selectedDate}
            keyExtractor={item => String(item.id)}
            ListEmptyComponent={selectedDate ? <FilteredEmptyState onClear={() => setSelectedDate(null)} /> : <EmptyState />}
            ListHeaderComponent={header}
            refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} colors={[C.blue]} tintColor={C.blue} />}
            renderItem={({item}) => (
              <InterviewScheduleCard
                compact={compact}
                interview={item}
                onDetail={() => setSelectedInterview(item)}
                onJoin={() => void joinInterview(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <InterviewDetailModal interview={selectedInterview} onClose={() => setSelectedInterview(null)} />
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
  listContent: {paddingHorizontal: 18, paddingBottom: 32, gap: 14},
  emptyListContent: {flexGrow: 1},
  header: {minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12},
  backButton: {width: 44, height: 44, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 14},
  headerCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: F.bold, fontSize: 21, lineHeight: 27, color: C.navy},
  subtitle: {fontFamily: F.regular, fontSize: 11.5, lineHeight: 17, color: C.muted, marginTop: 2},
  warningBanner: {minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 12, backgroundColor: '#FFF6E8', paddingHorizontal: 13},
  warningText: {flex: 1, fontFamily: F.regular, fontSize: 10.5, lineHeight: 15, color: '#8A5A12'},
  resultHeader: {minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8},
  resultText: {flex: 1, fontFamily: F.semibold, fontSize: 11, lineHeight: 16, color: C.navy},
  clearButton: {minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7},
  clearText: {fontFamily: F.semibold, fontSize: 9.5, color: '#075DB8'},
  calendarSkeleton: {...shadow, minHeight: 344, borderRadius: 20, backgroundColor: '#FFFFFF', padding: 16},
  calendarSkeletonHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14},
  calendarSkeletonFilters: {flexDirection: 'row', gap: 8},
  skeletonList: {gap: 14},
  skeletonCard: {minHeight: 174, flexDirection: 'row', borderRadius: 18, backgroundColor: '#FFFFFF', padding: 11},
  skeletonBody: {flex: 1, gap: 9, paddingLeft: 12, paddingVertical: 3},
  skeletonButtons: {flexDirection: 'row', justifyContent: 'space-between', gap: 7, marginTop: 'auto'},
  stateCard: {...shadow, flex: 1, minHeight: 300, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#FFFFFF', padding: 28, marginBottom: 18},
  filteredEmpty: {...shadow, minHeight: 220, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#FFFFFF', padding: 24, marginBottom: 18},
  emptyImage: {width: 145, height: 118},
  stateTitle: {fontFamily: F.bold, fontSize: 16, lineHeight: 22, color: C.ink, textAlign: 'center', marginTop: 13},
  stateText: {fontFamily: F.regular, fontSize: 11.5, lineHeight: 18, color: C.muted, textAlign: 'center', marginTop: 6},
  stateButton: {minWidth: 155, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: C.blue, paddingHorizontal: 18, marginTop: 18},
  stateButtonText: {fontFamily: F.semibold, fontSize: 11, color: '#FFFFFF'},
});
