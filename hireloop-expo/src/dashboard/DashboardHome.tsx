import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import type {CandidateUser} from '../features/auth/auth.types';
import type {DashboardInterview} from '../features/dashboard/dashboard.types';
import {useDashboardHome} from '../features/dashboard/hooks/use-dashboard-home';
import type {JobCardModel} from '../features/jobs/jobs.types';
import {getDashboardHeroLayout, getDashboardSummaryIconSize} from './dashboard.layout';

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
  initialUser: CandidateUser;
  onLogout: () => Promise<void> | void;
};

const shortcutItems = [
  {label: 'Profil Saya', icon: 'person-outline' as const},
  {label: 'Lowongan Kerja', icon: 'briefcase-outline' as const},
  {label: 'Lamaran Saya', icon: 'document-text-outline' as const},
  {label: 'Performance', icon: 'stats-chart-outline' as const},
];

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

function resolveMediaUrl(value: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const serverUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, '');
  return serverUrl ? `${serverUrl}/${value.replace(/^\//, '')}` : null;
}

function applicationStatus(application: unknown): string {
  if (!application || typeof application !== 'object') return '';
  const item = application as Record<string, unknown>;
  const status = [item.status, item.application_status, item.stage_status]
    .find(value => typeof value === 'string');
  return typeof status === 'string' ? status.toLowerCase() : '';
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

function DashboardHero({user, unread}: {user: CandidateUser; unread: number}) {
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
          {right: layout.horizontalPadding, top: Math.max(insets.top + 12, layout.contentTop)},
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${unread} notifikasi belum dibaca`}
          onPress={() => Alert.alert('Notifikasi', 'Halaman notifikasi akan dibuka dari navigasi utama.')}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications" size={25} color="white" />
          {unread > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buka profil"
          onPress={() => Alert.alert('Profil', 'Halaman profil akan dibuka dari navigasi utama.')}
        >
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

export function SummaryCard({applications, interviews, viewportWidth}: {applications: unknown[]; interviews: DashboardInterview[]; viewportWidth: number}) {
  const iconSize = getDashboardSummaryIconSize(viewportWidth);
  const iconGlyphSize = Math.round(iconSize * 0.48);
  const processing = applications.filter(application => {
    const status = applicationStatus(application);
    return status && !['rejected', 'hired', 'cancelled', 'canceled'].includes(status);
  }).length;

  const items = [
    {label: 'Total Lamaran', value: applications.length, color: C.navy, icon: 'document-text' as const},
    {label: 'Dalam Seleksi', value: processing, color: C.green, icon: 'people' as const},
    {label: 'Jadwal Interview', value: interviews.length, color: C.purple, icon: 'calendar' as const},
    {label: 'Lowongan Disimpan', value: 0, color: C.orange, icon: 'bookmark' as const},
  ];

  return (
    <View testID="dashboard-summary-card" style={styles.summaryGrid}>
      {items.map((item, index) => (
        <Pressable
          key={item.label}
          testID={`dashboard-summary-item-${index}`}
          accessibilityRole="button"
          accessibilityLabel={`${item.value} ${item.label}`}
          onPress={() => Alert.alert(item.label, 'Daftar lengkap akan tersedia pada halaman terkait.')}
          style={({pressed}) => [styles.summaryItem, pressed && styles.pressed]}
        >
          <View
            testID={`dashboard-summary-icon-${index}`}
            style={[styles.summaryIcon, {backgroundColor: item.color, width: iconSize, height: iconSize, borderRadius: iconSize / 2}]}
          >
            <Ionicons name={item.icon} size={iconGlyphSize} color="white" />
          </View>
          <View style={styles.summaryCopy}>
            <Text testID={`dashboard-summary-value-${index}`} style={styles.summaryValue}>{item.value}</Text>
            <Text testID={`dashboard-summary-label-${index}`} numberOfLines={2} style={styles.summaryLabel}>{item.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.brightBlue} />
        </Pressable>
      ))}
    </View>
  );
}

function ProfileCompletionCard({completion}: {completion: number}) {
  if (completion >= 100) return null;

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileCopy}>
        <Text style={styles.profileTitle}>Lengkapi Profilmu</Text>
        <Text style={styles.profileDescription}>Lengkapi data dan pengalaman kerjamu{`\n`}untuk meningkatkan peluang dipanggil interview!</Text>
        <View style={styles.progressHeader}>
          <View />
          <Text style={styles.progressValue}>{completion}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${completion}%`}]} />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Lengkapi profil', 'Buka menu Profil untuk melengkapi data kandidat.')}
          style={styles.profileButton}
        >
          <Text style={styles.profileButtonText}>Lengkapi sekarang</Text>
        </Pressable>
      </View>
      <View style={styles.profileIllustration}>
        <View style={styles.clipTop} />
        <Ionicons name="person-circle" size={35} color={C.navy} />
        {[0, 1, 2].map(item => (
          <View key={item} style={styles.checkRow}>
            <Ionicons name="checkmark" size={16} color="#1FC969" />
            <View style={[styles.checkLine, {width: 34 + item * 5}]} />
          </View>
        ))}
      </View>
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

export function ShortcutGrid() {
  return (
    <View>
      <Text style={styles.sectionTitle}>Pintasan</Text>
      <View style={styles.shortcuts}>
        {shortcutItems.map(item => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={`Buka ${item.label}`}
            onPress={() => Alert.alert(item.label, `Halaman ${item.label} akan dibuka dari navigasi aplikasi.`)}
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

function JobCard({job, width}: {job: JobCardModel; width: number}) {
  const [saved, setSaved] = useState(false);
  const visibleSkills = job.skills.slice(0, 5);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lowongan ${job.title} di ${job.company}`}
      onPress={() => Alert.alert(job.title, `${job.company}\n${job.location}`)}
      style={[styles.jobCard, {width}]}
    >
      <View style={styles.jobCardTop}>
        {job.urgent ? (
          <View style={styles.urgentBadge}>
            <Ionicons name="flash" size={12} color="#16B75D" />
            <Text style={styles.urgentText}>Dibutuhkan segera</Text>
          </View>
        ) : <View />}
        <View style={styles.jobActions}>
          <View style={styles.openDetailIcon}>
            <Ionicons name="open-outline" size={15} color="white" />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Hapus dari tersimpan' : 'Simpan lowongan'}
            onPress={event => {
              event.stopPropagation();
              setSaved(value => !value);
            }}
            hitSlop={8}
          >
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={C.blue} />
          </Pressable>
        </View>
      </View>

      <View style={styles.jobIdentity}>
        <View style={styles.companyLogo}>
          <Text style={styles.companyLogoText}>{job.company.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.jobTitleWrap}>
          <Text numberOfLines={1} style={styles.jobTitle}>{job.title}</Text>
          <Text numberOfLines={1} style={styles.companyName}>{job.company}  <Ionicons name="checkmark-circle" size={13} color={C.brightBlue} /></Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={15} color="#7B8390" />
        <Text numberOfLines={1} style={styles.metaText}>{job.location}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Ionicons name="briefcase-outline" size={15} color="#7B8390" />
        <Text style={styles.metaText}>{job.workType}</Text>
      </View>
      <View style={styles.salaryRow}>
        <Ionicons name="cash-outline" size={16} color={C.blue} />
        <Text numberOfLines={1} style={styles.salaryText}>{job.salary}</Text>
      </View>

      <View style={styles.skillWrap}>
        {visibleSkills.map(skill => <View key={skill} style={styles.skillChip}><Text style={styles.skillText}>{skill}</Text></View>)}
        {job.skills.length > 5 && <View style={styles.skillChip}><Text style={styles.skillText}>+{job.skills.length - 5}</Text></View>}
      </View>

      <View style={styles.timestamps}>
        <Text style={styles.timestamp}>◷ {job.publishedLabel}</Text>
        <Text style={styles.timestampDot}>•</Text>
        <Text style={styles.timestamp}>{job.updatedLabel}</Text>
      </View>
      <View style={styles.jobDivider} />

      <View style={styles.jobButtons}>
        <Pressable
          accessibilityRole="button"
          onPress={event => {
            event.stopPropagation();
            Alert.alert('Lamar sekarang', `Lanjutkan lamaran untuk ${job.title}?`);
          }}
          style={styles.applyButton}
        >
          <Text style={styles.applyButtonText}>Lamar sekarang</Text>
        </Pressable>
        <Text style={styles.detailButtonText}>Lihat Detail  ›</Text>
      </View>
    </Pressable>
  );
}

export default function DashboardHome({initialUser, onLogout}: DashboardHomeProps) {
  const {width} = useWindowDimensions();
  const {interviews, jobs, unread, jobsLoading, refreshing, error, refresh} = useDashboardHome();
  const applications = initialUser.job_applications;
  const profileCompletion = initialUser.profile_completed_at ? 100 : 75;
  const cardWidth = Math.min(Math.max(width * 0.84, 280), 370);

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
        {jobs.map(job => <JobCard key={job.id} job={job} width={cardWidth} />)}
      </ScrollView>
    );
  }, [cardWidth, jobs, jobsLoading]);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={C.blue} colors={[C.blue]} />}
        contentContainerStyle={styles.scrollContent}
      >
        <DashboardHero user={initialUser} unread={unread} />
        <View style={styles.content}>
          <SummaryCard applications={applications} interviews={interviews} viewportWidth={width} />

          {!!error && (
            <Pressable accessibilityRole="button" onPress={() => void refresh()} style={styles.errorBanner}>
              <Ionicons name="cloud-offline-outline" size={20} color="#A35A00" />
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText}>Coba lagi</Text>
            </Pressable>
          )}

          <NearestInterviewCard interviews={interviews} />
          <ProfileCompletionCard completion={profileCompletion} />
          <ShortcutGrid />

          <View>
            <SectionHeader title="Rekomendasi Pekerjaan" onPress={() => Alert.alert('Rekomendasi', 'Buka seluruh rekomendasi pekerjaan.')} />
            {recommendationContent}
          </View>

          <Pressable accessibilityRole="button" onPress={() => void onLogout()} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={18} color="#8A94A6" />
            <Text style={styles.logoutText}>Keluar dari akun</Text>
          </Pressable>
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

const styles = StyleSheet.create({
  screen: {flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: C.background},
  scrollContent: {paddingBottom: 24},
  hero: {width: '100%', overflow: 'hidden'},
  heroImage: {backgroundColor: C.navy},
  heroCopy: {position: 'absolute', alignItems: 'flex-start'},
  heroActions: {position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 8},
  notificationButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  notificationBadge: {position: 'absolute', top: 0, right: -2, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: 'white'},
  notificationBadgeText: {fontFamily: F.bold, fontSize: 10, color: 'white'},
  avatar: {width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'white'},
  avatarFallback: {width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'white', backgroundColor: '#E7F0FF', alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontFamily: F.bold, fontSize: 15, color: C.blue},
  greetingTitle: {fontFamily: F.bold, fontSize: 36, lineHeight: 43, color: 'white', letterSpacing: -1.2, marginTop: 28, textAlign: 'left'},
  greetingTitleCompact: {fontSize: 30, lineHeight: 37, marginTop: 20},
  greetingTitleWide: {fontSize: 42, lineHeight: 50},
  greetingSubtitle: {fontFamily: F.regular, fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.92)', marginTop: 7},
  greetingSubtitleCompact: {fontSize: 12, lineHeight: 19, marginTop: 5},
  greetingSubtitleWide: {fontSize: 16, lineHeight: 26},
  content: {paddingHorizontal: 20, gap: 28, marginTop: -22},
  summaryGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  summaryItem: {...cardShadow, flexBasis: '47%', flexGrow: 1, minWidth: 130, minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 14},
  summaryIcon: {alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  summaryCopy: {flex: 1, minWidth: 0},
  summaryValue: {fontFamily: F.bold, fontSize: 24, lineHeight: 29, color: C.ink},
  summaryLabel: {fontFamily: F.medium, fontSize: 10.5, lineHeight: 14, color: '#252A35'},
  errorBanner: {flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFF5E7', borderRadius: 13, padding: 13, marginTop: -8},
  errorText: {fontFamily: F.regular, fontSize: 11, lineHeight: 16, color: '#805219', flex: 1},
  retryText: {fontFamily: F.bold, fontSize: 10, color: C.blue},
  profileCard: {...cardShadow, backgroundColor: 'white', borderRadius: 18, padding: 20, minHeight: 210, flexDirection: 'row', overflow: 'hidden'},
  profileCopy: {flex: 1, zIndex: 2},
  profileTitle: {fontFamily: F.bold, fontSize: 20, color: C.ink},
  profileDescription: {fontFamily: F.regular, fontSize: 12, lineHeight: 19, color: '#333943', marginTop: 9},
  progressHeader: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 1},
  progressValue: {fontFamily: F.bold, fontSize: 17, color: C.ink},
  progressTrack: {height: 7, borderRadius: 5, backgroundColor: '#EEF0F4', marginTop: 4, width: '100%', overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: 5, backgroundColor: C.blue},
  profileButton: {height: 42, paddingHorizontal: 20, borderRadius: 10, backgroundColor: '#003FA5', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: 20},
  profileButtonText: {fontFamily: F.semibold, fontSize: 11, color: 'white'},
  profileIllustration: {width: 105, height: 145, borderWidth: 7, borderColor: '#0B438E', borderRadius: 15, marginLeft: 15, alignItems: 'center', paddingTop: 21, gap: 8, backgroundColor: '#F7FAFF'},
  clipTop: {position: 'absolute', top: -14, width: 55, height: 24, borderRadius: 7, backgroundColor: '#0B438E'},
  checkRow: {flexDirection: 'row', alignItems: 'center', gap: 5},
  checkLine: {height: 5, borderRadius: 4, backgroundColor: '#ACC0E3'},
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
  shortcut: {...cardShadow, flex: 1, minWidth: 0, minHeight: 98, borderRadius: 14, backgroundColor: '#EAF3FF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, paddingVertical: 12},
  shortcutLabel: {fontFamily: F.medium, fontSize: 10.5, lineHeight: 14, color: '#164DB7', marginTop: 8, textAlign: 'center'},
  pressed: {opacity: 0.78, transform: [{scale: 0.98}]},
  jobsContent: {paddingTop: 16, paddingBottom: 8, gap: 14, paddingRight: 18},
  loadingJobs: {height: 210, alignItems: 'center', justifyContent: 'center', gap: 9},
  loadingText: {fontFamily: F.regular, fontSize: 11, color: C.muted},
  emptyJobs: {height: 185, backgroundColor: 'white', borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35, marginTop: 16},
  jobCard: {...cardShadow, backgroundColor: 'white', borderRadius: 18, padding: 17, minHeight: 365},
  jobCardTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  urgentBadge: {flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#DFF7E6', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5},
  urgentText: {fontFamily: F.medium, fontSize: 8.5, color: '#16A454'},
  jobActions: {flexDirection: 'row', alignItems: 'center', gap: 9},
  openDetailIcon: {width: 24, height: 24, borderRadius: 12, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center'},
  jobIdentity: {flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 17},
  companyLogo: {width: 55, height: 55, borderRadius: 10, backgroundColor: '#1769FF', alignItems: 'center', justifyContent: 'center'},
  companyLogoText: {fontFamily: F.extrabold, fontSize: 19, color: 'white', fontStyle: 'italic'},
  jobTitleWrap: {flex: 1},
  jobTitle: {fontFamily: F.bold, fontSize: 21, color: C.ink},
  companyName: {fontFamily: F.regular, fontSize: 11.5, color: C.muted, marginTop: 4},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 18},
  metaText: {fontFamily: F.regular, fontSize: 10, color: '#707782', maxWidth: 135},
  metaDot: {fontFamily: F.regular, color: '#C0C5CD', marginHorizontal: 3},
  salaryRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8},
  salaryText: {fontFamily: F.semibold, fontSize: 10.5, color: C.blue, flex: 1},
  skillWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 18},
  skillChip: {backgroundColor: '#EEF4FF', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5},
  skillText: {fontFamily: F.medium, fontSize: 8.5, color: '#3470DE'},
  timestamps: {flexDirection: 'row', alignItems: 'center', marginTop: 17, gap: 7},
  timestamp: {fontFamily: F.medium, fontSize: 7.5, color: '#2EAE5D'},
  timestampDot: {fontFamily: F.regular, color: '#CDD1D8'},
  jobDivider: {height: 1, backgroundColor: C.border, marginVertical: 14},
  jobButtons: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  applyButton: {height: 40, borderRadius: 10, backgroundColor: '#0345AE', paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center'},
  applyButtonText: {fontFamily: F.bold, fontSize: 10.5, color: 'white'},
  detailButtonText: {fontFamily: F.semibold, fontSize: 9.5, color: C.blue},
  logoutButton: {height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: -7},
  logoutText: {fontFamily: F.medium, fontSize: 11, color: '#8A94A6'},
  bottomNav: {...cardShadow, minHeight: 68, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#EFF1F5', flexDirection: 'row', paddingTop: 9, paddingHorizontal: 7},
  bottomNavItem: {flex: 1, minHeight: 49, alignItems: 'center', justifyContent: 'center', gap: 3},
  bottomLabel: {fontFamily: F.medium, fontSize: 8.5, color: '#A1A7B2'},
  bottomLabelActive: {fontFamily: F.bold, color: C.blue},
  bottomBadge: {position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, right: -1, top: 0, borderWidth: 1, borderColor: 'white'},
});
