import Ionicons from '@expo/vector-icons/Ionicons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import {BrandedHeaderBackground} from '../../../components/ui/BrandedHeaderBackground';
import {toAppApiError} from '../../../core/api/api-error';
import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';
import {dashboardKeys} from '../../dashboard/dashboard.keys';
import {jobsApi} from '../../jobs/api/jobs.api';
import {jobsKeys} from '../../jobs/jobs.keys';
import {useSavedJobs} from '../../jobs/saved-jobs-provider';
import type {CandidateJobDetail, CandidateJobSource} from '../../jobs/jobs.types';
import {useAuth} from '../../auth/auth-provider';
import {applicationsApi} from '../api/applications.api';
import {applicationsKeys} from '../applications.keys';
import {canCancelApplication, mergeRecruitmentProcess} from '../applications.mapper';
import type {CandidateApplication} from '../applications.types';
import {useApplications} from '../hooks/use-applications';
import {ApplicationRecruitmentProgress} from '../components/ApplicationRecruitmentProgress';
import {ApplicationDetailSkeleton, ApplicationTimelineSkeleton} from '../components/ApplicationSkeletons';
import {CancelApplicationModal} from '../components/CancelApplicationModal';
import {CompleteRequirementsModal} from '../components/CompleteRequirementsModal';
import {
  APPLICATION_COLORS,
  APPLICATION_FONTS,
  applicationShadow,
  applicationStatePresentation,
  formatApplicationDate,
} from '../components/applications.ui';

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
    descriptionItems: [],
    requirements: [],
    additionalQualifications: [],
    benefits: [],
    education: 'Tidak ditentukan',
    experience: 'Tidak ditentukan',
    documentRequirements: [],
    familyDeclarationRequired: false,
    familyRequirements: [],
    policies: [],
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
  const {width} = useWindowDimensions();
  const containerWidth = Math.min(width, 720);
  const compact = containerWidth <= 520;
  const pagePadding = containerWidth <= 350 ? 14 : 18;
  const queryClient = useQueryClient();
  const {refreshUser} = useAuth();
  const {isSaved, toggleSaved} = useSavedJobs();
  const applicationsQuery = useApplications();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [shared, setShared] = useState(false);

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

  const cancelMutation = useMutation({mutationFn: applicationsApi.cancel});

  const completeMutation = useMutation({mutationFn: applicationsApi.completeRequirements});

  const cancelApplication = () => {
    setCancelOpen(false);
    void (async () => {
      try {
        await cancelMutation.mutateAsync({applicationId: application!.applicationId, storageKind: application!.storageKind});
        await Promise.all([queryClient.invalidateQueries({queryKey: applicationsKeys.all}), queryClient.invalidateQueries({queryKey: dashboardKeys.home()}), refreshUser()]);
        router.replace('/(candidate)/(tabs)/career');
      } catch (error) {
        Alert.alert('Gagal Membatalkan Lamaran', toAppApiError(error).message);
      }
    })();
  };

  const completeRequirements = (input: Parameters<typeof completeMutation.mutateAsync>[0]) => {
    void (async () => {
      try {
        await completeMutation.mutateAsync(input);
        await Promise.all([queryClient.invalidateQueries({queryKey: applicationsKeys.all}), queryClient.invalidateQueries({queryKey: applicationsKeys.process(baseApplication?.applicationId ?? 0)}), queryClient.invalidateQueries({queryKey: dashboardKeys.home()}), queryClient.invalidateQueries({queryKey: jobsKeys.detail(source, id)}), refreshUser()]);
        setRequirementsOpen(false);
      } catch (error) {
        Alert.alert('Gagal Mengirim Persyaratan', toAppApiError(error).message);
      }
    })();
  };

  if (applicationsQuery.isPending && !application) {
    return (
      <>
        <StatusBar style="light" />
        <ApplicationDetailSkeleton
          bottomInset={insets.bottom}
          containerWidth={containerWidth}
          horizontalPadding={pagePadding}
          topInset={insets.top}
          onBack={() => goBackOrReplace('/(candidate)/(tabs)/career')}
        />
      </>
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
  const saved = isSaved(job.key);
  const submittedLabel = application.state === 'canceled'
    ? `Lamaran dibatalkan pada ${formatApplicationDate(application.canceledAt ?? application.updatedAt)}`
    : `Lamaran dikirim pada ${formatApplicationDate(application.submittedAt)}`;
  const processError = processQuery.isError ? toAppApiError(processQuery.error).message : '';
  const jobError = jobQuery.isError ? toAppApiError(jobQuery.error).message : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, {paddingBottom: Math.max(insets.bottom, 16) + 18}]}>
        <BrandedHeaderBackground
          containerWidth={containerWidth}
          topInset={insets.top}
          variant="compact-detail"
          contentStyle={[styles.headerContent, {paddingTop: insets.top + 8}]}
        >
          <Pressable accessibilityRole="button" accessibilityLabel="Kembali ke Lamaran Saya" onPress={() => goBackOrReplace('/(candidate)/(tabs)/career')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Lamaran</Text>
          <View style={styles.headerSpacer} />
        </BrandedHeaderBackground>

        <View style={[styles.content, {paddingHorizontal: pagePadding}]}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryTop, compact && styles.summaryTopCompact]}>
              <View style={styles.summaryHeader}>
                <View style={styles.companyIcon}><Ionicons name="business-outline" size={27} color={APPLICATION_COLORS.blue} /></View>
                <View style={styles.summaryCopy}>
                  <View style={styles.titleStatusRow}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={[styles.statusBadge, {borderColor: presentation.color, backgroundColor: presentation.background}]}>
                      <Text style={[styles.statusBadgeText, {color: presentation.color}]}>{presentation.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.company}>{job.company}</Text>
                </View>
              </View>
              <View style={styles.summaryActions}>
                <Pressable
                  accessibilityLabel={saved ? 'Hapus dari lowongan disimpan' : 'Simpan lowongan'}
                  accessibilityRole="button"
                  accessibilityState={{selected: saved}}
                  onPress={() => void toggleSaved(job)}
                  style={[styles.bookmarkButton, saved && styles.bookmarkButtonActive]}
                >
                  <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? APPLICATION_COLORS.blue : APPLICATION_COLORS.body} />
                </Pressable>
                <Pressable
                  accessibilityLabel={shared ? 'Lowongan telah dibagikan' : 'Bagikan lowongan'}
                  accessibilityRole="button"
                  onPress={() => {
                    setShared(true);
                    void Share.share({message: `${job.title} di ${job.company} - ${job.location}`}).catch(error => {
                      Alert.alert('Gagal Membagikan Lowongan', error instanceof Error ? error.message : 'Coba lagi beberapa saat lagi.');
                    });
                  }}
                  style={[styles.shareButton, shared && styles.shareButtonActive]}
                >
                  <Ionicons name={shared ? 'share-social' : 'share-social-outline'} size={18} color={shared ? APPLICATION_COLORS.blue : APPLICATION_COLORS.body} />
                  <Text style={[styles.shareButtonText, shared && styles.shareButtonTextActive]}>Bagikan</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.summaryMetadata}>
              <SummaryRow icon="wallet-outline">{job.salaryLabel}</SummaryRow>
              <SummaryRow icon="location-outline">{job.location}</SummaryRow>
              <SummaryRow icon="briefcase-outline">{`${job.contractType} · ${job.workMode}`}</SummaryRow>
              <SummaryRow icon="calendar-outline">{job.closingLabel}</SummaryRow>
            </View>
            <View style={styles.summaryActivity}>
              {!!job.publishedLabel && <Text style={styles.activityText}>{job.publishedLabel}</Text>}
              {!!job.publishedLabel && !!job.updatedLabel && <Text style={styles.activitySeparator}>•</Text>}
              {!!job.updatedLabel && <Text style={styles.activityText}>{job.updatedLabel}</Text>}
              <View style={[styles.submittedPill, {borderColor: presentation.color, backgroundColor: presentation.background}]}>
                <Text style={[styles.submittedPillText, {color: presentation.color}]}>{submittedLabel}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.statusHero, {backgroundColor: presentation.background, borderColor: `${presentation.color}55`}]}>
            <View style={[styles.statusIcon, {backgroundColor: `${presentation.color}18`}]}>
              <Ionicons name={heroCopy.icon} size={23} color={presentation.color} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>{heroCopy.title}</Text>
              <Text style={styles.statusSubtitle}>{heroCopy.subtitle}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tahapan Proses Rekrutmen</Text>
            {!!processError && (
              <View style={styles.partialError}>
                <Ionicons name="information-circle-outline" size={19} color="#A96C00" />
                <Text style={styles.partialErrorText}>{processError}</Text>
                <Pressable accessibilityRole="button" onPress={() => void processQuery.refetch()}><Text style={styles.retryText}>Coba lagi</Text></Pressable>
              </View>
            )}
            {processQuery.isFetching && !processQuery.data
              ? <ApplicationTimelineSkeleton />
              : (
                <ApplicationRecruitmentProgress
                  stages={application.stages}
                  currentStageIndex={processQuery.data?.currentStage.index ?? application.currentStageIndex}
                />
              )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Informasi Lamaran</Text>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}><Text style={styles.infoLabel}>Tanggal melamar</Text><Text style={[styles.infoValue, compact && styles.infoValueCompact]}>{formatApplicationDate(application.submittedAt)}</Text></View>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}><Text style={styles.infoLabel}>Penutupan lowongan</Text><Text style={[styles.infoValue, compact && styles.infoValueCompact]}>{job.closingDate ? formatApplicationDate(job.closingDate, false) : '-'}</Text></View>
            <View style={[styles.infoRow, compact && styles.infoRowCompact]}><Text style={styles.infoLabel}>Terakhir diperbarui</Text><Text style={[styles.infoValue, compact && styles.infoValueCompact]}>{formatApplicationDate(application.updatedAt)}</Text></View>
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={19} color={APPLICATION_COLORS.blue} />
              <Text style={styles.infoBannerText}>Penutupan lowongan tidak otomatis membatalkan lamaran. Status proses mengikuti data rekrutmen HireLoop.</Text>
            </View>
          </View>

          {!!jobError && (
            <View style={styles.partialError}>
              <Ionicons name="information-circle-outline" size={19} color="#A96C00" />
              <Text style={styles.partialErrorText}>Detail pekerjaan belum dapat dimuat: {jobError}</Text>
              <Pressable accessibilityRole="button" onPress={() => void jobQuery.refetch()}><Text style={styles.retryText}>Coba lagi</Text></Pressable>
            </View>
          )}

          {application.state === 'temporary' && application.storageKind === 'applicant-data' ? (
            <Pressable accessibilityRole="button" onPress={() => setRequirementsOpen(true)} style={styles.requirementsButton}>
              <Ionicons name="document-attach-outline" size={20} color="white" />
              <Text style={styles.requirementsButtonText}>Lengkapi Persyaratan</Text>
            </Pressable>
          ) : null}

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
        onConfirm={cancelApplication}
      />
      {requirementsOpen ? <CompleteRequirementsModal
        visible={requirementsOpen}
        applicationId={application.applicationId}
        job={job}
        loading={completeMutation.isPending}
        error={completeMutation.isError ? toAppApiError(completeMutation.error).message : undefined}
        onClose={() => setRequirementsOpen(false)}
        onSubmit={completeRequirements}
      /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: APPLICATION_COLORS.background},
  scrollContent: {backgroundColor: APPLICATION_COLORS.background},
  headerContent: {paddingHorizontal: 14, paddingBottom: 12, flexDirection: 'row', alignItems: 'center'},
  backButton: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {flex: 1, fontFamily: APPLICATION_FONTS.bold, fontSize: 22, color: 'white', textAlign: 'center'},
  headerSpacer: {width: 44},
  content: {
    marginTop: -18,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 15,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: 'white',
  },
  summaryCard: {...applicationShadow, borderRadius: 16, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', padding: 16},
  summaryTop: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12},
  summaryTopCompact: {flexDirection: 'column', alignItems: 'stretch'},
  summaryHeader: {flex: 1, minWidth: 0, flexDirection: 'row', gap: 12},
  companyIcon: {width: 54, height: 54, borderRadius: 14, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  summaryCopy: {flex: 1, minWidth: 0},
  titleStatusRow: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8},
  jobTitle: {minWidth: 0, flexShrink: 1, fontFamily: APPLICATION_FONTS.bold, fontSize: 17, lineHeight: 23, color: APPLICATION_COLORS.navy},
  company: {fontFamily: APPLICATION_FONTS.medium, fontSize: 11.5, lineHeight: 18, color: APPLICATION_COLORS.body, marginTop: 3},
  summaryActions: {flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0},
  bookmarkButton: {width: 42, height: 42, borderRadius: 10, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'},
  bookmarkButtonActive: {borderColor: '#BFD8FF', backgroundColor: '#EDF5FF'},
  shareButtonActive: {borderColor: '#BFD8FF', backgroundColor: '#EDF5FF'},
  shareButton: {height: 42, borderRadius: 10, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12},
  shareButtonText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 10.5, color: APPLICATION_COLORS.body},
  shareButtonTextActive: {color: APPLICATION_COLORS.blue},
  summaryMetadata: {flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 9, marginTop: 14},
  summaryRow: {maxWidth: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 7},
  summaryText: {minWidth: 0, flexShrink: 1, fontFamily: APPLICATION_FONTS.regular, fontSize: 11, lineHeight: 18, color: APPLICATION_COLORS.body},
  summaryActivity: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginTop: 13},
  activityText: {fontFamily: APPLICATION_FONTS.medium, fontSize: 9.5, lineHeight: 15, color: APPLICATION_COLORS.green},
  activitySeparator: {fontFamily: APPLICATION_FONTS.bold, fontSize: 10, color: APPLICATION_COLORS.muted},
  submittedPill: {maxWidth: '100%', minHeight: 28, borderRadius: 14, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 11, paddingVertical: 4},
  submittedPillText: {flexShrink: 1, fontFamily: APPLICATION_FONTS.bold, fontSize: 9.5, lineHeight: 15},
  statusHero: {minHeight: 88, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13},
  statusIcon: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  statusCopy: {flex: 1, minWidth: 0},
  statusBadge: {maxWidth: '100%', minHeight: 26, borderRadius: 13, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 11, paddingVertical: 3},
  statusBadgeText: {flexShrink: 1, fontFamily: APPLICATION_FONTS.bold, fontSize: 9.5, textTransform: 'uppercase'},
  statusTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 14, lineHeight: 20, color: APPLICATION_COLORS.navy},
  statusSubtitle: {fontFamily: APPLICATION_FONTS.regular, fontSize: 11, lineHeight: 17, color: APPLICATION_COLORS.body, marginTop: 2},
  sectionCard: {...applicationShadow, borderRadius: 16, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', padding: 16},
  sectionTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 16, color: APPLICATION_COLORS.navy, marginBottom: 12},
  inlineLoader: {paddingVertical: 12},
  partialError: {flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: '#FFF7DF', padding: 11, marginBottom: 8},
  partialErrorText: {flex: 1, fontFamily: APPLICATION_FONTS.regular, fontSize: 9.5, lineHeight: 15, color: '#7D570F'},
  retryText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 9.5, color: APPLICATION_COLORS.blue},
  infoRow: {minHeight: 34, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12},
  infoRowCompact: {flexDirection: 'column', gap: 3, paddingVertical: 3},
  infoLabel: {flex: 1, fontFamily: APPLICATION_FONTS.medium, fontSize: 11, lineHeight: 17, color: APPLICATION_COLORS.body},
  infoValue: {flex: 1, fontFamily: APPLICATION_FONTS.semibold, fontSize: 10.5, lineHeight: 17, color: APPLICATION_COLORS.navy, textAlign: 'right'},
  infoValueCompact: {flex: 0, width: '100%', textAlign: 'left'},
  infoBanner: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, backgroundColor: '#EAF2FF', padding: 11, marginTop: 8},
  infoBannerText: {flex: 1, fontFamily: APPLICATION_FONTS.regular, fontSize: 9.5, lineHeight: 15, color: '#3C5A82'},
  cancelButton: {height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: APPLICATION_COLORS.red, alignItems: 'center', justifyContent: 'center'},
  cancelButtonText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 12, color: APPLICATION_COLORS.red},
  requirementsButton: {height: 54, borderRadius: 12, backgroundColor: '#C57E00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  requirementsButtonText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 12.5, color: 'white'},
  primaryButton: {height: 54, borderRadius: 12, backgroundColor: APPLICATION_COLORS.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  primaryButtonText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 13, color: 'white'},
  fullState: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: APPLICATION_COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 28},
  fullStateTitle: {fontFamily: APPLICATION_FONTS.bold, fontSize: 17, color: APPLICATION_COLORS.navy, textAlign: 'center', marginTop: 14},
  fullStateText: {fontFamily: APPLICATION_FONTS.regular, fontSize: 11.5, lineHeight: 18, color: APPLICATION_COLORS.body, textAlign: 'center', marginTop: 8},
  stateButton: {height: 46, borderRadius: 11, backgroundColor: APPLICATION_COLORS.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, marginTop: 20},
  stateButtonText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 11.5, color: 'white'},
});
