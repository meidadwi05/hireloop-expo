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
import {useCandidateApplyAccess} from '../../auth/hooks/use-candidate-apply-access';
import {useCandidateJobs} from '../hooks/use-candidate-jobs';
import {getJobsIconLayout} from '../jobs-header.layout';
import {useSavedJobs} from '../saved-jobs-provider';
import type {CandidateJobCard, CandidateJobQuery} from '../jobs.types';
import {JobListingCard} from './JobListingCard';
import {JobsCategoryTabs} from './JobsCategoryTabs';
import {JobsEmptyState} from './JobsEmptyState';
import {JobsHeader} from './JobsHeader';
import {JobsListSkeleton} from './JobsListSkeleton';
import {JobsResultHeader} from './JobsResultHeader';
import {JobsSearchField} from './JobsSearchField';
import {JOBS_COLORS} from './jobs.ui';

type Priority = NonNullable<CandidateJobQuery['priority']>;

export function JobsScreen() {
  const {width} = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority>('all');
  const {isSaved, toggleSaved} = useSavedJobs();
  const applyAccess = useCandidateApplyAccess();
  const jobs = useCandidateJobs(priority);
  const containerWidth = measuredWidth ?? Math.min(width, 720);
  const pagePadding = containerWidth <= 350 ? 14 : 20;
  const iconLayout = getJobsIconLayout(containerWidth);

  const openJob = useCallback((job: CandidateJobCard) => {
    router.push({
      pathname: '/(candidate)/jobs/[source]/[id]',
      params: {source: job.source, id: String(job.id)},
    } as never);
  }, []);

  const reset = useCallback(() => {
    jobs.setSearch('');
    setPriority('all');
    if (jobs.isError) void jobs.refetch();
  }, [jobs]);

  const errorMessage = jobs.isError ? toAppApiError(jobs.error).message : undefined;

  return (
    <View
      style={styles.viewport}
      onLayout={event => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        if (nextWidth > 0) setMeasuredWidth(current => current === nextWidth ? current : nextWidth);
      }}
    >
      <StatusBar style="light" />
      <JobsHeader
        containerWidth={containerWidth}
        horizontalPadding={pagePadding}
      />
      <View style={[styles.controlsSheet, {paddingHorizontal: pagePadding}]}>
        <JobsSearchField
          value={jobs.search}
          iconSize={iconLayout.searchIconSize}
          iconSlotSize={iconLayout.iconSlotSize}
          height={iconLayout.searchFieldHeight}
          onChangeText={jobs.setSearch}
        />
        <JobsCategoryTabs value={priority} onChange={setPriority} />
      </View>
      <FlatList
        style={styles.list}
        data={jobs.items}
        keyExtractor={item => item.key}
        renderItem={({item}) => (
          <View style={{paddingHorizontal: pagePadding}}>
            <JobListingCard
              iconLayout={iconLayout}
              job={item}
              saved={isSaved(item.key)}
              applyBlocked={applyAccess.isTier2Banned}
              onApply={() => openJob(item)}
              onOpen={() => openJob(item)}
              onShare={() => void Share.share({message: `${item.title} di ${item.company} - ${item.location}`}).catch(error => {
                Alert.alert('Gagal Membagikan Lowongan', error instanceof Error ? error.message : 'Coba lagi beberapa saat lagi.');
              })}
              onToggleSaved={() => void toggleSaved(item)}
            />
          </View>
        )}
        ListHeaderComponent={(
          <View style={[styles.resultHeader, {paddingHorizontal: pagePadding}]}>
            <JobsResultHeader total={jobs.total} />
          </View>
        )}
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
        onRefresh={() => void Promise.all([jobs.refetch(), applyAccess.refetch()])}
        refreshing={(jobs.isRefetching && !jobs.isFetchingNextPage) || applyAccess.isRefetching}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: JOBS_COLORS.background},
  list: {flex: 1},
  content: {flexGrow: 1, paddingBottom: 22},
  controlsSheet: {zIndex: 2, gap: 12, backgroundColor: JOBS_COLORS.background, paddingTop: 14, paddingBottom: 14},
  resultHeader: {minHeight: 42, justifyContent: 'center', paddingTop: 8, paddingBottom: 8},
  separator: {height: 16},
  footerLoader: {paddingVertical: 24},
  footerSpace: {height: 10},
});
