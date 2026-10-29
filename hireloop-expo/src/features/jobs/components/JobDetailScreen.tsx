import Ionicons from '@expo/vector-icons/Ionicons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import React, {useState} from 'react';
import {router} from 'expo-router';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {toAppApiError} from '../../../core/api/api-error';
import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';
import {applicationsKeys} from '../../applications/applications.keys';
import {jobsApi} from '../api/jobs.api';
import {jobsKeys} from '../jobs.keys';
import type {CandidateJobSource} from '../jobs.types';
import {ApplyConfirmationModal} from './ApplyConfirmationModal';
import {JOBS_COLORS, JOBS_FONTS, jobsCardShadow} from './jobs.ui';

type JobDetailScreenProps = {
  source: CandidateJobSource;
  id: number;
  autoOpenApply: boolean;
};

function DetailSection({title, items, fallback}: {title: string; items?: string[]; fallback?: string}) {
  if (!items?.length && !fallback) return null;
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items?.length
        ? items.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.sectionText}>{item}</Text>
          </View>
        ))
        : <Text style={styles.sectionText}>{fallback}</Text>}
    </View>
  );
}

export function JobDetailScreen({source, id, autoOpenApply}: JobDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const containerWidth = Math.min(width, 720);
  const queryClient = useQueryClient();
  const [confirmVisible, setConfirmVisible] = useState(autoOpenApply);
  const [feedback, setFeedback] = useState('');
  const [requiresNik, setRequiresNik] = useState(false);
  const detail = useQuery({
    queryKey: jobsKeys.detail(source, id),
    queryFn: () => jobsApi.detail(source, id),
  });
  const apply = useMutation({
    mutationFn: jobsApi.apply,
    onSuccess: async () => {
      setConfirmVisible(false);
      setRequiresNik(false);
      setFeedback('Lamaran berhasil dikirim. Anda dapat memantau prosesnya dari menu Lamaran.');
      await Promise.all([
        queryClient.invalidateQueries({queryKey: jobsKeys.all}),
        queryClient.invalidateQueries({queryKey: applicationsKeys.all}),
      ]);
    },
    onError: error => {
      const apiError = toAppApiError(error);
      setConfirmVisible(false);
      setRequiresNik(apiError.status === 422 && /nik|nomor induk/i.test(apiError.message));
      setFeedback(apiError.message);
    },
  });

  const job = detail.data;
  const error = detail.isError ? toAppApiError(detail.error).message : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <BrandedHeaderBackground
          containerWidth={containerWidth}
          topInset={insets.top}
          variant="compact-detail"
          style={[styles.header, {paddingTop: insets.top + 8}]}
        >
          <Pressable accessibilityLabel="Kembali ke daftar lowongan" accessibilityRole="button" onPress={() => goBackOrReplace('/(candidate)/(tabs)/jobs')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Lowongan</Text>
          <View style={styles.headerSpacer} />
        </BrandedHeaderBackground>

        <View style={styles.content}>
          {detail.isPending && (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>Memuat detail lowongan...</Text>
            </View>
          )}
          {!!error && (
            <View style={styles.stateCard}>
              <Ionicons name="cloud-offline-outline" size={36} color="#98A5B8" />
              <Text style={styles.stateTitle}>Detail belum dapat dimuat</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={() => void detail.refetch()} style={styles.retryButton}>
                <Text style={styles.retryText}>Coba lagi</Text>
              </Pressable>
            </View>
          )}

          {job && (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View style={styles.companyIcon}><Ionicons name="business-outline" size={27} color={JOBS_COLORS.blue} /></View>
                  <View style={styles.summaryCopy}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.company}>{job.company}</Text>
                  </View>
                </View>
                <View style={styles.badges}>
                  <View style={styles.activeBadge}><Text style={styles.activeText}>Aktif</Text></View>
                  {job.urgent && <View style={styles.urgentBadge}><Ionicons name="flame" size={12} color={JOBS_COLORS.red} /><Text style={styles.urgentText}>Dibutuhkan Segera</Text></View>}
                </View>
                <View style={styles.infoRow}><Ionicons name="location-outline" size={18} color={JOBS_COLORS.blue} /><Text style={styles.infoText}>{job.location}</Text></View>
                <View style={styles.infoRow}><Ionicons name="briefcase-outline" size={18} color={JOBS_COLORS.blue} /><Text style={styles.infoText}>{job.contractType} - {job.workMode}</Text></View>
                <View style={styles.infoRow}><Ionicons name="cash-outline" size={18} color={JOBS_COLORS.blue} /><Text style={styles.salary}>{job.salaryLabel}</Text></View>
                <View style={styles.infoRow}><Ionicons name="calendar-outline" size={18} color={JOBS_COLORS.blue} /><Text style={styles.infoText}>{job.closingLabel}</Text></View>
              </View>

              {!!feedback && (
                <View style={[styles.feedback, requiresNik ? styles.feedbackWarning : styles.feedbackSuccess]}>
                  <Text style={styles.feedbackText}>{feedback}</Text>
                  {requiresNik && (
                    <Pressable accessibilityRole="button" onPress={() => router.replace('/profile')} style={styles.profileLink}>
                      <Text style={styles.profileLinkText}>Lengkapi Profil</Text>
                    </Pressable>
                  )}
                </View>
              )}

              <DetailSection title="Deskripsi Pekerjaan" fallback={job.description} />
              <DetailSection title="Kualifikasi" items={job.requirements} fallback="Kualifikasi belum dicantumkan." />
              <DetailSection title="Benefit" items={job.benefits} />
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Informasi Tambahan</Text>
                <Text style={styles.sectionText}>Pendidikan: {job.education}</Text>
                <Text style={[styles.sectionText, styles.extraLine]}>Pengalaman: {job.experience}</Text>
              </View>

              <Pressable accessibilityRole="button" disabled={!job.active || apply.isPending} onPress={() => setConfirmVisible(true)} style={[styles.applyButton, !job.active && styles.disabled]}>
                <Text style={styles.applyText}>Lamar sekarang</Text>
              </Pressable>

              <ApplyConfirmationModal
                job={job}
                visible={confirmVisible}
                loading={apply.isPending}
                onCancel={() => setConfirmVisible(false)}
                onConfirm={() => {
                  if (apply.isPending) return;
                  setFeedback('');
                  apply.mutate({
                    job_reference_type: job.source,
                    job_reference_id: job.id,
                    job_title: job.title,
                    company_name: job.company,
                    location: job.location,
                    agreed: true,
                  });
                }}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: JOBS_COLORS.background},
  scrollContent: {paddingBottom: 24},
  header: {paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center'},
  backButton: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {flex: 1, fontFamily: JOBS_FONTS.bold, fontSize: 21, color: 'white', textAlign: 'center'},
  headerSpacer: {width: 42},
  content: {paddingHorizontal: 20, paddingTop: 18, gap: 15},
  stateCard: {...jobsCardShadow, minHeight: 220, borderRadius: 18, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', padding: 25},
  stateTitle: {fontFamily: JOBS_FONTS.bold, fontSize: 15, color: JOBS_COLORS.ink, textAlign: 'center', marginTop: 10},
  stateText: {fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 18, color: JOBS_COLORS.body, textAlign: 'center', marginTop: 7},
  retryButton: {height: 40, borderRadius: 10, backgroundColor: JOBS_COLORS.blue, justifyContent: 'center', paddingHorizontal: 22, marginTop: 17},
  retryText: {fontFamily: JOBS_FONTS.semibold, fontSize: 11, color: 'white'},
  summaryCard: {...jobsCardShadow, borderRadius: 18, backgroundColor: 'white', padding: 18},
  summaryHeader: {flexDirection: 'row', gap: 12},
  companyIcon: {width: 54, height: 54, borderRadius: 14, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center'},
  summaryCopy: {flex: 1, minWidth: 0},
  jobTitle: {fontFamily: JOBS_FONTS.bold, fontSize: 19, lineHeight: 25, color: JOBS_COLORS.ink},
  company: {fontFamily: JOBS_FONTS.regular, fontSize: 12, lineHeight: 18, color: JOBS_COLORS.body, marginTop: 3},
  badges: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16},
  activeBadge: {minHeight: 27, borderRadius: 14, backgroundColor: JOBS_COLORS.greenBackground, justifyContent: 'center', paddingHorizontal: 12},
  activeText: {fontFamily: JOBS_FONTS.semibold, fontSize: 10.5, color: JOBS_COLORS.green},
  urgentBadge: {minHeight: 27, borderRadius: 14, backgroundColor: JOBS_COLORS.redBackground, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12},
  urgentText: {fontFamily: JOBS_FONTS.medium, fontSize: 10.5, color: JOBS_COLORS.red},
  infoRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10},
  infoText: {flex: 1, fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 18, color: JOBS_COLORS.body},
  salary: {flex: 1, fontFamily: JOBS_FONTS.semibold, fontSize: 13, color: JOBS_COLORS.blue},
  feedback: {borderRadius: 13, padding: 14},
  feedbackSuccess: {backgroundColor: '#E8F8EF'},
  feedbackWarning: {backgroundColor: '#FFF3E1'},
  feedbackText: {fontFamily: JOBS_FONTS.medium, fontSize: 11.5, lineHeight: 18, color: '#34506D'},
  profileLink: {alignSelf: 'flex-start', marginTop: 8},
  profileLinkText: {fontFamily: JOBS_FONTS.bold, fontSize: 11.5, color: JOBS_COLORS.blue},
  sectionCard: {borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: JOBS_COLORS.border, padding: 17},
  sectionTitle: {fontFamily: JOBS_FONTS.bold, fontSize: 15, color: JOBS_COLORS.ink, marginBottom: 10},
  sectionText: {flex: 1, fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 19, color: JOBS_COLORS.body},
  bulletRow: {flexDirection: 'row', gap: 9, marginTop: 5},
  bullet: {width: 6, height: 6, borderRadius: 3, backgroundColor: JOBS_COLORS.blue, marginTop: 7},
  extraLine: {marginTop: 7},
  applyButton: {height: 52, borderRadius: 12, backgroundColor: JOBS_COLORS.blue, alignItems: 'center', justifyContent: 'center'},
  applyText: {fontFamily: JOBS_FONTS.bold, fontSize: 13, color: 'white'},
  disabled: {opacity: 0.5},
});
