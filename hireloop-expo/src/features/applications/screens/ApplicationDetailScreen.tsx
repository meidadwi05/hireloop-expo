import Ionicons from '@expo/vector-icons/Ionicons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import {toAppApiError} from '../../../core/api/api-error';
import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';
import {dashboardKeys} from '../../dashboard/dashboard.keys';
import {jobsApi} from '../../jobs/api/jobs.api';
import {jobsKeys} from '../../jobs/jobs.keys';
import type {CandidateJobDetail, CandidateJobSource} from '../../jobs/jobs.types';
import {useAuth} from '../../auth/auth-provider';
import {applicationsApi} from '../api/applications.api';
import {applicationsKeys} from '../applications.keys';
import {canCancelApplication, mergeRecruitmentProcess} from '../applications.mapper';
import type {CandidateApplication} from '../applications.types';
import {useApplications} from '../hooks/use-applications';
import {ApplicationVerticalTimeline} from '../components/ApplicationTimeline';
import {CancelApplicationModal} from '../components/CancelApplicationModal';
import {
  APPLICATION_COLORS,
  APPLICATION_FONTS,
  applicationShadow,
  applicationStatePresentation,
  formatApplicationDate,
} from '../components/applications.ui';

const headerBackground = require('../../../assets/up_background.png');

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

function SummaryRow({icon, children}: {icon: keyof typeof Ionicons.glyphMap; children: string}) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={icon} size={18} color={APPLICATION_COLORS.body} />
      <Text style={styles.summaryText}>{children}</Text>
    </View>
  );
}

function statusHeroCopy(application: CandidateApplication) {
  switch (application.state) {
    case 'applied': return {icon: 'checkmark-circle-outline' as const, title: 'Lamaran berhasil dikirim', subtitle: 'Tim rekrutmen akan meninjau lamaran Anda.'};
    case 'hired': return {icon: 'ribbon-outline' as const, title: 'Selamat, Anda diterima', subtitle: 'Periksa informasi lanjutan dari tim rekrutmen.'};
    case 'rejected': return {icon: 'close-circle-outline' as const, title: 'Proses seleksi telah berakhir', subtitle: 'Lamaran belum dapat dilanjutkan pada tahap ini.'};
    case 'canceled': return {icon: 'close-circle-outline' as const, title: 'Lamaran telah dibatalkan', subtitle: 'Status pembatalan tersimpan di HireLoop.'};
    case 'closed': return {icon: 'lock-closed-outline' as const, title: 'Lowongan telah ditutup', subtitle: 'Status ini mengikuti data proses rekrutmen HireLoop.'};
    case 'temporary': return {icon: 'document-attach-outline' as const, title: 'Lengkapi persyaratan lamaran', subtitle: 'Persyaratan perlu dilengkapi sebelum lamaran diproses.'};
    case 'transferred': return {icon: 'swap-horizontal-outline' as const, title: 'Lamaran dialihkan', subtitle: 'Tim rekrutmen mengalihkan lamaran ke posisi atau proyek lain.'};
    default: return {icon: 'time-outline' as const, title: 'Lamaran sedang diproses', subtitle: `Tahap saat ini: ${application.currentStageLabel}`};
  }
}

export function ApplicationDetailScreen({source, id}: {source: CandidateJobSource; id: number}) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const {refreshUser} = useAuth();
  const applicationsQuery = useApplications();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);

  const baseApplication = useMemo(
    () => applicationsQuery.data?.find(item => item.source === source && item.referenceId === id) ?? null,
    [applicationsQuery.data, id, source],
  );

  const jobQuery = useQuery({
    queryKey: jobsKeys.detail(source, id),
    queryFn: () => jobsApi.detail(source, id),
    enabled: Boolean(baseApplication),
  });

  const processQuery = useQuery({
    queryKey: applicationsKeys.process(baseApplication?.applicationId ?? 0),
    queryFn: () => applicationsApi.recruitmentProcess(baseApplication!.applicationId),
    enabled: Boolean(baseApplication?.storageKind === 'applicant-data' && !baseApplication.isTemporary),
    staleTime: 30_000,
    retry: 1,
  });

  const application = useMemo(() => {
    if (!baseApplication || !processQuery.data) return baseApplication;
    return mergeRecruitmentProcess(baseApplication, processQuery.data);
  }, [baseApplication, processQuery.data]);
  const job = application ? jobQuery.data ?? fallbackJob(application) : null;

  const cancelMutation = useMutation({
    mutationFn: applicationsApi.cancel,
    onSuccess: async () => {
      setCancelOpen(false);
      setFeedback('Lamaran berhasil dibatalkan.');
      setFeedbackError(false);
      await Promise.all([
        queryClient.invalidateQueries({queryKey: applicationsKeys.all}),
        queryClient.invalidateQueries({queryKey: dashboardKeys.home()}),
        refreshUser(),
      ]);
    },
    onError: error => {
      setCancelOpen(false);
      setFeedback(toAppApiError(error).message);
      setFeedbackError(true);
    },
  });

  if (applicationsQuery.isPending && !application) {
    return (
      <View style={styles.fullState}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={APPLICATION_COLORS.blue} />
        <Text style={styles.fullStateText}>Memuat detail lamaran...</Text>
      </View>
    );
  }

  if (!application || !job) {
    return (
      <SafeAreaView style={styles.fullState}>
        <Ionicons name="document-text-outline" size={54} color="#98A8BE" />
        <Text style={styles.fullStateTitle}>Detail lamaran tidak ditemukan</Text>
        <Text style={styles.fullStateText}>Data lamaran mungkin sudah tidak tersedia.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(candidate)/(tabs)/career')} style={styles.stateButton}>
          <Text style={styles.stateButtonText}>Kembali ke Lamaran Saya</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const presentation = applicationStatePresentation(application.state, application.currentStageLabel);
  const heroCopy = statusHeroCopy(application);
  const processError = processQuery.isError ? toAppApiError(processQuery.error).message : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, {paddingBottom: Math.max(insets.bottom, 16) + 18}]}>
        <ImageBackground source={headerBackground} resizeMode="cover" style={[styles.header, {paddingTop: insets.top + 8}]} imageStyle={styles.headerImage}>
          <Pressable accessibilityRole="button" accessibilityLabel="Kembali ke Lamaran Saya" onPress={() => goBackOrReplace('/(candidate)/(tabs)/career')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Lamaran</Text>
          <View style={styles.headerSpacer} />
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.companyIcon}><Ionicons name="business-outline" size={27} color={APPLICATION_COLORS.blue} /></View>
              <View style={styles.summaryCopy}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.company}>{job.company}</Text>
              </View>
            </View>
            <View style={styles.summaryMetadata}>
              <SummaryRow icon="location-outline">{job.location}</SummaryRow>
              <SummaryRow icon="briefcase-outline">{`${job.contractType} · ${job.workMode}`}</SummaryRow>
              <SummaryRow icon="wallet-outline">{job.salaryLabel}</SummaryRow>
              <SummaryRow icon="calendar-outline">{job.closingLabel}</SummaryRow>
            </View>
          </View>

          <View style={[styles.statusHero, {backgroundColor: presentation.background, borderColor: `${presentation.color}55`}]}>
            <View style={[styles.statusIcon, {backgroundColor: `${presentation.color}18`}]}>
              <Ionicons name={heroCopy.icon} size={28} color={presentation.color} />
            </View>
            <View style={styles.statusCopy}>
              <View style={[styles.statusBadge, {borderColor: presentation.color}]}>
                <Text style={[styles.statusBadgeText, {color: presentation.color}]}>{presentation.label}</Text>
              </View>
              <Text style={styles.statusTitle}>{heroCopy.title}</Text>
              <Text style={styles.statusSubtitle}>{heroCopy.subtitle}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Progres Seleksi</Text>
            {processQuery.isFetching && !processQuery.data && <ActivityIndicator color={APPLICATION_COLORS.blue} style={styles.inlineLoader} />}
            {!!processError && (
              <View style={styles.partialError}>
                <Ionicons name="information-circle-outline" size={19} color="#A96C00" />
                <Text style={styles.partialErrorText}>{processError}</Text>
                <Pressable accessibilityRole="button" onPress={() => void processQuery.refetch()}><Text style={styles.retryText}>Coba lagi</Text></Pressable>
              </View>
            )}
            <ApplicationVerticalTimeline stages={application.stages} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Informasi Lamaran</Text>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Tanggal melamar</Text><Text style={styles.infoValue}>{formatApplicationDate(application.submittedAt)}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Penutupan lowongan</Text><Text style={styles.infoValue}>{job.closingDate ? formatApplicationDate(job.closingDate, false) : '-'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Terakhir diperbarui</Text><Text style={styles.infoValue}>{formatApplicationDate(application.updatedAt)}</Text></View>
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={19} color={APPLICATION_COLORS.blue} />
              <Text style={styles.infoBannerText}>Penutupan lowongan tidak otomatis membatalkan lamaran. Status proses mengikuti data rekrutmen HireLoop.</Text>
            </View>
          </View>

          {!!feedback && (
            <View style={[styles.feedback, feedbackError && styles.feedbackError]}>
              <Text style={[styles.feedbackText, feedbackError && styles.feedbackErrorText]}>{feedback}</Text>
            </View>
          )}

          {canCancelApplication(application) && (
            <Pressable accessibilityRole="button" disabled={cancelMutation.isPending} onPress={() => setCancelOpen(true)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Batalkan Lamaran</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({pathname: '/(candidate)/jobs/[source]/[id]', params: {source, id: String(id)}} as never)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Lihat Lowongan</Text>
            <Ionicons name="open-outline" size={20} color="white" />
          </Pressable>
        </View>
      </ScrollView>

      <CancelApplicationModal
        visible={cancelOpen}
        title={job.title}
        loading={cancelMutation.isPending}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => cancelMutation.mutate({applicationId: application.applicationId, storageKind: application.storageKind})}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: APPLICATION_COLORS.background},
  scrollContent: {backgroundColor: APPLICATION_COLORS.background},
  header: {minHeight: 118, paddingHorizontal: 14, paddingBottom: 17, flexDirection: 'row', alignItems: 'center', backgroundColor: APPLICATION_COLORS.blueDark},
  headerImage: {opacity: 0.98},
  backButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {flex: 1, fontFamily: APPLICATION_FONTS.bold, fontSize: 22, color: 'white', textAlign: 'center'},
  headerSpacer: {width: 44},
  content: {paddingHorizontal: 18, paddingTop: 17, gap: 15},
  summaryCard: {...applicationShadow, borderRadius: 16, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', padding: 16},
  summaryHeader: {flexDirection: 'row', gap: 12},
  companyIcon: {width: 54, height: 54, borderRadius: 14, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  summaryCopy: {flex: 1, minWidth: 0},
  jobTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 17, lineHeight: 23, color: APPLICATION_COLORS.navy},
  company: {fontFamily: APPLICATION_FONTS.medium, fontSize: 11.5, lineHeight: 18, color: APPLICATION_COLORS.body, marginTop: 3},
  summaryMetadata: {gap: 8, marginTop: 14},
  summaryRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 9},
  summaryText: {flex: 1, minWidth: 0, fontFamily: APPLICATION_FONTS.regular, fontSize: 11, lineHeight: 18, color: APPLICATION_COLORS.body},
  statusHero: {minHeight: 132, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16},
  statusIcon: {width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  statusCopy: {flex: 1, minWidth: 0},
  statusBadge: {alignSelf: 'flex-start', minHeight: 26, borderRadius: 13, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 11},
  statusBadgeText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 9.5},
  statusTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 15, lineHeight: 21, color: APPLICATION_COLORS.navy, marginTop: 8},
  statusSubtitle: {fontFamily: APPLICATION_FONTS.regular, fontSize: 11, lineHeight: 17, color: APPLICATION_COLORS.body, marginTop: 2},
  sectionCard: {...applicationShadow, borderRadius: 16, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', padding: 16},
  sectionTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 16, color: APPLICATION_COLORS.navy, marginBottom: 12},
  inlineLoader: {paddingVertical: 12},
  partialError: {flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: '#FFF7DF', padding: 11, marginBottom: 8},
  partialErrorText: {flex: 1, fontFamily: APPLICATION_FONTS.regular, fontSize: 9.5, lineHeight: 15, color: '#7D570F'},
  retryText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 9.5, color: APPLICATION_COLORS.blue},
  infoRow: {minHeight: 34, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12},
  infoLabel: {flex: 1, fontFamily: APPLICATION_FONTS.medium, fontSize: 11, lineHeight: 17, color: APPLICATION_COLORS.body},
  infoValue: {flex: 1, fontFamily: APPLICATION_FONTS.semibold, fontSize: 10.5, lineHeight: 17, color: APPLICATION_COLORS.navy, textAlign: 'right'},
  infoBanner: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, backgroundColor: '#EAF2FF', padding: 11, marginTop: 8},
  infoBannerText: {flex: 1, fontFamily: APPLICATION_FONTS.regular, fontSize: 9.5, lineHeight: 15, color: '#3C5A82'},
  feedback: {borderRadius: 11, backgroundColor: '#E7F9F1', padding: 12},
  feedbackText: {fontFamily: APPLICATION_FONTS.semibold, fontSize: 10.5, color: '#087A51'},
  feedbackError: {backgroundColor: '#FFECEF'},
  feedbackErrorText: {color: '#B51E34'},
  cancelButton: {height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: APPLICATION_COLORS.red, alignItems: 'center', justifyContent: 'center'},
  cancelButtonText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 12, color: APPLICATION_COLORS.red},
  primaryButton: {height: 54, borderRadius: 12, backgroundColor: APPLICATION_COLORS.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  primaryButtonText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 13, color: 'white'},
  fullState: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: APPLICATION_COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 28},
  fullStateTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 17, color: APPLICATION_COLORS.navy, textAlign: 'center', marginTop: 14},
  fullStateText: {fontFamily: APPLICATION_FONTS.regular, fontSize: 11.5, lineHeight: 18, color: APPLICATION_COLORS.body, textAlign: 'center', marginTop: 8},
  stateButton: {height: 46, borderRadius: 11, backgroundColor: APPLICATION_COLORS.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, marginTop: 20},
  stateButtonText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 11.5, color: 'white'},
});
