import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useRef, useState} from 'react';
import {Alert, FlatList, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {useCandidateApplyAccess} from '../../auth/hooks/use-candidate-apply-access';
import {getJobsIconLayout} from '../jobs-header.layout';
import {
  countSavedJobsByStatus,
  filterAndSortSavedJobs,
  type SavedJobsSort,
  type SavedJobsStatus,
} from '../saved-jobs.filters';
import {useSavedJobs} from '../saved-jobs-provider';
import type {CandidateJobCard} from '../jobs.types';
import {JobListingCard} from './JobListingCard';
import {JobsSearchField} from './JobsSearchField';
import {JOBS_COLORS, JOBS_FONTS} from './jobs.ui';

type DropdownAnchor = {height: number; width: number; x: number; y: number};
type DropdownOption = {label: string; value: string};

function DropdownMenu({visible, anchor, options, title, value, viewportWidth, onClose, onChange}: {
  visible: boolean;
  anchor: DropdownAnchor | null;
  options: DropdownOption[];
  title: string;
  value: string;
  viewportWidth: number;
  onClose: () => void;
  onChange: (value: string) => void;
}) {
  if (!anchor) return null;

  const menuWidth = Math.min(Math.max(anchor.width, 176), viewportWidth - 24);
  const menuLeft = Math.max(12, Math.min(anchor.x + anchor.width - menuWidth, viewportWidth - menuWidth - 12));

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.dropdownOverlay}>
        <Pressable
          accessibilityViewIsModal
          onPress={event => event.stopPropagation()}
          style={[styles.dropdownCard, {left: menuLeft, top: anchor.y + anchor.height + 6, width: menuWidth}]}
        >
          <Text style={styles.dropdownTitle}>{title}</Text>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={options.length > 5} style={styles.dropdownOptions}>
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
                  style={styles.dropdownOption}
                >
                  <Text numberOfLines={1} style={[styles.dropdownOptionText, selected && styles.dropdownOptionTextSelected]}>{option.label}</Text>
                  <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} color={selected ? JOBS_COLORS.blue : '#A8B3C3'} size={21} />
                </Pressable>
              );
            })}
          </ScrollView>
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
  const [status, setStatus] = useState<SavedJobsStatus>('all');
  const [dropdownAnchor, setDropdownAnchor] = useState<DropdownAnchor | null>(null);
  const sortAnchorRef = useRef<View>(null);
  const containerWidth = Math.min(width, 720);
  const pagePadding = containerWidth <= 350 ? 14 : 20;
  const iconLayout = getJobsIconLayout(containerWidth);
  const statusCounts = useMemo(
    () => countSavedJobsByStatus(savedJobs, search, 'all'),
    [savedJobs, search],
  );
  const visibleJobs = useMemo(
    () => filterAndSortSavedJobs(savedJobs, {location: 'all', search, sort, status}),
    [savedJobs, search, sort, status],
  );

  const openSortDropdown = (anchorView: View | null) => {
    anchorView?.measureInWindow((x, y, measuredWidth, height) => {
      setDropdownAnchor({height, width: measuredWidth, x, y});
    });
  };

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
      <BrandedHeaderBackground
        containerWidth={containerWidth}
        topInset={insets.top}
        variant="saved-list"
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
        <View style={styles.filterRow}>
          <View style={styles.searchAnchor}>
            <JobsSearchField
              height={iconLayout.searchFieldHeight}
              iconSize={iconLayout.searchIconSize}
              iconSlotSize={iconLayout.iconSlotSize}
              onChangeText={setSearch}
              value={search}
            />
          </View>
          <View ref={sortAnchorRef} collapsable={false} style={styles.sortAnchor}>
            <Pressable
              accessibilityLabel="Filter urutan lowongan disimpan"
              accessibilityRole="button"
              onPress={() => openSortDropdown(sortAnchorRef.current)}
              style={({pressed}) => [styles.filterControl, styles.sortControl, pressed && styles.controlPressed]}
            >
              <Ionicons name="options-outline" size={18} color="#49607F" />
              <Text style={styles.filterControlText}>Filter</Text>
              {sort === 'oldest' ? <View style={styles.filterDot} /> : null}
            </Pressable>
          </View>
        </View>
        <View accessibilityRole="tablist" style={styles.statusTabs}>
          {([
            {label: 'Semua', value: 'all' as const},
            {label: 'Aktif', value: 'active' as const},
            {label: 'Ditutup', value: 'closed' as const},
          ]).map(item => {
            const selected = status === item.value;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{selected}}
                key={item.value}
                onPress={() => setStatus(item.value)}
                style={[styles.statusPill, selected && styles.statusPillSelected]}
                testID={`saved-status-${item.value}`}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.statusText,
                    containerWidth <= 350 && styles.statusTextCompact,
                    selected && styles.statusTextSelected,
                  ]}
                >
                  {item.label} ({statusCounts[item.value]})
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        style={styles.list}
        data={hydrated ? visibleJobs : []}
        keyExtractor={item => item.key}
        ListHeaderComponent={(
          <View style={[styles.resultRow, styles.resultHeader, {paddingHorizontal: pagePadding}]}>
            <Text style={styles.resultText}>{visibleJobs.length} lowongan disimpan</Text>
          </View>
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
              onShare={() => void Share.share({message: `${item.title} di ${item.company} - ${item.location}`}).catch(error => {
                Alert.alert('Gagal Membagikan Lowongan', error instanceof Error ? error.message : 'Coba lagi beberapa saat lagi.');
              })}
              onToggleSaved={() => void toggleSaved(item)}
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
                  setStatus('all');
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
      <DropdownMenu
        anchor={dropdownAnchor}
        onChange={value => setSort(value as SavedJobsSort)}
        onClose={() => setDropdownAnchor(null)}
        options={[{label: 'Terbaru', value: 'newest'}, {label: 'Terlama', value: 'oldest'}]}
        title="Urutkan"
        value={sort}
        viewportWidth={width}
        visible={Boolean(dropdownAnchor)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: JOBS_COLORS.background},
  list: {flex: 1},
  content: {flexGrow: 1},
  headerContent: {paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 9},
  backButton: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center'},
  headerCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 22, lineHeight: 29, color: 'white'},
  subtitle: {fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(255,255,255,0.86)', marginTop: 1},
  controlsSheet: {position: 'relative', zIndex: 2, backgroundColor: JOBS_COLORS.background, paddingTop: 14, paddingBottom: 14, gap: 12},
  filterRow: {width: '100%', minHeight: 52, flexDirection: 'row', alignItems: 'stretch', gap: 9},
  searchAnchor: {flex: 1, minWidth: 0},
  sortAnchor: {width: 100, flexShrink: 0},
  filterControl: {minHeight: 52, flex: 1, borderRadius: 14, borderWidth: 1, borderColor: '#D5DDE9', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12},
  sortControl: {justifyContent: 'center'},
  filterControlText: {flex: 1, minWidth: 0, fontFamily: JOBS_FONTS.semibold, fontSize: 11.5, color: '#283A5C'},
  filterDot: {position: 'absolute', right: 8, top: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: JOBS_COLORS.blue},
  controlPressed: {opacity: 0.72},
  statusTabs: {alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7},
  statusPill: {minWidth: 78, minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: '#D5DDE9', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12},
  statusPillSelected: {borderColor: '#062A70', backgroundColor: '#062A70'},
  statusText: {fontFamily: JOBS_FONTS.bold, fontSize: 10.5, color: '#283A5C'},
  statusTextCompact: {fontSize: 9},
  statusTextSelected: {color: 'white'},
  resultRow: {minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  resultHeader: {paddingTop: 8, paddingBottom: 8},
  resultText: {flex: 1, fontFamily: JOBS_FONTS.bold, color: JOBS_COLORS.navy, fontSize: 13},
  separator: {height: 16},
  empty: {flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34},
  emptyTitle: {fontFamily: JOBS_FONTS.bold, fontSize: 16, color: JOBS_COLORS.navy, textAlign: 'center', marginTop: 13},
  emptyText: {fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 18, color: JOBS_COLORS.body, textAlign: 'center', marginTop: 6},
  findButton: {minHeight: 46, borderRadius: 11, backgroundColor: JOBS_COLORS.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: 18},
  findButtonText: {fontFamily: JOBS_FONTS.bold, fontSize: 11.5, color: 'white'},
  dropdownOverlay: {flex: 1, backgroundColor: 'rgba(6,26,77,0.08)'},
  dropdownCard: {position: 'absolute', maxHeight: 310, borderRadius: 14, borderWidth: 1, borderColor: '#D5DDE9', backgroundColor: 'white', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, shadowColor: '#193A70', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.16, shadowRadius: 14, elevation: 9},
  dropdownTitle: {fontFamily: JOBS_FONTS.bold, fontSize: 12.5, color: JOBS_COLORS.navy, paddingHorizontal: 4, paddingVertical: 10},
  dropdownOptions: {maxHeight: 245},
  dropdownOption: {minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTopWidth: 1, borderTopColor: '#EEF1F5', paddingHorizontal: 4},
  dropdownOptionText: {flex: 1, minWidth: 0, fontFamily: JOBS_FONTS.medium, fontSize: 11.5, color: JOBS_COLORS.body},
  dropdownOptionTextSelected: {fontFamily: JOBS_FONTS.bold, color: JOBS_COLORS.blue},
});
