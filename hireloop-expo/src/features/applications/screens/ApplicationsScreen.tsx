import Ionicons from '@expo/vector-icons/Ionicons';
import {useQueries} from '@tanstack/react-query';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {toAppApiError} from '../../../core/api/api-error';
import {jobsApi} from '../../jobs/api/jobs.api';
import {jobsKeys} from '../../jobs/jobs.keys';
import {useSavedJobs} from '../../jobs/saved-jobs-provider';
import type {CandidateJobDetail} from '../../jobs/jobs.types';
import {useApplications} from '../hooks/use-applications';
import type {ApplicationCardModel, ApplicationUiState, CandidateApplication} from '../applications.types';
import {ApplicationCard} from '../components/ApplicationCard';
import {APPLICATION_COLORS, APPLICATION_FONTS} from '../components/applications.ui';

type ActiveTab = 'all' | 'saved' | 'canceled';
type StatusFilter = 'all' | ApplicationUiState;
type SortOrder = 'newest' | 'oldest';
const EMPTY_APPLICATIONS: CandidateApplication[] = [];

function fallbackJob(application: CandidateApplication): CandidateJobDetail {
  return {
    id: application.referenceId,
    key: `${application.source}:${application.referenceId}`,
    source: application.source,
    title: application.title,
    company: application.company,
    location: application.location,
    contractType: 'Tipe kerja belum tersedia',
    workMode: 'Sistem kerja belum tersedia',
    salaryLabel: 'Gaji tidak disebutkan',
    urgent: false,
    active: application.state !== 'closed',
    skills: [],
    applicantsCount: 0,
    closingDate: null,
    publishedAt: null,
    updatedAt: application.updatedAt,
    closingLabel: 'Batas akhir tidak ditentukan',
    publishedLabel: '',
    updatedLabel: '',
    workType: 'Sistem kerja belum tersedia',
    salary: 'Gaji tidak disebutkan',
    description: '',
    requirements: [],
    benefits: [],
    education: 'Tidak ditentukan',
    experience: 'Tidak ditentukan',
  };
}

function savedJobDetail(job: ReturnType<typeof useSavedJobs>['savedJobs'][number]): CandidateJobDetail {
  return {
    ...job,
    description: '',
    requirements: [],
    benefits: [],
    education: 'Tidak ditentukan',
    experience: 'Tidak ditentukan',
  };
}

function ChoiceModal({
  title,
  visible,
  options,
  value,
  onClose,
  onChange,
}: {
  title: string;
  visible: boolean;
  options: {value: string; label: string}[];
  value: string;
  onClose: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable accessibilityViewIsModal style={styles.modalCard} onPress={event => event.stopPropagation()}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map(option => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{selected}}
                onPress={() => {
                  onChange(option.value);
                  onClose();
                }}
                style={styles.optionRow}
              >
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option.label}</Text>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const applicationsQuery = useApplications();
  const {savedJobs} = useSavedJobs();
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const pagePadding = width <= 350 ? 14 : 18;
  const containerWidth = Math.min(width, 720);
  const applications = applicationsQuery.data ?? EMPTY_APPLICATIONS;

  const jobQueries = useQueries({
    queries: applications.map(application => ({
      queryKey: jobsKeys.detail(application.source, application.referenceId),
      queryFn: () => jobsApi.detail(application.source, application.referenceId),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  });

  const appliedModels = useMemo<ApplicationCardModel[]>(() => applications.map((application, index) => ({
    key: `${application.source}:${application.referenceId}:application`,
    application,
    job: jobQueries[index]?.data ?? fallbackJob(application),
    savedOnly: false,
  })), [applications, jobQueries]);

  const savedModels = useMemo<ApplicationCardModel[]>(() => savedJobs.map(job => {
    const application = applications.find(item => item.source === job.source && item.referenceId === job.id) ?? null;
    return {
      key: `${job.key}:saved`,
      application,
      job: savedJobDetail(job),
      savedOnly: !application,
    };
  }), [applications, savedJobs]);

  const counts = useMemo(() => ({
    all: applications.length,
    saved: savedJobs.length,
    canceled: applications.filter(application => application.state === 'canceled').length,
  }), [applications, savedJobs.length]);

  const visibleModels = useMemo(() => {
    const base = activeTab === 'saved'
      ? savedModels
      : activeTab === 'canceled'
        ? appliedModels.filter(model => model.application?.state === 'canceled')
        : appliedModels;
    const keyword = search.trim().toLowerCase();

    return base
      .filter(model => filter === 'all' || model.application?.state === filter)
      .filter(model => !keyword || [model.job.title, model.job.company, model.job.location]
        .some(value => value.toLowerCase().includes(keyword)))
      .sort((left, right) => {
        const leftDate = Date.parse(left.application?.updatedAt ?? left.application?.submittedAt ?? left.job.updatedAt ?? left.job.publishedAt ?? '') || 0;
        const rightDate = Date.parse(right.application?.updatedAt ?? right.application?.submittedAt ?? right.job.updatedAt ?? right.job.publishedAt ?? '') || 0;
        return sort === 'newest' ? rightDate - leftDate : leftDate - rightDate;
      });
  }, [activeTab, appliedModels, filter, savedModels, search, sort]);
  const error = applicationsQuery.isError ? toAppApiError(applicationsQuery.error).message : null;

  const header = (
    <>
      <BrandedHeaderBackground
        containerWidth={containerWidth}
        topInset={insets.top}
        variant="application-list"
        style={[styles.hero, {paddingTop: insets.top + 8}]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Beranda"
          onPress={() => router.replace('/(candidate)/(tabs)/home')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="white" />
        </Pressable>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Lamaran Saya</Text>
          <Text style={styles.heroSubtitle}>Pantau perkembangan lamaranmu</Text>
        </View>
      </BrandedHeaderBackground>

      <View style={[styles.controlsSheet, {paddingHorizontal: pagePadding}]}>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {([
            {value: 'all' as const, label: 'Semua', count: counts.all},
            {value: 'saved' as const, label: 'Disimpan', count: counts.saved},
            {value: 'canceled' as const, label: 'Dibatalkan', count: counts.canceled},
          ]).map(tab => {
            const selected = activeTab === tab.value;
            return (
              <Pressable
                key={tab.value}
                accessibilityRole="tab"
                accessibilityState={{selected}}
                onPress={() => setActiveTab(tab.value)}
                style={[styles.tab, selected && styles.tabActive]}
              >
                <Text numberOfLines={1} style={[styles.tabText, selected && styles.tabTextActive]}>{tab.label} ({tab.count})</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={22} color={APPLICATION_COLORS.body} />
          <TextInput
            accessibilityLabel="Cari lowongan atau perusahaan"
            value={search}
            onChangeText={setSearch}
            placeholder="Cari lowongan atau perusahaan..."
            placeholderTextColor="#8794A8"
            returnKeyType="search"
            style={styles.searchInput}
          />
          {!!search && (
            <Pressable accessibilityRole="button" accessibilityLabel="Hapus pencarian" onPress={() => setSearch('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={19} color="#98A5B8" />
            </Pressable>
          )}
        </View>

        <View style={styles.toolbar}>
          <Pressable accessibilityRole="button" onPress={() => setFilterOpen(true)} style={styles.toolButton}>
            <Ionicons name="options-outline" size={20} color={APPLICATION_COLORS.navy} />
            <Text numberOfLines={1} style={styles.toolText}>{filter === 'all' ? 'Filter Status' : filter.replace('-', ' ')}</Text>
            <Ionicons name="chevron-down" size={17} color={APPLICATION_COLORS.navy} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setSortOpen(true)} style={styles.toolButton}>
            <Ionicons name="calendar-outline" size={19} color={APPLICATION_COLORS.navy} />
            <Text numberOfLines={1} style={styles.toolText}>{sort === 'newest' ? 'Terbaru' : 'Terlama'}</Text>
            <Ionicons name="chevron-down" size={17} color={APPLICATION_COLORS.navy} />
          </Pressable>
        </View>
        {!!error && applications.length > 0 && (
          <View style={styles.staleBanner}>
            <Ionicons name="cloud-offline-outline" size={18} color="#A96C00" />
            <Text style={styles.staleBannerText}>Menampilkan data terakhir. Tarik ke bawah untuk mencoba memuat ulang.</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.viewport}>
      <StatusBar style="light" />
      <FlatList
        data={visibleModels}
        keyExtractor={item => item.key}
        renderItem={({item}) => (
          <View style={{paddingHorizontal: pagePadding}}>
            <ApplicationCard
              model={item}
              onOpen={() => {
                if (item.savedOnly) {
                  router.push({pathname: '/(candidate)/jobs/[source]/[id]', params: {source: item.job.source, id: String(item.job.id)}} as never);
                  return;
                }
                router.push({pathname: '/(candidate)/applications/[source]/[id]', params: {source: item.job.source, id: String(item.job.id)}} as never);
              }}
            />
          </View>
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={applicationsQuery.isPending
          ? <View style={styles.empty}><ActivityIndicator size="large" color={APPLICATION_COLORS.blue} /><Text style={styles.emptyText}>Memuat lamaran...</Text></View>
          : <View style={styles.empty}>
              <Ionicons name={error ? 'cloud-offline-outline' : 'document-text-outline'} size={48} color="#98A8BE" />
              <Text style={styles.emptyTitle}>{error ? 'Lamaran belum dapat dimuat' : 'Tidak ada lamaran yang sesuai'}</Text>
              <Text style={styles.emptyText}>{error ?? 'Coba ubah pencarian atau filter yang digunakan.'}</Text>
              <Pressable accessibilityRole="button" onPress={() => {
                setSearch('');
                setFilter('all');
                if (error) void applicationsQuery.refetch();
              }} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>{error ? 'Coba lagi' : 'Reset Filter'}</Text>
              </Pressable>
            </View>}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[styles.content, {paddingBottom: Math.max(insets.bottom, 14) + 18}]}
        keyboardShouldPersistTaps="handled"
        onRefresh={() => void applicationsQuery.refetch()}
        refreshing={applicationsQuery.isRefetching}
        showsVerticalScrollIndicator={false}
      />

      <ChoiceModal
        title="Filter Status"
        visible={filterOpen}
        value={filter}
        onClose={() => setFilterOpen(false)}
        onChange={value => setFilter(value as StatusFilter)}
        options={[
          {value: 'all', label: 'Semua Status'},
          {value: 'applied', label: 'Applied'},
          {value: 'in-progress', label: 'In Progress'},
          {value: 'hired', label: 'Hired'},
          {value: 'rejected', label: 'Rejected'},
          {value: 'canceled', label: 'Canceled'},
          {value: 'closed', label: 'Closed'},
        ]}
      />
      <ChoiceModal
        title="Urutkan Lamaran"
        visible={sortOpen}
        value={sort}
        onClose={() => setSortOpen(false)}
        onChange={value => setSort(value as SortOrder)}
        options={[{value: 'newest', label: 'Terbaru'}, {value: 'oldest', label: 'Terlama'}]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: APPLICATION_COLORS.background},
  content: {backgroundColor: APPLICATION_COLORS.background},
  hero: {paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center'},
  backButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 4},
  heroCopy: {flex: 1, minWidth: 0},
  heroTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 24, lineHeight: 31, color: 'white'},
  heroSubtitle: {fontFamily: APPLICATION_FONTS.regular, fontSize: 13, lineHeight: 19, color: '#DDEAFF', marginTop: 2},
  controlsSheet: {marginTop: -18, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: 'white', paddingTop: 17, paddingBottom: 18},
  tabs: {height: 53, flexDirection: 'row', gap: 7, borderRadius: 17, backgroundColor: '#F4F7FB', padding: 3},
  tab: {flex: 1, minWidth: 0, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3},
  tabActive: {backgroundColor: APPLICATION_COLORS.blue},
  tabText: {fontFamily: APPLICATION_FONTS.semibold, fontSize: 10.5, color: APPLICATION_COLORS.navy},
  tabTextActive: {color: 'white'},
  searchBox: {height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', paddingHorizontal: 14, marginTop: 14},
  searchInput: {flex: 1, minWidth: 0, height: '100%', fontFamily: APPLICATION_FONTS.regular, fontSize: 11.5, color: APPLICATION_COLORS.navy},
  clearButton: {width: 30, height: 40, alignItems: 'center', justifyContent: 'center'},
  toolbar: {flexDirection: 'row', gap: 10, marginTop: 12},
  toolButton: {flex: 1, minWidth: 0, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 11, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', paddingHorizontal: 9},
  toolText: {flex: 1, minWidth: 0, fontFamily: APPLICATION_FONTS.semibold, fontSize: 10.5, textTransform: 'capitalize', color: APPLICATION_COLORS.navy},
  staleBanner: {minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: '#FFF7DF', paddingHorizontal: 11, marginTop: 12},
  staleBannerText: {flex: 1, fontFamily: APPLICATION_FONTS.medium, fontSize: 9.5, lineHeight: 15, color: '#7D570F'},
  separator: {height: 15},
  empty: {minHeight: 290, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, marginHorizontal: 18, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: APPLICATION_COLORS.border},
  emptyTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 15, color: APPLICATION_COLORS.navy, textAlign: 'center', marginTop: 12},
  emptyText: {fontFamily: APPLICATION_FONTS.regular, fontSize: 11, lineHeight: 18, color: APPLICATION_COLORS.body, textAlign: 'center', marginTop: 7},
  emptyButton: {height: 42, borderRadius: 10, backgroundColor: APPLICATION_COLORS.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: 16},
  emptyButtonText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 11, color: 'white'},
  modalOverlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 18, 58, 0.56)'},
  modalCard: {width: '100%', maxWidth: 720, alignSelf: 'center', borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30},
  modalHandle: {width: 42, height: 4, borderRadius: 2, backgroundColor: '#D8DFE9', alignSelf: 'center'},
  modalTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 17, color: APPLICATION_COLORS.navy, marginVertical: 16},
  optionRow: {minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EEF1F5'},
  optionLabel: {fontFamily: APPLICATION_FONTS.medium, fontSize: 12, color: APPLICATION_COLORS.body},
  optionLabelSelected: {fontFamily: APPLICATION_FONTS.bold, color: APPLICATION_COLORS.blue},
  radio: {width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#C6CFDC', alignItems: 'center', justifyContent: 'center'},
  radioSelected: {borderColor: APPLICATION_COLORS.blue},
  radioDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: APPLICATION_COLORS.blue},
});
