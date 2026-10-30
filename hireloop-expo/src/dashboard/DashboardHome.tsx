import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import type {CandidateUser} from '../features/auth/auth.types';
import {isCandidateTier2Banned} from '../features/auth/candidate-apply-access';
import type {CandidateApplication} from '../features/applications/applications.types';
import {applicationStatePresentation, formatApplicationDate} from '../features/applications/components/applications.ui';
import type {DashboardInterview} from '../features/dashboard/dashboard.types';
import {useDashboardHome} from '../features/dashboard/hooks/use-dashboard-home';
import {useSavedJobs} from '../features/jobs/saved-jobs-provider';
import type {JobCardModel} from '../features/jobs/jobs.types';
import {CandidateEvaluationNotice} from './components/CandidateEvaluationNotice';
import {
  getDashboardHeroLayout,
  getDashboardSummaryGlyphSize,
  getDashboardSummaryIconRadius,
  getDashboardSummaryIconSize,
  getDashboardSummaryOverlap,
} from './dashboard.layout';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

const C = {
  background: '#F7F8FC',
  card: '#FFFFFF',
  navy: '#00195E',
  blue: '#0051C8',
  brightBlue: '#146CFF',
  cyan: '#00C9F2',
  green: '#00C98B',
  purple: '#8B52F5',
  orange: '#FF7A00',
  red: '#F20D2F',
  ink: '#111318',
  muted: '#666C78',
  border: '#EAEDF3',
};

type DashboardHomeProps = {
  onEvaluationClose?: () => void;
  openEvaluation?: boolean;
  initialUser: CandidateUser;
  onLogout: () => Promise<void> | void;
  onNavigate?: (route: DashboardRoute) => void;
};

export type DashboardRoute =
  | '/profile'
  | '/(candidate)/(tabs)/jobs'
  | '/(candidate)/(tabs)/career'
  | '/(candidate)/(tabs)/notifications'
  | '/(candidate)/jobs/saved';

const shortcutItems = [
  {label: 'Profil Saya', icon: 'person-outline' as const, route: '/profile'},
  {label: 'Lowongan Kerja', icon: 'briefcase-outline' as const, route: '/(candidate)/(tabs)/jobs'},
  {label: 'Lamaran Saya', icon: 'document-text-outline' as const, route: '/(candidate)/(tabs)/career'},
  {label: 'Performance', icon: 'stats-chart-outline' as const},
];

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
const staticProfileCompletion = 75;

function resolveMediaUrl(value: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const serverUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, '');
  return serverUrl ? `${serverUrl}/${value.replace(/^\//, '')}` : null;
}

function SectionHeader({title, onPress}: {title: string; onPress: () => void}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.seeAllButton}>
        <Text style={styles.seeAll}>Lihat semua</Text>
        <Ionicons name="chevron-forward" size={15} color={C.brightBlue} />
      </Pressable>
    </View>
  );
}

function DashboardHero({user, unread, onNavigate}: {user: CandidateUser; unread: number; onNavigate?: (route: DashboardRoute) => void}) {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const layout = getDashboardHeroLayout(width);
  const firstName = user.full_name?.trim().split(/\s+/)[0] || 'Kandidat';
  const avatarUrl = resolveMediaUrl(user.avatar_url);
  const initials = user.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'HL';

  return (
    <ImageBackground
      source={require('../assets/dashboard_home.png')}
      resizeMode="cover"
      style={[styles.hero, {height: layout.heroHeight}]}
      imageStyle={styles.heroImage}
      accessibilityIgnoresInvertColors
      testID="dashboard-hero"
    >
      <View
        testID="dashboard-hero-copy"
        style={[
          styles.heroCopy,
          {
            left: layout.horizontalPadding,
            top: Math.max(insets.top + 12, layout.contentTop),
            width: layout.compact ? '62%' : layout.wide ? '55%' : '58%',
          },
        ]}
      >
        <Image
          source={require('../assets/HireLoopLogo.png')}
          resizeMode="contain"
          style={{width: layout.logoWidth, height: layout.logoHeight}}
          accessibilityLabel="HireLoop"
        />
        <Text style={[styles.greetingTitle, layout.compact && styles.greetingTitleCompact, layout.wide && styles.greetingTitleWide]}>Hi, {firstName}</Text>
        <Text style={[styles.greetingSubtitle, layout.compact && styles.greetingSubtitleCompact, layout.wide && styles.greetingSubtitleWide]}>Temukan peluang terbaik{`\n`}untuk karirmu hari ini</Text>
      </View>
      <View
        style={[
          styles.heroActions,
          {right: layout.horizontalPadding, top: insets.top + 12},
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${unread} notifikasi belum dibaca`}
          onPress={() => onNavigate?.('/(candidate)/(tabs)/notifications')}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications" size={25} color="white" />
          {unread > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </Pressable>
        <Pressable accessibilityLabel="Buka Profil Saya" accessibilityRole="button" onPress={() => onNavigate?.('/profile')} style={styles.avatarButton}>
          {avatarUrl ? (
            <Image source={{uri: avatarUrl}} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

export function SummaryCard({applications, interviewsCount, savedCount, viewportWidth, onNavigate}: {
  applications: CandidateApplication[];
  interviewsCount: number;
  savedCount: number;
  viewportWidth: number;
  onNavigate?: (route: DashboardRoute) => void;
}) {
  const iconSize = getDashboardSummaryIconSize(viewportWidth);
  const iconRadius = getDashboardSummaryIconRadius(viewportWidth);
  const iconGlyphSize = getDashboardSummaryGlyphSize(viewportWidth);
  const overlap = getDashboardSummaryOverlap(viewportWidth);
  const summaryItems = [
    {label: 'Total Lamaran', value: applications.length, color: C.navy, icon: 'document-text' as const, route: '/(candidate)/(tabs)/career' as const},
    {label: 'Dalam Seleksi', value: applications.filter(item => ['in-progress', 'transferred'].includes(item.state)).length, color: C.green, icon: 'people' as const, route: '/(candidate)/(tabs)/career' as const},
    {label: 'Interview Mendatang', value: interviewsCount, color: C.purple, icon: 'calendar' as const, disabled: true},
    {label: 'Lowongan Disimpan', value: savedCount, color: C.orange, icon: 'bookmark' as const, route: '/(candidate)/jobs/saved' as const},
  ];

  return (
    <View testID="dashboard-summary-card" style={[styles.summaryGrid, {marginTop: -overlap}]}>
      {summaryItems.map((item, index) => (
        <Pressable
          key={item.label}
          testID={`dashboard-summary-item-${index}`}
          accessibilityRole="button"
          accessibilityLabel={`${item.value} ${item.label}`}
          accessibilityState={{disabled: item.disabled}}
          disabled={item.disabled}
          onPress={() => item.route && onNavigate?.(item.route)}
          style={({pressed}) => [styles.summaryItem, item.disabled && styles.summaryDisabled, pressed && styles.pressed]}
        >
          <View testID={`dashboard-summary-icon-shadow-${index}`} style={[styles.summaryIconShadow, {borderRadius: iconRadius, height: iconSize, shadowColor: item.color, width: iconSize}]}>
            <View testID={`dashboard-summary-icon-${index}`} style={[styles.summaryIcon, {backgroundColor: item.color, borderRadius: iconRadius}]}>
              <Ionicons name={item.icon} size={iconGlyphSize} color="white" />
            </View>
          </View>
          <View style={styles.summaryCopy}>
            <Text testID={`dashboard-summary-value-${index}`} style={styles.summaryValue}>{item.value}</Text>
            <Text testID={`dashboard-summary-label-${index}`} numberOfLines={2} style={styles.summaryLabel}>{item.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={item.disabled ? '#A6B0C1' : C.brightBlue} />
        </Pressable>
      ))}
    </View>
  );
}

export function ProfileCompletionCard({completion, onOpenProfile}: {completion: number; onOpenProfile?: () => void}) {
  const {width} = useWindowDimensions();
  const compact = width < 360;

  if (completion >= 100) return null;

  return (
    <View style={[styles.profileCard, compact && styles.profileCardCompact]}>
      <View style={styles.profileCopy}>
        <Text style={[styles.profileTitle, compact && styles.profileTitleCompact]}>Lengkapi Profilmu</Text>
        <Text style={[styles.profileDescription, compact && styles.profileDescriptionCompact]}>Lengkapi data dan pengalaman kerjamu{`\n`}untuk meningkatkan peluang dipanggil interview!</Text>
        <View style={styles.progressHeader}>
          <View />
          <Text style={styles.progressValue}>{completion}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${completion}%`}]} />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenProfile}
          style={styles.profileButton}
        >
          <LinearGradient
            colors={['#0145C0', '#00205A']}
            end={{x: 1, y: 0}}
            start={{x: 0, y: 0}}
            style={styles.profileButtonGradient}
            testID="profile-completion-gradient"
          >
            <Text style={styles.profileButtonText}>Lengkapi sekarang</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="Ilustrasi kelengkapan profil"
        resizeMode="contain"
        source={require('../assets/profil_complete.png')}
        style={[styles.profileIllustration, compact && styles.profileIllustrationCompact]}
        testID="profile-completion-illustration"
      />
    </View>
  );
}

function getRelativeDayLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Jadwal';

  const today = new Date();
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const interviewDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const difference = Math.round((interviewDay - currentDay) / 86_400_000);

  if (difference === 0) return 'Hari ini';
  if (difference === 1) return 'Besok';
  return difference > 1 ? `${difference} hari lagi` : 'Terlewat';
}

function InterviewContent({interview}: {interview?: DashboardInterview}) {
  if (!interview) {
    return (
      <View style={styles.emptyActivity}>
        <Ionicons name="calendar-outline" size={30} color="#A3ADC0" />
        <Text style={styles.emptyTitle}>Belum ada interview mendatang</Text>
        <Text style={styles.emptyText}>Aktivitas terbaru akan tampil di bagian ini.</Text>
      </View>
    );
  }

  const date = new Date(`${interview.date}T00:00:00`);
  const day = Number.isNaN(date.getTime()) ? '--' : String(date.getDate()).padStart(2, '0');
  const month = Number.isNaN(date.getTime()) ? '---' : monthNames[date.getMonth()];

  return (
    <View style={styles.interviewContent}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateDay}>{day}</Text>
        <Text style={styles.dateMonth}>{month}</Text>
        <Text style={styles.dateRelative}>{getRelativeDayLabel(interview.date)}</Text>
        <Text style={styles.dateTime}>{interview.time ? `${interview.time} WIB` : 'Waktu menyusul'}</Text>
      </View>
      <View style={styles.interviewDetail}>
        <View style={styles.activityTopline}>
          <Text numberOfLines={1} style={styles.activityRole}>{interview.role_taxonomy_name}</Text>
          <Ionicons name="chevron-forward" size={20} color={C.brightBlue} />
        </View>
        <Text numberOfLines={1} style={styles.activityCompany}>{interview.company_name ?? 'HireLoop Recruitment'}  <Ionicons name="checkmark-circle" size={13} color={C.brightBlue} /></Text>
        <View style={styles.activityMode}>
          <Ionicons name={interview.mode === 'online' ? 'videocam-outline' : 'location-outline'} size={17} color={C.blue} />
          <Text numberOfLines={1} style={styles.activityModeText}>{interview.mode === 'online' ? 'Online · Zoom' : interview.location ?? 'Interview Offline'}</Text>
          {interview.mode === 'online' && <View style={styles.zoomBadge}><Text style={styles.zoomBadgeText}>zoom</Text></View>}
        </View>
        <View style={styles.interviewButtons}>
          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert('Gabung Interview', interview.meeting_link ?? 'Tautan interview belum tersedia.')}
            style={styles.joinButton}
          >
            <Text style={styles.joinButtonText}>Gabung Interview</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert(interview.agenda, interview.location ?? 'Detail interview')}
            style={styles.detailInterviewButton}
          >
            <Text style={styles.detailInterviewText}>Detail</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function NearestInterviewCard({interviews}: {interviews: DashboardInterview[]}) {
  return (
    <View>
      <SectionHeader title="Interview Terdekat" onPress={() => Alert.alert('Interview', 'Buka seluruh jadwal interview.')} />
      <View style={styles.interviewCard}>
        <InterviewContent interview={interviews[0]} />
      </View>
    </View>
  );
}

export function ShortcutGrid({onNavigate}: {onNavigate?: (route: DashboardRoute) => void} = {}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Pintasan</Text>
      <View style={styles.shortcuts}>
        {shortcutItems.map(item => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={`Buka ${item.label}`}
            onPress={() => item.route
              ? onNavigate?.(item.route as DashboardRoute)
              : Alert.alert(item.label, `Halaman ${item.label} akan tersedia pada pembaruan berikutnya.`)}
            style={({pressed}) => [styles.shortcut, pressed && styles.pressed]}
          >
            <Ionicons name={item.icon} size={31} color={C.brightBlue} />
            <Text style={styles.shortcutLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function RecentApplicationsCard({applications, onOpen, onOpenAll}: {
  applications: CandidateApplication[];
  onOpen?: (application: CandidateApplication) => void;
  onOpenAll?: () => void;
}) {
  const {width} = useWindowDimensions();
  const compact = width < 360;
  const recent = [...applications]
    .sort((left, right) => (Date.parse(right.updatedAt ?? right.submittedAt ?? '') || 0) - (Date.parse(left.updatedAt ?? left.submittedAt ?? '') || 0))
    .slice(0, 3);

  return (
    <View testID="dashboard-recent-applications">
      <SectionHeader title="Lamaran Terbaru" onPress={() => onOpenAll?.()} />
      <View style={styles.recentApplicationsCard}>
        {!recent.length && (
          <View style={styles.recentEmpty}>
            <Ionicons name="document-text-outline" size={29} color="#93A1B6" />
            <Text style={styles.emptyTitle}>Belum ada lamaran</Text>
            <Text style={styles.emptyText}>Lamaran yang kamu kirim akan tampil di bagian ini.</Text>
          </View>
        )}
        {recent.map((application, index) => {
          const presentation = applicationStatePresentation(application.state, application.currentStageLabel);
          return (
            <Pressable
              key={application.applicationId}
              accessibilityRole="button"
              accessibilityLabel={`${application.title} di ${application.company}, ${presentation.label}`}
              onPress={() => onOpen?.(application)}
              style={({pressed}) => [styles.recentApplicationRow, index < recent.length - 1 && styles.recentApplicationDivider, pressed && styles.pressed]}
            >
              <View
                accessibilityLabel={`Ikon perusahaan ${application.company}`}
                style={[styles.recentCompanyLogo, compact && styles.recentCompanyLogoCompact]}
                testID="recent-application-company-icon"
              >
                <Ionicons name="business-outline" size={compact ? 22 : 25} color={C.brightBlue} />
              </View>
              <View style={styles.recentApplicationCopy}>
                <Text numberOfLines={1} style={styles.recentApplicationTitle}>{application.title}</Text>
                <View style={styles.recentCompanyRow}>
                  <Text numberOfLines={1} style={styles.recentCompanyName}>{application.company}</Text>
                </View>
                <Text style={styles.recentApplicationDate}>{formatApplicationDate(application.updatedAt ?? application.submittedAt, false)}</Text>
              </View>
              <View style={[styles.recentStatus, compact && styles.recentStatusCompact, {backgroundColor: presentation.background}]}>
                <View style={[styles.recentStatusDot, {backgroundColor: presentation.color}]} />
                <Text numberOfLines={1} style={[styles.recentStatusText, {color: presentation.color}]}>{presentation.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={19} color={C.brightBlue} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function JobCard({job, width, saved, applyBlocked = false, onApply, onOpen, onShare, onToggleSaved}: {
  job: JobCardModel;
  width: number;
  saved: boolean;
  applyBlocked?: boolean;
  onApply: () => void;
  onOpen: () => void;
  onShare: () => void;
  onToggleSaved: () => void;
}) {
  const visibleSkills = job.skills.slice(0, 4);
  const hiddenSkillCount = Math.max(0, job.skills.length - visibleSkills.length);
  const workMode = job.workType || 'On Site';
  const applyUnavailable = applyBlocked || !job.active;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lowongan ${job.title} di ${job.company}`}
      onPress={onOpen}
      style={[styles.jobCard, {width}]}
      testID="dashboard-job-card"
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobCategoryIcon}>
          <Ionicons name="business-outline" size={25} color={C.brightBlue} />
        </View>
        <View style={styles.jobTitleWrap}>
          <Text numberOfLines={1} style={styles.jobTitle}>{job.title}</Text>
          <Text numberOfLines={1} style={styles.companyName}>{job.company}</Text>
        </View>
        <View style={styles.jobActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Hapus dari tersimpan' : 'Simpan lowongan'}
            onPress={event => {
              event.stopPropagation();
              onToggleSaved();
            }}
            hitSlop={8}
          >
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color="#63728A" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bagikan lowongan"
            onPress={event => {
              event.stopPropagation();
              onShare();
            }}
            hitSlop={8}
          >
            <Ionicons name="share-social-outline" size={20} color="#63728A" />
          </Pressable>
        </View>
      </View>

      <View style={styles.jobBadgeRow}>
        <View style={[styles.activeBadge, !job.active && styles.inactiveBadge]}>
          <Text style={[styles.activeBadgeText, !job.active && styles.inactiveBadgeText]}>{job.active ? 'Aktif' : 'Tidak aktif'}</Text>
        </View>
        {job.urgent && (
          <View style={styles.urgentBadge}>
            <Ionicons name="flame" size={12} color="#FF3B48" />
            <Text style={styles.urgentText}>Dibutuhkan Segera</Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={16} color={C.brightBlue} />
        <Text numberOfLines={1} style={styles.metaText}>{job.location}</Text>
        <Text style={styles.metaDot}>{'\u2022'}</Text>
        <Ionicons name="briefcase-outline" size={16} color={C.brightBlue} />
        <Text style={styles.metaText}>{job.contractType}</Text>
        <View style={styles.metaSeparator} />
        <Text numberOfLines={1} style={styles.metaText}>{workMode}</Text>
      </View>
      <View style={styles.salaryRow}>
        <Ionicons name="cash-outline" size={16} color={C.blue} />
        <Text numberOfLines={1} style={styles.salaryText}>{job.salary}</Text>
      </View>

      <View style={styles.skillWrap}>
        {visibleSkills.map(skill => <View key={skill} style={styles.skillChip}><Text style={styles.skillText}>{skill}</Text></View>)}
        {hiddenSkillCount > 0 && <View style={styles.skillChip}><Text style={styles.skillText}>+{hiddenSkillCount}</Text></View>}
      </View>

      <View style={styles.jobStats}>
        <View style={styles.jobStatItem}>
          <Ionicons name="people-outline" size={18} color="#52627A" />
          <View>
            <Text style={styles.jobStatValue}>{job.applicantsCount}</Text>
            <Text style={styles.jobStatLabel}>Total Pelamar</Text>
          </View>
        </View>
        <View style={styles.jobStatDivider} />
        <View style={styles.jobDeadline}>
          <Ionicons name="calendar-outline" size={17} color="#52627A" />
          <Text numberOfLines={1} style={styles.jobDeadlineText}>{job.closingLabel}</Text>
        </View>
      </View>

      <View style={styles.jobDivider} />
      <View style={styles.timestamps}>
        <Text style={styles.timestamp}>{job.publishedLabel}</Text>
        <Text style={styles.timestampDot}>{'\u2022'}</Text>
        <Text style={styles.timestamp}>{job.updatedLabel}</Text>
      </View>
      <View style={styles.jobDivider} />

      <View style={styles.jobButtons}>
        <Pressable
          accessibilityLabel={applyBlocked ? 'Akun terblokir untuk melamar' : 'Lamar sekarang'}
          accessibilityRole="button"
          accessibilityState={{disabled: applyUnavailable}}
          onPress={event => {
            event?.stopPropagation();
            if (applyUnavailable) return;
            onApply();
          }}
          style={[styles.applyButton, applyBlocked && styles.blockedApplyButton, !job.active && styles.disabledApplyButton]}
          testID="dashboard-job-apply-button"
        >
          {applyBlocked && <Ionicons name="shield-checkmark-outline" size={16} color="white" />}
          <Text style={styles.applyButtonText}>{applyBlocked ? 'Akun Terblokir' : 'Lamar sekarang'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={event => {
            event.stopPropagation();
            onOpen();
          }}
          hitSlop={8}
          style={styles.detailButton}
          testID="dashboard-job-detail-button"
        >
          <Text style={styles.detailButtonText}>Lihat Detail  {'\u203A'}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function DashboardHome({initialUser, onEvaluationClose, onNavigate, openEvaluation = false}: DashboardHomeProps) {
  const {width: viewportWidth} = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const width = measuredWidth ?? Math.min(viewportWidth, 720);
  const {applications, candidate, interviews, jobs, unread, jobsLoading, refreshing, error, refresh} = useDashboardHome();
  const {hydrated: savedHydrated, isSaved, savedCount, toggleSaved} = useSavedJobs();
  const cardWidth = Math.min(Math.max(width * 0.84, 280), 370);
  const applyBlocked = isCandidateTier2Banned(candidate ?? initialUser);

  const recommendationContent = useMemo(() => {
    if (jobsLoading) {
      return <View style={styles.loadingJobs}><ActivityIndicator color={C.blue} /><Text style={styles.loadingText}>Memuat rekomendasi...</Text></View>;
    }

    if (!jobs.length) {
      return (
        <View style={styles.emptyJobs}>
          <Ionicons name="search-outline" size={31} color="#A3ADC0" />
          <Text style={styles.emptyTitle}>Belum ada rekomendasi</Text>
          <Text style={styles.emptyText}>Lengkapi preferensi pekerjaan untuk mendapatkan rekomendasi.</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.jobsContent}
        snapToInterval={cardWidth + 14}
        decelerationRate="fast"
      >
        {jobs.map(job => (
          <JobCard
            key={job.key}
            job={job}
            width={cardWidth}
            saved={isSaved(job.key)}
            applyBlocked={applyBlocked}
            onApply={() => router.push({pathname: '/(candidate)/jobs/[source]/[id]', params: {source: job.source, id: String(job.id), intent: 'apply'}} as never)}
            onOpen={() => router.push({pathname: '/(candidate)/jobs/[source]/[id]', params: {source: job.source, id: String(job.id)}} as never)}
            onShare={() => void Share.share({message: `${job.title} di ${job.company} - ${job.location}`})}
            onToggleSaved={() => toggleSaved(job)}
          />
        ))}
      </ScrollView>
    );
  }, [applyBlocked, cardWidth, isSaved, jobs, jobsLoading, toggleSaved]);

  return (
    <View
      style={styles.screen}
      onLayout={event => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        if (nextWidth > 0) setMeasuredWidth(current => current === nextWidth ? current : nextWidth);
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={C.blue} colors={[C.blue]} />}
        contentContainerStyle={styles.scrollContent}
      >
        <DashboardHero user={candidate ?? initialUser} unread={unread} onNavigate={onNavigate} />
        <View style={styles.content}>
          <SummaryCard
            applications={applications}
            interviewsCount={interviews.length}
            savedCount={savedHydrated ? savedCount : 0}
            viewportWidth={width}
            onNavigate={onNavigate}
          />

          {!!error && (
            <Pressable accessibilityRole="button" onPress={() => void refresh()} style={styles.errorBanner}>
              <Ionicons name="cloud-offline-outline" size={20} color="#A35A00" />
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText}>Coba lagi</Text>
            </Pressable>
          )}

          <CandidateEvaluationNotice
            initiallyVisible={openEvaluation}
            notice={candidate?.blacklist_info ?? initialUser.blacklist_info ?? null}
            onInitialOpenHandled={onEvaluationClose}
          />
          <NearestInterviewCard interviews={interviews} />
          <ProfileCompletionCard completion={staticProfileCompletion} onOpenProfile={() => onNavigate?.('/profile')} />
          <ShortcutGrid onNavigate={onNavigate} />
          <RecentApplicationsCard
            applications={applications}
            onOpen={application => router.push({pathname: '/(candidate)/applications/[source]/[id]', params: {source: application.source, id: String(application.referenceId)}} as never)}
            onOpenAll={() => onNavigate?.('/(candidate)/(tabs)/career')}
          />

          <View>
            <SectionHeader title="Rekomendasi Pekerjaan" onPress={() => onNavigate?.('/(candidate)/(tabs)/jobs')} />
            {recommendationContent}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const cardShadow = {
  shadowColor: '#152C5B',
  shadowOffset: {width: 0, height: 5},
  shadowOpacity: 0.12,
  shadowRadius: 10,
  elevation: 4,
};

const shortcutShadow = {
  shadowColor: '#36517F',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: C.background},
  scrollContent: {paddingBottom: 24},
  hero: {width: '100%', overflow: 'hidden'},
  heroImage: {backgroundColor: C.navy},
  heroCopy: {position: 'absolute', alignItems: 'flex-start'},
  heroActions: {position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 12},
  notificationButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  notificationBadge: {position: 'absolute', top: 0, right: -2, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: 'white'},
  notificationBadgeText: {fontFamily: F.bold, fontSize: 10, color: 'white'},
  avatarButton: {width: 44, height: 44, borderRadius: 22},
  avatar: {width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'white'},
  avatarFallback: {width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'white', backgroundColor: '#E7F0FF', alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontFamily: F.bold, fontSize: 15, color: C.blue},
  greetingTitle: {fontFamily: F.bold, fontSize: 36, lineHeight: 43, color: 'white', letterSpacing: -1.2, marginTop: 28, textAlign: 'left'},
  greetingTitleCompact: {fontSize: 30, lineHeight: 37, marginTop: 20},
  greetingTitleWide: {fontSize: 42, lineHeight: 50},
  greetingSubtitle: {fontFamily: F.regular, fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.92)', marginTop: 7},
  greetingSubtitleCompact: {fontSize: 12, lineHeight: 19, marginTop: 5},
  greetingSubtitleWide: {fontSize: 16, lineHeight: 26},
  content: {paddingHorizontal: 20, gap: 28},
  summaryGrid: {zIndex: 3, elevation: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  summaryItem: {...cardShadow, flexBasis: '47%', flexGrow: 1, minWidth: 130, minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 14},
  summaryDisabled: {opacity: 0.58},
  summaryIconShadow: {flexShrink: 0, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.22, shadowRadius: 5, elevation: 3},
  summaryIcon: {width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'},
  summaryCopy: {flex: 1, minWidth: 0},
  summaryValue: {fontFamily: F.bold, fontSize: 24, lineHeight: 29, color: C.ink},
  summaryLabel: {fontFamily: F.medium, fontSize: 10.5, lineHeight: 14, color: '#252A35'},
  errorBanner: {flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFF5E7', borderRadius: 13, padding: 13, marginTop: -8},
  errorText: {fontFamily: F.regular, fontSize: 11, lineHeight: 16, color: '#805219', flex: 1},
  retryText: {fontFamily: F.bold, fontSize: 10, color: C.blue},
  profileCard: {...cardShadow, backgroundColor: 'white', borderRadius: 18, padding: 20, minHeight: 210, flexDirection: 'row', overflow: 'hidden'},
  profileCardCompact: {paddingHorizontal: 15},
  profileCopy: {flex: 1, zIndex: 2},
  profileTitle: {fontFamily: F.bold, fontSize: 20, color: C.ink},
  profileTitleCompact: {fontSize: 17},
  profileDescription: {fontFamily: F.regular, fontSize: 12, lineHeight: 19, color: '#333943', marginTop: 9},
  profileDescriptionCompact: {fontSize: 10, lineHeight: 16},
  progressHeader: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 1},
  progressValue: {fontFamily: F.bold, fontSize: 17, color: C.ink},
  progressTrack: {height: 7, borderRadius: 5, backgroundColor: '#EEF0F4', marginTop: 4, width: '100%', overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: 5, backgroundColor: C.blue},
  profileButton: {height: 42, minWidth: 156, borderRadius: 10, alignSelf: 'flex-start', marginTop: 20, overflow: 'hidden'},
  profileButtonGradient: {flex: 1, width: '100%', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center'},
  profileButtonText: {fontFamily: F.semibold, fontSize: 11, color: 'white'},
  profileIllustration: {width: 132, height: 160, marginLeft: 10, alignSelf: 'center'},
  profileIllustrationCompact: {width: 88, height: 132, marginLeft: 5},
  interviewCard: {...cardShadow, backgroundColor: 'white', borderRadius: 18, padding: 14, marginTop: 13, overflow: 'hidden'},
  interviewContent: {flexDirection: 'row', minHeight: 150},
  dateBlock: {width: 92, borderRadius: 12, backgroundColor: '#0643AA', alignItems: 'center', justifyContent: 'center', paddingVertical: 11},
  dateDay: {fontFamily: F.bold, fontSize: 31, lineHeight: 34, color: 'white'},
  dateMonth: {fontFamily: F.regular, fontSize: 17, color: 'white'},
  dateRelative: {fontFamily: F.medium, fontSize: 10.5, color: 'rgba(255,255,255,0.9)', marginTop: 7},
  dateTime: {fontFamily: F.medium, fontSize: 9, color: 'white', marginTop: 3},
  interviewDetail: {flex: 1, minWidth: 0, paddingLeft: 14, paddingVertical: 3},
  activityTopline: {flexDirection: 'row', alignItems: 'center'},
  activityRole: {fontFamily: F.bold, fontSize: 16, color: C.ink, flex: 1},
  activityCompany: {fontFamily: F.regular, fontSize: 10.5, color: C.muted, marginTop: 3},
  activityMode: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10},
  activityModeText: {fontFamily: F.medium, fontSize: 10.5, color: '#454B57', flexShrink: 1},
  zoomBadge: {backgroundColor: '#2D68FF', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2},
  zoomBadgeText: {fontFamily: F.bold, fontSize: 6.5, color: 'white'},
  interviewButtons: {flexDirection: 'row', gap: 8, marginTop: 'auto', paddingTop: 10},
  joinButton: {flex: 1.5, minHeight: 37, borderRadius: 9, backgroundColor: '#0345AE', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7},
  joinButtonText: {fontFamily: F.semibold, fontSize: 9.5, color: 'white'},
  detailInterviewButton: {flex: 1, minHeight: 37, borderRadius: 9, backgroundColor: '#EEF3FC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7},
  detailInterviewText: {fontFamily: F.semibold, fontSize: 9.5, color: C.blue},
  emptyActivity: {minHeight: 130, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25},
  emptyTitle: {fontFamily: F.semibold, fontSize: 13, color: C.ink, marginTop: 9, textAlign: 'center'},
  emptyText: {fontFamily: F.regular, fontSize: 10.5, lineHeight: 16, color: C.muted, marginTop: 4, textAlign: 'center'},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  sectionTitle: {fontFamily: F.bold, fontSize: 19, color: C.ink},
  seeAllButton: {flexDirection: 'row', alignItems: 'center', gap: 2},
  seeAll: {fontFamily: F.semibold, fontSize: 10, color: C.blue},
  shortcuts: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 9},
  shortcut: {...shortcutShadow, flex: 1, minWidth: 0, minHeight: 98, borderRadius: 14, backgroundColor: '#EAF3FF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, paddingVertical: 12},
  shortcutLabel: {fontFamily: F.medium, fontSize: 10.5, lineHeight: 14, color: '#164DB7', marginTop: 8, textAlign: 'center'},
  recentApplicationsCard: {...cardShadow, backgroundColor: 'white', borderRadius: 18, marginTop: 14, paddingHorizontal: 16, overflow: 'hidden'},
  recentEmpty: {minHeight: 140, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
  recentApplicationRow: {minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12},
  recentApplicationDivider: {borderBottomWidth: 1, borderBottomColor: C.border},
  recentCompanyLogo: {width: 48, height: 48, borderRadius: 13, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  recentCompanyLogoCompact: {width: 42, height: 42, borderRadius: 12},
  recentApplicationCopy: {flex: 1, minWidth: 0},
  recentApplicationTitle: {fontFamily: F.bold, fontSize: 13.5, lineHeight: 18, color: C.ink},
  recentCompanyRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2},
  recentCompanyName: {fontFamily: F.regular, fontSize: 10.5, lineHeight: 15, color: C.muted, flexShrink: 1},
  recentApplicationDate: {fontFamily: F.regular, fontSize: 9, lineHeight: 13, color: '#8A919D', marginTop: 1},
  recentStatus: {maxWidth: 116, minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 16, paddingHorizontal: 10, flexShrink: 0},
  recentStatusCompact: {maxWidth: 86, gap: 4, paddingHorizontal: 7},
  recentStatusScreening: {backgroundColor: '#EAF2FF'},
  recentStatusApplied: {backgroundColor: '#F0F2F5'},
  recentStatusDot: {width: 7, height: 7, borderRadius: 4},
  recentStatusDotScreening: {backgroundColor: C.brightBlue},
  recentStatusDotApplied: {backgroundColor: '#8A919D'},
  recentStatusText: {fontFamily: F.semibold, fontSize: 8.5},
  recentStatusTextScreening: {color: C.brightBlue},
  recentStatusTextApplied: {color: '#69717D'},
  pressed: {opacity: 0.78, transform: [{scale: 0.98}]},
  jobsContent: {paddingTop: 16, paddingBottom: 8, gap: 14, paddingRight: 18},
  loadingJobs: {height: 210, alignItems: 'center', justifyContent: 'center', gap: 9},
  loadingText: {fontFamily: F.regular, fontSize: 11, color: C.muted},
  emptyJobs: {height: 185, backgroundColor: 'white', borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35, marginTop: 16},
  jobCard: {...cardShadow, backgroundColor: 'white', borderRadius: 18, borderWidth: 1, borderColor: '#EDF1F7', padding: 17, minHeight: 440},
  jobHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  jobCategoryIcon: {width: 48, height: 48, borderRadius: 12, backgroundColor: '#EEF5FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  jobTitleWrap: {flex: 1},
  jobTitle: {fontFamily: F.bold, fontSize: 15.5, lineHeight: 20, color: C.ink},
  companyName: {fontFamily: F.regular, fontSize: 10.5, color: C.muted, marginTop: 3},
  jobActions: {flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0},
  jobBadgeRow: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 16},
  activeBadge: {borderRadius: 14, backgroundColor: '#E5FAF1', paddingHorizontal: 12, paddingVertical: 6},
  activeBadgeText: {fontFamily: F.semibold, fontSize: 9, color: '#00A968'},
  inactiveBadge: {backgroundColor: '#EEF0F4'},
  inactiveBadgeText: {color: '#747C89'},
  urgentBadge: {flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0F2', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6},
  urgentText: {fontFamily: F.medium, fontSize: 8.5, color: '#FF3B48'},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: 16},
  metaText: {fontFamily: F.regular, fontSize: 9.5, color: '#52627A', maxWidth: 145},
  metaDot: {fontFamily: F.regular, color: '#A8B2C1', marginHorizontal: 2},
  metaSeparator: {width: 1, height: 16, backgroundColor: '#D9DFE8', marginHorizontal: 3},
  salaryRow: {flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 11},
  salaryText: {fontFamily: F.semibold, fontSize: 11.5, color: '#074FE6', flex: 1},
  skillWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 17},
  skillChip: {backgroundColor: '#EEF4FF', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6},
  skillText: {fontFamily: F.medium, fontSize: 8.5, color: '#2261D6'},
  jobStats: {flexDirection: 'row', alignItems: 'center', marginTop: 18, minHeight: 43},
  jobStatItem: {flexDirection: 'row', alignItems: 'center', gap: 7, paddingRight: 14},
  jobStatValue: {fontFamily: F.semibold, fontSize: 10, color: C.ink},
  jobStatLabel: {fontFamily: F.regular, fontSize: 7.5, color: '#8892A2', marginTop: 1},
  jobStatDivider: {width: 1, height: 34, backgroundColor: '#E3E7EE'},
  jobDeadline: {flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 7, paddingLeft: 14},
  jobDeadlineText: {fontFamily: F.regular, fontSize: 9, color: '#68768B', flex: 1},
  timestamps: {flexDirection: 'row', alignItems: 'center', gap: 7},
  timestamp: {fontFamily: F.medium, fontSize: 8, color: '#00A968'},
  timestampDot: {fontFamily: F.regular, color: '#CDD1D8'},
  jobDivider: {height: 1, backgroundColor: C.border, marginVertical: 14},
  jobButtons: {flexDirection: 'row', alignItems: 'center', gap: 8},
  applyButton: {flex: 1.65, height: 40, borderRadius: 10, backgroundColor: '#0345AE', paddingHorizontal: 12, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center'},
  blockedApplyButton: {backgroundColor: '#D92D45'},
  disabledApplyButton: {opacity: 0.5},
  applyButtonText: {fontFamily: F.bold, fontSize: 10.5, color: 'white'},
  detailButton: {flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4},
  detailButtonText: {fontFamily: F.bold, fontSize: 12.5, color: C.blue, textAlign: 'center'},
  bottomNav: {...cardShadow, minHeight: 68, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#EFF1F5', flexDirection: 'row', paddingTop: 9, paddingHorizontal: 7},
  bottomNavItem: {flex: 1, minHeight: 49, alignItems: 'center', justifyContent: 'center', gap: 3},
  bottomLabel: {fontFamily: F.medium, fontSize: 8.5, color: '#A1A7B2'},
  bottomLabelActive: {fontFamily: F.bold, color: C.blue},
  bottomBadge: {position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, right: -1, top: 0, borderWidth: 1, borderColor: 'white'},
});
