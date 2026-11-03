import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import type {CandidateJobDetail} from '../jobs.types';
import {JOBS_COLORS, JOBS_FONTS, jobsCardShadow} from './jobs.ui';

type InformationCardProps = React.PropsWithChildren<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  testID: string;
  wide: boolean;
}>;

function InformationCard({icon, title, testID, wide, children}: InformationCardProps) {
  return (
    <View testID={testID} style={[styles.card, wide && styles.cardWide]}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={18} color={JOBS_COLORS.blue} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function BulletList({items}: {items: string[]}) {
  if (items.length === 0) return <Text style={styles.empty}>-</Text>;
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bulletRow}>
          <Text accessibilityElementsHidden style={styles.bullet}>•</Text>
          <Text style={styles.body}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SkillChips({items}: {items: string[]}) {
  if (items.length === 0) return <Text style={styles.empty}>-</Text>;
  return (
    <View style={styles.chips}>
      {items.map(item => (
        <View key={item} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function JobInformationSections({job}: {job: CandidateJobDetail}) {
  const {width} = useWindowDimensions();
  const wide = width >= 680;
  const qualifications = [...job.additionalQualifications, ...job.requirements].filter((item, index, items) => (
    items.findIndex(candidate => candidate.trim().toLocaleLowerCase('id-ID') === item.trim().toLocaleLowerCase('id-ID')) === index
  ));

  return (
    <View testID="job-information-sections" style={[styles.grid, wide && styles.gridWide]}>
      <InformationCard icon="clipboard-outline" title="Deskripsi Pekerjaan" testID="job-information-description" wide={wide}>
        <BulletList items={job.descriptionItems} />
      </InformationCard>
      <InformationCard icon="person-outline" title="Kualifikasi" testID="job-information-qualifications" wide={wide}>
        <BulletList items={qualifications} />
      </InformationCard>
      <InformationCard icon="star-outline" title="Keahlian yang Dibutuhkan" testID="job-information-skills" wide={wide}>
        <SkillChips items={job.skills} />
      </InformationCard>
      <InformationCard icon="gift-outline" title="Benefit" testID="job-information-benefits" wide={wide}>
        <BulletList items={job.benefits} />
      </InformationCard>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {gap: 13},
  gridWide: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch'},
  card: {
    ...jobsCardShadow,
    width: '100%',
    minWidth: 0,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: JOBS_COLORS.border,
    backgroundColor: JOBS_COLORS.card,
    padding: 16,
  },
  cardWide: {width: '48.9%'},
  header: {flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 14},
  iconBox: {width: 34, height: 34, flexShrink: 0, borderRadius: 9, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center'},
  title: {flex: 1, minWidth: 0, fontFamily: JOBS_FONTS.extrabold, fontSize: 12, lineHeight: 17, letterSpacing: 0.25, color: '#30405B', textTransform: 'uppercase'},
  list: {gap: 8},
  bulletRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  bullet: {width: 8, flexShrink: 0, fontFamily: JOBS_FONTS.bold, fontSize: 15, lineHeight: 20, color: '#30405B'},
  body: {flex: 1, minWidth: 0, fontFamily: JOBS_FONTS.semibold, fontSize: 11.5, lineHeight: 20, color: '#334155'},
  empty: {fontFamily: JOBS_FONTS.medium, fontSize: 12, color: JOBS_COLORS.muted},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 9},
  chip: {maxWidth: '100%', borderRadius: 18, backgroundColor: '#EDF5FF', paddingHorizontal: 13, paddingVertical: 8},
  chipText: {fontFamily: JOBS_FONTS.bold, fontSize: 10.5, lineHeight: 15, color: JOBS_COLORS.blue},
});
