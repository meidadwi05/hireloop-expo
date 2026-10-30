import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React from 'react';
import {FlatList, Pressable, Share, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {useCandidateApplyAccess} from '../../auth/hooks/use-candidate-apply-access';
import {getJobsIconLayout} from '../jobs-header.layout';
import {useSavedJobs} from '../saved-jobs-provider';
import type {CandidateJobCard} from '../jobs.types';
import {JobListingCard} from './JobListingCard';
import {JOBS_COLORS, JOBS_FONTS} from './jobs.ui';

export function SavedJobsScreen() {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const {hydrated, isSaved, savedJobs, toggleSaved} = useSavedJobs();
  const applyAccess = useCandidateApplyAccess();
  const containerWidth = Math.min(width, 720);
  const pagePadding = containerWidth <= 350 ? 14 : 20;
  const iconLayout = getJobsIconLayout(containerWidth);

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
        data={hydrated ? savedJobs : []}
        keyExtractor={item => item.key}
        ListHeaderComponent={(
          <BrandedHeaderBackground containerWidth={containerWidth} topInset={insets.top} variant="application-list" style={[styles.header, {paddingTop: insets.top + 8}]}>
            <Pressable accessibilityLabel="Kembali ke Lowongan" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Lowongan Tersimpan</Text>
              <Text style={styles.subtitle}>Peluang yang ingin kamu lihat kembali</Text>
            </View>
          </BrandedHeaderBackground>
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
            <Ionicons name={hydrated ? 'bookmark-outline' : 'hourglass-outline'} size={50} color="#8EA0B8" />
            <Text style={styles.emptyTitle}>{hydrated ? 'Belum ada lowongan tersimpan' : 'Memuat lowongan tersimpan...'}</Text>
            {hydrated && <Text style={styles.emptyText}>Simpan lowongan menarik agar mudah ditemukan kembali.</Text>}
            {hydrated && (
              <Pressable accessibilityRole="button" onPress={() => router.replace('/(candidate)/(tabs)/jobs')} style={styles.findButton}>
                <Text style={styles.findButtonText}>Cari Lowongan</Text>
              </Pressable>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[styles.content, {paddingBottom: Math.max(insets.bottom, 14) + 18}]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: JOBS_COLORS.background},
  content: {flexGrow: 1},
  header: {paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18},
  backButton: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center'},
  headerCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 22, lineHeight: 29, color: 'white'},
  subtitle: {fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 17, color: 'rgba(255,255,255,0.86)', marginTop: 1},
  separator: {height: 16},
  empty: {flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34},
  emptyTitle: {fontFamily: JOBS_FONTS.bold, fontSize: 16, color: JOBS_COLORS.navy, textAlign: 'center', marginTop: 13},
  emptyText: {fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 18, color: JOBS_COLORS.body, textAlign: 'center', marginTop: 6},
  findButton: {minHeight: 46, borderRadius: 11, backgroundColor: JOBS_COLORS.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: 18},
  findButtonText: {fontFamily: JOBS_FONTS.bold, fontSize: 11.5, color: 'white'},
});
