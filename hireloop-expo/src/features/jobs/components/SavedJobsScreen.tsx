import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, Share, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {useCandidateApplyAccess} from '../../auth/hooks/use-candidate-apply-access';
import {getJobsIconLayout} from '../jobs-header.layout';
import {filterAndSortSavedJobs, type SavedJobsSort} from '../saved-jobs.filters';
import {useSavedJobs} from '../saved-jobs-provider';
import type {CandidateJobCard} from '../jobs.types';
import {JobListingCard} from './JobListingCard';
import {JobsSearchField} from './JobsSearchField';
import {JOBS_COLORS, JOBS_FONTS} from './jobs.ui';

function SortModal({visible, value, onClose, onChange}: {
  visible: boolean;
  value: SavedJobsSort;
  onClose: () => void;
  onChange: (value: SavedJobsSort) => void;
}) {
  const options: {value: SavedJobsSort; label: string}[] = [
    {value: 'newest', label: 'Terbaru'},
    {value: 'oldest', label: 'Terlama'},
  ];

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.modalOverlay}>
        <Pressable accessibilityViewIsModal onPress={event => event.stopPropagation()} style={styles.modalCard}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Urutkan</Text>
          {options.map(option => {
            const selected = option.value === value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{selected}}
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  onClose();
                }}
                style={styles.optionRow}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} color={selected ? JOBS_COLORS.blue : '#A8B3C3'} size={21} />
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function SavedJobsScreen() {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const {hydrated, isSaved, savedJobs, toggleSaved} = useSavedJobs();
  const applyAccess = useCandidateApplyAccess();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SavedJobsSort>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const containerWidth = Math.min(width, 720);
  const pagePadding = containerWidth <= 350 ? 14 : 20;
  const iconLayout = getJobsIconLayout(containerWidth);
  const visibleJobs = useMemo(
    () => filterAndSortSavedJobs(savedJobs, search, sort),
    [savedJobs, search, sort],
  );

  const openJob = (job: CandidateJobCard, intent?: 'apply') => {
    if (intent === 'apply' && applyAccess.isTier2Banned) return;
    router.push({
      pathname: '/(candidate)/jobs/[source]/[id]',
      params: {source: job.source, id: String(job.id), ...(intent ? {intent} : {})},
    } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <FlatList
        data={hydrated ? visibleJobs : []}
        keyExtractor={item => item.key}
        ListHeaderComponent={(
          <>
            <BrandedHeaderBackground
              containerWidth={containerWidth}
              topInset={insets.top}
              variant="application-list"
              contentStyle={[styles.headerContent, {paddingTop: insets.top + 8}]}
            >
              <Pressable accessibilityLabel="Kembali ke Lowongan" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={26} color="white" />
              </Pressable>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Lowongan Disimpan</Text>
                <Text style={styles.subtitle}>Lihat kembali lowongan pilihanmu</Text>
              </View>
            </BrandedHeaderBackground>
            <View style={[styles.controlsSheet, {paddingHorizontal: pagePadding}]}>
              <JobsSearchField
                height={iconLayout.searchFieldHeight}
                iconSize={iconLayout.searchIconSize}
                iconSlotSize={iconLayout.iconSlotSize}
                onChangeText={setSearch}
                value={search}
              />
              <View style={styles.resultRow}>
                <Text style={styles.resultText}>{visibleJobs.length} lowongan disimpan</Text>
                <Pressable accessibilityLabel="Urutkan lowongan disimpan" accessibilityRole="button" onPress={() => setSortOpen(true)} style={styles.sortButton}>
                  <Ionicons name="options-outline" size={18} color={JOBS_COLORS.navy} />
                  <Text style={styles.sortText}>{sort === 'newest' ? 'Terbaru' : 'Terlama'}</Text>
                  <Ionicons name="chevron-down" size={17} color={JOBS_COLORS.navy} />
                </Pressable>
              </View>
            </View>
          </>
        )}
        renderItem={({item}) => (
          <View style={{paddingHorizontal: pagePadding}}>
            <JobListingCard
              iconLayout={iconLayout}
              job={item}
              saved={isSaved(item.key)}
              applyBlocked={applyAccess.isTier2Banned}
              onApply={() => openJob(item, 'apply')}
              onOpen={() => openJob(item)}
              onShare={() => void Share.share({message: `${item.title} di ${item.company} - ${item.location}`})}
              onToggleSaved={() => toggleSaved(item)}
            />
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Ionicons name={hydrated ? savedJobs.length ? 'search-outline' : 'bookmark-outline' : 'hourglass-outline'} size={50} color="#8EA0B8" />
            <Text style={styles.emptyTitle}>{!hydrated ? 'Memuat lowongan disimpan...' : savedJobs.length ? 'Lowongan tidak ditemukan' : 'Belum ada lowongan disimpan'}</Text>
            {hydrated && <Text style={styles.emptyText}>{savedJobs.length ? 'Coba ubah kata kunci pencarian.' : 'Simpan lowongan menarik agar mudah ditemukan kembali.'}</Text>}
            {hydrated && (
              <Pressable accessibilityRole="button" onPress={() => {
                if (savedJobs.length) {
                  setSearch('');
                  setSort('newest');
                } else {
                  router.replace('/(candidate)/(tabs)/jobs');
                }
              }} style={styles.findButton}>
                <Text style={styles.findButtonText}>{savedJobs.length ? 'Reset Pencarian' : 'Cari Lowongan'}</Text>
              </Pressable>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[styles.content, {paddingBottom: Math.max(insets.bottom, 14) + 18}]}
        showsVerticalScrollIndicator={false}
      />
      <SortModal visible={sortOpen} value={sort} onChange={setSort} onClose={() => setSortOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: JOBS_COLORS.background},
  content: {flexGrow: 1},
  headerContent: {paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 9},
  backButton: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center'},
  headerCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 22, lineHeight: 29, color: 'white'},
  subtitle: {fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(255,255,255,0.86)', marginTop: 1},
  controlsSheet: {position: 'relative', zIndex: 2, marginTop: -16, borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden', backgroundColor: JOBS_COLORS.background, paddingTop: 20, paddingBottom: 17, gap: 13},
  resultRow: {minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  resultText: {flex: 1, fontFamily: JOBS_FONTS.bold, color: JOBS_COLORS.navy, fontSize: 13},
  sortButton: {minHeight: 42, borderRadius: 11, borderWidth: 1, borderColor: '#D6DEEA', backgroundColor: 'white', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7},
  sortText: {fontFamily: JOBS_FONTS.semibold, color: JOBS_COLORS.navy, fontSize: 11.5},
  separator: {height: 16},
  empty: {flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34},
  emptyTitle: {fontFamily: JOBS_FONTS.bold, fontSize: 16, color: JOBS_COLORS.navy, textAlign: 'center', marginTop: 13},
  emptyText: {fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 18, color: JOBS_COLORS.body, textAlign: 'center', marginTop: 6},
  findButton: {minHeight: 46, borderRadius: 11, backgroundColor: JOBS_COLORS.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: 18},
  findButtonText: {fontFamily: JOBS_FONTS.bold, fontSize: 11.5, color: 'white'},
  modalOverlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,18,58,0.56)'},
  modalCard: {width: '100%', maxWidth: 720, alignSelf: 'center', borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30},
  modalHandle: {width: 42, height: 4, borderRadius: 2, backgroundColor: '#D8DFE9', alignSelf: 'center'},
  modalTitle: {fontFamily: JOBS_FONTS.bold, fontSize: 17, color: JOBS_COLORS.navy, marginVertical: 16},
  optionRow: {minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EEF1F5'},
  optionText: {fontFamily: JOBS_FONTS.medium, fontSize: 12.5, color: JOBS_COLORS.body},
  optionTextSelected: {fontFamily: JOBS_FONTS.bold, color: JOBS_COLORS.blue},
});
