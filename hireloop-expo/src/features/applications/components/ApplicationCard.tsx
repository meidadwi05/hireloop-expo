import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {ApplicationCardModel} from '../applications.types';
import {ApplicationHorizontalTimeline} from './ApplicationTimeline';
import {
  APPLICATION_COLORS,
  APPLICATION_FONTS,
  applicationShadow,
  applicationStatePresentation,
  formatApplicationDate,
} from './applications.ui';

function MetadataRow({icon, children}: {icon: keyof typeof Ionicons.glyphMap; children: string}) {
  return (
    <View style={styles.metadataRow}>
      <Ionicons name={icon} size={16} color={APPLICATION_COLORS.body} />
      <Text style={styles.metadataText}>{children}</Text>
    </View>
  );
}

export function ApplicationCard({model, onOpen}: {model: ApplicationCardModel; onOpen: () => void}) {
  const {application, job, savedOnly} = model;
  const presentation = application
    ? applicationStatePresentation(application.state, application.currentStageLabel)
    : {label: 'Disimpan', color: APPLICATION_COLORS.blue, background: '#EAF2FF'};
  const eventDate = application?.state === 'canceled' ? application.canceledAt : application?.submittedAt ?? null;
  const eventLabel = application?.state === 'canceled' ? 'Dibatalkan' : 'Dilamar';

  return (
    <View style={styles.card}>
      {application?.isTransferred && (
        <View style={styles.transferBanner}>
          <Ionicons name="swap-horizontal-outline" size={17} color={APPLICATION_COLORS.purple} />
          <Text style={styles.transferText}>Lamaran dialihkan ke posisi atau proyek lain.</Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <View style={styles.companyIcon}>
          <Ionicons name="business-outline" size={27} color={APPLICATION_COLORS.blue} />
        </View>
        <View style={styles.titleCopy}>
          <Text numberOfLines={2} style={styles.title}>{job.title || application?.title}</Text>
          <Text numberOfLines={2} style={styles.company}>{job.company || application?.company}</Text>
        </View>
        <View style={[styles.badge, {backgroundColor: presentation.background, borderColor: presentation.color}]}>
          <Text numberOfLines={2} style={[styles.badgeText, {color: presentation.color}]}>{presentation.label}</Text>
        </View>
      </View>

      <View style={styles.metadataGrid}>
        <MetadataRow icon="location-outline">{job.location || application?.location || 'Lokasi tidak tersedia'}</MetadataRow>
        <MetadataRow icon="briefcase-outline">{job.contractType}</MetadataRow>
        <MetadataRow icon="wallet-outline">{job.salaryLabel}</MetadataRow>
        <MetadataRow icon="calendar-outline">{job.closingLabel}</MetadataRow>
      </View>

      {savedOnly ? (
        <View style={styles.savedMessage}>
          <Ionicons name="bookmark" size={16} color={APPLICATION_COLORS.blue} />
          <Text style={styles.savedMessageText}>Lowongan ini belum dilamar.</Text>
        </View>
      ) : application?.isTemporary ? (
        <View style={styles.temporaryMessage}>
          <Ionicons name="document-attach-outline" size={16} color="#C57E00" />
          <Text style={styles.temporaryText}>Menunggu kelengkapan persyaratan Anda</Text>
        </View>
      ) : (
        <View style={[styles.eventPill, application?.state === 'canceled' && styles.canceledEvent]}>
          <Text style={[styles.eventText, application?.state === 'canceled' && styles.canceledEventText]}>
            {eventLabel} {formatApplicationDate(eventDate)}
          </Text>
        </View>
      )}

      {!savedOnly && application && !application.isTemporary && (
        <View style={styles.timelineWrap}>
          <ApplicationHorizontalTimeline stages={application.stages} />
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${savedOnly ? 'Lihat lowongan' : 'Lihat detail lamaran'} ${job.title}`}
        onPress={onOpen}
        style={({pressed}) => [styles.detailButton, pressed && styles.pressed]}
      >
        <Text style={styles.detailText}>{savedOnly ? 'Lihat Lowongan' : 'Lihat Detail'}</Text>
        <Ionicons name="chevron-forward" size={19} color={APPLICATION_COLORS.blue} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {...applicationShadow, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: APPLICATION_COLORS.border, padding: 16},
  transferBanner: {minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: '#F3EEFF', paddingHorizontal: 11, paddingVertical: 8, marginBottom: 13},
  transferText: {flex: 1, fontFamily: APPLICATION_FONTS.medium, fontSize: 10.5, lineHeight: 16, color: '#6841B7'},
  headerRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 11},
  companyIcon: {width: 50, height: 50, borderRadius: 13, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  titleCopy: {flex: 1, minWidth: 0},
  title: {fontFamily: APPLICATION_FONTS.bold, fontSize: 15, lineHeight: 20, color: APPLICATION_COLORS.navy},
  company: {fontFamily: APPLICATION_FONTS.medium, fontSize: 11, lineHeight: 17, color: APPLICATION_COLORS.body, marginTop: 3},
  badge: {maxWidth: 108, minHeight: 30, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, flexShrink: 0},
  badgeText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 9.5, lineHeight: 13, textAlign: 'center'},
  metadataGrid: {marginTop: 15, gap: 8},
  metadataRow: {minHeight: 19, flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  metadataText: {flex: 1, minWidth: 0, fontFamily: APPLICATION_FONTS.regular, fontSize: 10.5, lineHeight: 17, color: APPLICATION_COLORS.body},
  eventPill: {alignSelf: 'flex-start', maxWidth: '100%', marginTop: 13, borderRadius: 15, backgroundColor: '#EAF2FF', paddingHorizontal: 11, paddingVertical: 6},
  eventText: {fontFamily: APPLICATION_FONTS.semibold, fontSize: 9.5, lineHeight: 14, color: APPLICATION_COLORS.blue},
  canceledEvent: {backgroundColor: '#FFECEF'},
  canceledEventText: {color: APPLICATION_COLORS.red},
  savedMessage: {minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: '#EFF6FF', paddingHorizontal: 11, marginTop: 14},
  savedMessageText: {flex: 1, fontFamily: APPLICATION_FONTS.medium, fontSize: 10.5, color: APPLICATION_COLORS.blue},
  temporaryMessage: {minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: '#FFF7DF', paddingHorizontal: 11, marginTop: 14},
  temporaryText: {flex: 1, fontFamily: APPLICATION_FONTS.semibold, fontSize: 10.5, lineHeight: 16, color: '#A96C00'},
  timelineWrap: {marginTop: 17, overflow: 'hidden'},
  detailButton: {height: 46, borderRadius: 10, borderWidth: 1.5, borderColor: APPLICATION_COLORS.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 16},
  detailText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 11.5, color: APPLICATION_COLORS.blue},
  pressed: {opacity: 0.78},
});
