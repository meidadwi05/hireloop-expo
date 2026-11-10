import React from 'react';
import {StyleSheet, View} from 'react-native';

import {ShimmerBlock, ShimmerGroup} from '../../../shared/components/shimmer';

export type ProfileLoadingVariant = 'profile' | 'personal' | 'experience' | 'skills' | 'documents' | 'work-preference';

function Row({labelWidth = '34%', valueWidth = '52%'}: {labelWidth?: `${number}%`; valueWidth?: `${number}%`}) {
  return (
    <View style={styles.dataRow}>
      <ShimmerBlock height={10} width={labelWidth} />
      <ShimmerBlock height={11} width={valueWidth} />
    </View>
  );
}

function CardHeader({width = '42%'}: {width?: `${number}%`}) {
  return (
    <View style={styles.cardHeader}>
      <ShimmerBlock borderRadius={10} height={20} width={20} />
      <ShimmerBlock height={14} width={width} />
    </View>
  );
}

function DataCard({rows = 3}: {rows?: number}) {
  return (
    <View style={styles.card}>
      <CardHeader />
      {Array.from({length: rows}).map((_, index) => <Row key={index} labelWidth={index % 2 ? '28%' : '36%'} valueWidth={index % 2 ? '62%' : '48%'} />)}
    </View>
  );
}

function ProfileOverviewSkeleton() {
  return (
    <>
      <View style={styles.profileCard}>
        <ShimmerBlock borderRadius={42} height={84} width={84} />
        <ShimmerBlock height={18} width="54%" />
        <ShimmerBlock height={11} width="38%" />
        <ShimmerBlock borderRadius={8} height={8} width="88%" />
      </View>
      <DataCard rows={2} />
      <DataCard rows={3} />
    </>
  );
}

function ExperienceSkeleton() {
  return (
    <>
      <View style={styles.summaryCard}>
        <ShimmerBlock borderRadius={22} height={44} width={44} />
        <View style={styles.flexCopy}><ShimmerBlock height={15} width="48%" /><ShimmerBlock height={10} width="78%" /></View>
      </View>
      {[0, 1].map(item => (
        <View key={item} style={styles.card}>
          <View style={styles.experienceTop}><ShimmerBlock borderRadius={10} height={38} width={38} /><View style={styles.flexCopy}><ShimmerBlock height={14} width="62%" /><ShimmerBlock height={10} width="44%" /></View></View>
          <ShimmerBlock height={10} width="76%" />
          <ShimmerBlock height={10} width="92%" />
        </View>
      ))}
    </>
  );
}

function SkillsSkeleton() {
  return (
    <>
      {[0, 1, 2].map(card => (
        <View key={card} style={styles.card}>
          <CardHeader width={card === 1 ? '50%' : '38%'} />
          <View style={styles.chips}>
            {[72, 96, 82, 108].slice(0, card === 2 ? 3 : 4).map((width, index) => <ShimmerBlock key={index} borderRadius={16} height={32} width={width} />)}
          </View>
        </View>
      ))}
    </>
  );
}

function DocumentsSkeleton() {
  return (
    <>
      {[0, 1, 2].map(item => (
        <View key={item} style={styles.documentCard}>
          <ShimmerBlock borderRadius={12} height={46} width={46} />
          <View style={styles.flexCopy}>
            <ShimmerBlock height={13} width={item % 2 ? '68%' : '82%'} />
            <ShimmerBlock height={10} width="48%" />
          </View>
          <ShimmerBlock borderRadius={10} height={36} width={36} />
        </View>
      ))}
    </>
  );
}

export function ProfileLoadingSkeleton({variant = 'profile'}: {variant?: ProfileLoadingVariant}) {
  return (
    <ShimmerGroup>
      <View accessible accessibilityLabel="Memuat data profil" accessibilityRole="progressbar" style={styles.wrap} testID={`profile-${variant}-skeleton`}>
        {variant === 'profile' ? <ProfileOverviewSkeleton /> : null}
        {variant === 'experience' ? <ExperienceSkeleton /> : null}
        {variant === 'skills' ? <SkillsSkeleton /> : null}
        {variant === 'documents' ? <DocumentsSkeleton /> : null}
        {variant === 'personal' ? <><DataCard rows={4} /><DataCard rows={4} /><DataCard rows={2} /></> : null}
        {variant === 'work-preference' ? <><DataCard rows={3} /><DataCard rows={4} /><ShimmerBlock borderRadius={11} height={49} width="100%" /></> : null}
      </View>
    </ShimmerGroup>
  );
}

const styles = StyleSheet.create({
  wrap: {padding: 16, gap: 14, backgroundColor: '#F5F8FC'},
  card: {borderRadius: 16, borderWidth: 1, borderColor: '#EDF1F6', backgroundColor: 'white', padding: 16, gap: 13},
  profileCard: {minHeight: 220, alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#EDF1F6', backgroundColor: 'white', padding: 20, gap: 12},
  summaryCard: {minHeight: 86, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, borderColor: '#EDF1F6', backgroundColor: 'white', padding: 16},
  cardHeader: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E3E9F2'},
  dataRow: {minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14},
  flexCopy: {flex: 1, minWidth: 0, gap: 9},
  experienceTop: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 9},
  documentCard: {minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, borderColor: '#EDF1F6', backgroundColor: 'white', padding: 14},
});
