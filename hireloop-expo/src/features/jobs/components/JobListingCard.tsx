import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {CandidateJobCard} from '../jobs.types';
import {JOBS_COLORS, JOBS_FONTS, jobsCardShadow} from './jobs.ui';

type JobListingCardProps = {
  job: CandidateJobCard;
  saved: boolean;
  onOpen: () => void;
  onApply: () => void;
  onToggleSaved: () => void;
  onShare: () => void;
};

function MetaItem({icon, label}: {icon: React.ComponentProps<typeof Ionicons>['name']; label: string}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={15} color={JOBS_COLORS.blue} />
      <Text numberOfLines={1} style={styles.metaText}>{label}</Text>
    </View>
  );
}

export function JobListingCard({
  job,
  saved,
  onOpen,
  onApply,
  onToggleSaved,
  onShare,
}: JobListingCardProps) {
  const visibleSkills = job.skills.slice(0, 4);
  const extraSkills = Math.max(0, job.skills.length - visibleSkills.length);

  return (
    <Pressable
      accessibilityLabel={`Lowongan ${job.title} di ${job.company}`}
      accessibilityRole="button"
      onPress={onOpen}
      style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
      testID="job-listing-card"
    >
      <View style={styles.header}>
        <View style={styles.companyIcon}>
          <Ionicons name="business-outline" size={25} color={JOBS_COLORS.blue} />
        </View>
        <View style={styles.titleCopy}>
          <Text numberOfLines={2} style={styles.title}>{job.title}</Text>
          <Text numberOfLines={1} style={styles.company}>{job.company}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={saved ? 'Hapus dari lowongan tersimpan' : 'Simpan lowongan untuk sesi ini'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={event => {
              event?.stopPropagation();
              onToggleSaved();
            }}
          >
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={21} color="#60708A" />
          </Pressable>
          <Pressable
            accessibilityLabel="Bagikan lowongan"
            accessibilityRole="button"
            hitSlop={8}
            onPress={event => {
              event?.stopPropagation();
              onShare();
            }}
          >
            <Ionicons name="share-social-outline" size={21} color="#60708A" />
          </Pressable>
        </View>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, job.active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.badgeText, job.active ? styles.activeText : styles.inactiveText]}>
            {job.active ? 'Aktif' : 'Tidak aktif'}
          </Text>
        </View>
        {job.urgent && (
          <View style={[styles.badge, styles.urgentBadge]}>
            <Ionicons name="flame" size={12} color={JOBS_COLORS.red} />
            <Text style={styles.urgentText}>Dibutuhkan Segera</Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <MetaItem icon="location-outline" label={job.location} />
        <View style={styles.metaDivider} />
        <MetaItem icon="briefcase-outline" label={job.contractType} />
        <View style={styles.metaDivider} />
        <MetaItem icon="business-outline" label={job.workMode} />
      </View>

      <View style={styles.salaryRow}>
        <Ionicons name="cash-outline" size={17} color={JOBS_COLORS.blue} />
        <Text style={styles.salary}>{job.salaryLabel}</Text>
      </View>

      {!!visibleSkills.length && (
        <View style={styles.skills}>
          {visibleSkills.map(skill => (
            <View key={skill} style={styles.skillChip}>
              <Text numberOfLines={1} style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {extraSkills > 0 && (
            <View style={styles.skillChip}><Text style={styles.skillText}>+{extraSkills}</Text></View>
          )}
        </View>
      )}

      <View style={styles.stats}>
        <View style={styles.applicants}>
          <Ionicons name="people-outline" size={19} color="#52627A" />
          <View>
            <Text style={styles.applicantValue}>{job.applicantsCount}</Text>
            <Text style={styles.statLabel}>Total Pelamar</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.deadline}>
          <Ionicons name="calendar-outline" size={18} color="#52627A" />
          <Text numberOfLines={2} style={styles.deadlineText}>{job.closingLabel}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      <View style={styles.timestamps}>
        <Text style={styles.timestamp}>{job.publishedLabel}</Text>
        <View style={styles.timestampDot} />
        <Text style={styles.timestamp}>{job.updatedLabel}</Text>
      </View>
      <View style={styles.divider} />

      <View style={styles.buttons}>
        <Pressable
          accessibilityRole="button"
          disabled={!job.active}
          onPress={event => {
            event?.stopPropagation();
            onApply();
          }}
          style={({pressed}) => [styles.applyButton, pressed && styles.buttonPressed, !job.active && styles.disabled]}
        >
          <LinearGradient
            colors={['#0865FF', '#003F9F']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.applyGradient}
          >
            <Text style={styles.applyText}>Lamar sekarang</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={event => {
            event?.stopPropagation();
            onOpen();
          }}
          style={({pressed}) => [styles.detailButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.detailText}>Lihat Detail</Text>
          <Ionicons name="chevron-forward" size={18} color={JOBS_COLORS.blue} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {...jobsCardShadow, backgroundColor: 'white', borderRadius: 18, padding: 17, borderWidth: 1, borderColor: '#EEF2F8'},
  cardPressed: {opacity: 0.94},
  header: {flexDirection: 'row', alignItems: 'flex-start', gap: 11},
  companyIcon: {width: 50, height: 50, borderRadius: 13, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  titleCopy: {flex: 1, minWidth: 0, paddingTop: 1},
  title: {fontFamily: JOBS_FONTS.bold, fontSize: 16, lineHeight: 21, color: JOBS_COLORS.ink},
  company: {fontFamily: JOBS_FONTS.regular, fontSize: 11.5, lineHeight: 17, color: JOBS_COLORS.body, marginTop: 3},
  actions: {flexDirection: 'row', gap: 11, paddingTop: 4, flexShrink: 0},
  badges: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14},
  badge: {minHeight: 27, borderRadius: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4},
  activeBadge: {backgroundColor: JOBS_COLORS.greenBackground},
  inactiveBadge: {backgroundColor: '#EEF0F4'},
  urgentBadge: {backgroundColor: JOBS_COLORS.redBackground},
  badgeText: {fontFamily: JOBS_FONTS.semibold, fontSize: 10.5},
  activeText: {color: JOBS_COLORS.green},
  inactiveText: {color: '#747C89'},
  urgentText: {fontFamily: JOBS_FONTS.medium, fontSize: 10.5, color: JOBS_COLORS.red},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginTop: 15},
  metaItem: {maxWidth: '48%', flexDirection: 'row', alignItems: 'center', gap: 5},
  metaText: {fontFamily: JOBS_FONTS.regular, fontSize: 10.5, color: JOBS_COLORS.body, flexShrink: 1},
  metaDivider: {width: 1, height: 17, backgroundColor: '#DCE2EC'},
  salaryRow: {flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 11},
  salary: {flex: 1, fontFamily: JOBS_FONTS.semibold, fontSize: 13, lineHeight: 18, color: JOBS_COLORS.blue},
  skills: {flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12},
  skillChip: {maxWidth: '65%', minHeight: 27, borderRadius: 14, backgroundColor: '#EDF4FF', paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center'},
  skillText: {fontFamily: JOBS_FONTS.medium, fontSize: 9.5, color: '#1763DC'},
  stats: {minHeight: 54, flexDirection: 'row', alignItems: 'center', marginTop: 16},
  applicants: {minWidth: 104, flexDirection: 'row', alignItems: 'center', gap: 8},
  applicantValue: {fontFamily: JOBS_FONTS.semibold, fontSize: 12, color: JOBS_COLORS.ink},
  statLabel: {fontFamily: JOBS_FONTS.regular, fontSize: 8.5, color: JOBS_COLORS.muted, marginTop: 1},
  statDivider: {width: 1, height: 39, backgroundColor: JOBS_COLORS.border, marginHorizontal: 13},
  deadline: {flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 7},
  deadlineText: {flex: 1, fontFamily: JOBS_FONTS.regular, fontSize: 10.5, lineHeight: 15, color: JOBS_COLORS.body},
  divider: {height: 1, backgroundColor: JOBS_COLORS.border, marginTop: 11},
  timestamps: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingTop: 11},
  timestamp: {fontFamily: JOBS_FONTS.medium, fontSize: 9, color: JOBS_COLORS.green},
  timestampDot: {width: 4, height: 4, borderRadius: 2, backgroundColor: '#C5CCD8'},
  buttons: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 13},
  applyButton: {flex: 1.7, minHeight: 47, borderRadius: 10, overflow: 'hidden'},
  applyGradient: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9},
  applyText: {fontFamily: JOBS_FONTS.bold, fontSize: 12.5, color: 'white'},
  detailButton: {flex: 1, minHeight: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 4},
  detailText: {fontFamily: JOBS_FONTS.bold, fontSize: 11.5, color: JOBS_COLORS.blue},
  buttonPressed: {opacity: 0.76},
  disabled: {opacity: 0.5},
});
