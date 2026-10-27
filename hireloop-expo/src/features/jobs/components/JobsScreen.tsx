import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {useCandidateJobs} from '../hooks/use-candidate-jobs';
import type {CandidateJobCard, CandidateJobQuery} from '../jobs.types';
import {JobListingCard} from './JobListingCard';
import {JobsCategoryTabs} from './JobsCategoryTabs';
import {JobsEmptyState} from './JobsEmptyState';
import {JobsHeader} from './JobsHeader';
import {JobsListSkeleton} from './JobsListSkeleton';
import {JobsLocationFilter} from './JobsLocationFilter';
import {JobsResultHeader} from './JobsResultHeader';
import {JOBS_COLORS} from './jobs.ui';

type Priority = NonNullable<CandidateJobQuery['priority']>;

export function JobsScreen() {
  const {width} = useWindowDimensions();
  const [priority, setPriority] = useState<Priority>('all');
  const [savedKeys, setSavedKeys] = useState<Set<string>>(() => new Set());
  const jobs = useCandidateJobs(priority);
  const pagePadding = width <= 350 ? 14 : 20;

  const openJob = useCallback((job: CandidateJobCard, intent?: 'apply') => {
    router.push({
      pathname: '/(candidate)/jobs/[source]/[id]',
      params: {source: job.source, id: String(job.id), ...(intent ? {intent} : {})},
    } as never);
  }, []);

  const toggleSaved = useCallback((key: string) => {
    setSavedKeys(current => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const showUnsupported = useCallback(() => {
    Alert.alert(
      'Segera tersedia',
      'Backend saat ini belum menyediakan filter lokasi dan filter lanjutan untuk daftar gabungan lowongan.',
    );
  }, []);

  const reset = useCallback(() => {
    jobs.setSearch('');
    setPriority('all');
    if (jobs.isError) void jobs.refetch();
  }, [jobs]);

  const errorMessage = jobs.isError ? toAppApiError(jobs.error).message : undefined;

  const header = (
    <>
      <JobsHeader
        search={jobs.search}
        onChangeSearch={jobs.setSearch}
        onOpenSaved={() => Alert.alert('Lowongan tersimpan', 'Penyimpanan lowongan masih berlaku untuk sesi aplikasi ini.')}
      />
      <View style={[styles.controls, {paddingHorizontal: pagePadding}]}>
        <JobsLocationFilter onUnavailablePress={showUnsupported} />
        <JobsCategoryTabs value={priority} onChange={setPriority} />
        <JobsResultHeader
          total={jobs.total}
          onSortPress={() => Alert.alert('Urutan lowongan', 'Daftar memakai urutan terbaru dari server HireLoop.')}
        />
      </View>
    </>
  );

  return (
    <View style={styles.viewport}>
      <StatusBar style="light" />
      <FlatList
        data={jobs.items}
        keyExtractor={item => item.key}
        renderItem={({item}) => (
          <View style={{paddingHorizontal: pagePadding}}>
            <JobListingCard
              job={item}
              saved={savedKeys.has(item.key)}
              onApply={() => openJob(item, 'apply')}
              onOpen={() => openJob(item)}
              onShare={() => {
                void Share.share({message: `${item.title} di ${item.company} - ${item.location}`})
                  .catch(() => Alert.alert('Bagikan lowongan', `${item.title} di ${item.company}`));
              }}
              onToggleSaved={() => toggleSaved(item.key)}
            />
          </View>
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={jobs.isPending
          ? <View style={{paddingHorizontal: pagePadding}}><JobsListSkeleton /></View>
          : <View style={{paddingHorizontal: pagePadding}}><JobsEmptyState error={errorMessage} onReset={reset} /></View>}
        ListFooterComponent={jobs.isFetchingNextPage
          ? <ActivityIndicator color={JOBS_COLORS.blue} style={styles.footerLoader} />
          : <View style={styles.footerSpace} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onEndReached={() => {
          if (jobs.hasNextPage && !jobs.isFetchingNextPage) void jobs.fetchNextPage();
        }}
        onEndReachedThreshold={0.35}
        onRefresh={() => void jobs.refetch()}
        refreshing={jobs.isRefetching && !jobs.isFetchingNextPage}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: JOBS_COLORS.background},
  content: {paddingBottom: 22},
  controls: {gap: 18, marginTop: -28, marginBottom: 18},
  separator: {height: 16},
  footerLoader: {paddingVertical: 24},
  footerSpace: {height: 10},
});
