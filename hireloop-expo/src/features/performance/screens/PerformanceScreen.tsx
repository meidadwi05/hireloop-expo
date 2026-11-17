import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View, useWindowDimensions} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {ShimmerBlock, ShimmerGroup} from '../../../shared/components/shimmer';
import {PerformanceHeader} from '../components/PerformanceHeader';
import {usePerformance} from '../hooks/use-performance';
import type {PerformanceContract} from '../performance.schemas';
import {contractMatches, decisionLabel, formatPerformanceDate, type PerformanceFilter} from '../performance.utils';

const F = {regular: 'PlusJakartaSans_400Regular', medium: 'PlusJakartaSans_500Medium', semibold: 'PlusJakartaSans_600SemiBold', bold: 'PlusJakartaSans_700Bold'} as const;
const C = {background: '#F4F7FC', blue: '#0051FD', navy: '#071C4D', ink: '#101828', muted: '#667085', border: '#E3EAF4', green: '#12B76A', amber: '#F79009'};

function MetricCard({icon, label, value, color}: {icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: number; color: string}) {
  return <View style={styles.metricCard}>
    <View style={[styles.metricIcon, {backgroundColor: `${color}16`}]}><Ionicons name={icon} color={color} size={21} /></View>
    <Text style={styles.metricValue}>{value}</Text><Text numberOfLines={2} style={styles.metricLabel}>{label}</Text>
  </View>;
}

function PerformanceCard({item}: {item: PerformanceContract}) {
  const rated = item.kpi_status === 'Sudah dinilai';
  return <Pressable
    accessibilityLabel={`Buka performance ${item.position_name}`}
    accessibilityRole="button"
    onPress={() => router.push(`/(candidate)/performance/${item.contract_id}` as never)}
    style={({pressed}) => [styles.card, pressed && styles.pressed]}
  >
    <View style={styles.cardTop}>
      <View style={styles.jobIcon}><Ionicons name="briefcase-outline" color={C.blue} size={23} /></View>
      <View style={styles.cardCopy}>
        <Text numberOfLines={2} style={styles.cardTitle}>{item.lowongan_name || item.position_name}</Text>
        <Text numberOfLines={1} style={styles.cardCompany}>{item.company_name || item.project_name || '-'}</Text>
      </View>
      <Ionicons name="chevron-forward" color={C.blue} size={21} />
    </View>
    <View style={styles.metaRow}>
      <Ionicons name="calendar-outline" color={C.muted} size={16} />
      <Text style={styles.metaText}>{formatPerformanceDate(item.contract_start_date)} – {formatPerformanceDate(item.contract_end_date)}</Text>
    </View>
    <View style={styles.cardFooter}>
      <View style={[styles.statusPill, rated ? styles.statusRated : styles.statusPending]}>
        <Text style={[styles.statusText, {color: rated ? C.green : C.amber}]}>{item.kpi_status}</Text>
      </View>
      {rated ? <View style={styles.scoreWrap}><Text style={styles.score}>{Number(item.final_score ?? 0).toFixed(1)}</Text><Text style={styles.scoreMax}>/5</Text></View> : null}
      <Text numberOfLines={1} style={styles.decision}>{decisionLabel(item.tindak_lanjut_kontrak)}</Text>
    </View>
  </Pressable>;
}

function LoadingState() {
  return <ShimmerGroup><View style={styles.loading} accessibilityLabel="Memuat performance" accessibilityRole="progressbar">
    <View style={styles.metrics}>{[0, 1, 2].map(i => <ShimmerBlock key={i} borderRadius={16} height={112} width="31%" />)}</View>
    {[0, 1, 2].map(i => <ShimmerBlock key={i} borderRadius={18} height={164} width="100%" />)}
  </View></ShimmerGroup>;
}

export function PerformanceScreen() {
  const {width} = useWindowDimensions();
  const containerWidth = Math.min(width, 720);
  const pagePadding = width < 360 ? 14 : 20;
  const query = usePerformance();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PerformanceFilter>('all');
  const contracts = query.data?.data ?? [];
  const metrics = query.data?.metrics;
  const visible = useMemo(() => contracts.filter(item => contractMatches(item, search, filter)), [contracts, filter, search]);
  const error = query.isError ? toAppApiError(query.error).message : null;

  const controls = <View style={{paddingHorizontal: pagePadding}}>
    <View style={styles.searchBox}><Ionicons name="search-outline" color="#8794A8" size={21} /><TextInput accessibilityLabel="Cari posisi atau perusahaan" onChangeText={setSearch} placeholder="Cari posisi atau perusahaan..." placeholderTextColor="#98A2B3" returnKeyType="search" style={styles.searchInput} value={search} />{search ? <Pressable accessibilityLabel="Hapus pencarian" onPress={() => setSearch('')}><Ionicons name="close-circle" color="#98A2B3" size={19} /></Pressable> : null}</View>
    <View style={styles.metrics}>
      <MetricCard color={C.blue} icon="briefcase-outline" label="Total Pekerjaan" value={metrics?.total_pekerjaan ?? 0} />
      <MetricCard color={C.green} icon="checkmark-done-outline" label="Sudah Dinilai" value={metrics?.sudah_dinilai ?? 0} />
      <MetricCard color={C.amber} icon="time-outline" label="Belum Dinilai" value={metrics?.belum_dinilai ?? 0} />
    </View>
    <View style={styles.filters}>{(['all', 'rated', 'pending'] as PerformanceFilter[]).map(value => <Pressable key={value} onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.filterActive]}><Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{value === 'all' ? 'Semua' : value === 'rated' ? 'Sudah Dinilai' : 'Belum Dinilai'}</Text></Pressable>)}</View>
    <Text style={styles.sectionTitle}>{visible.length} pekerjaan</Text>
  </View>;

  return <View style={styles.viewport}><StatusBar style="light" /><View style={[styles.page, {width: containerWidth}]}>
    <PerformanceHeader containerWidth={containerWidth} />
    {query.isLoading ? <View style={{paddingHorizontal: pagePadding}}><LoadingState /></View> : <FlatList
      contentContainerStyle={[styles.listContent, {paddingBottom: 40}]}
      data={visible}
      keyExtractor={item => String(item.contract_id)}
      ListHeaderComponent={controls}
      ListEmptyComponent={<View style={[styles.empty, {marginHorizontal: pagePadding}]}><Ionicons name={error ? 'cloud-offline-outline' : 'stats-chart-outline'} color="#98A2B3" size={42} /><Text style={styles.emptyTitle}>{error ? 'Performance gagal dimuat' : search || filter !== 'all' ? 'Data tidak ditemukan' : 'Belum ada data performance'}</Text><Text style={styles.emptyText}>{error ?? 'Penilaian KPI dari kontrak kerja Anda akan tampil di sini.'}</Text>{error ? <Pressable onPress={() => void query.refetch()} style={styles.retry}><Text style={styles.retryText}>Coba lagi</Text></Pressable> : null}</View>}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={C.blue} colors={[C.blue]} />}
      renderItem={({item}) => <View style={{paddingHorizontal: pagePadding}}><PerformanceCard item={item} /></View>}
    />}
  </View></View>;
}

const styles = StyleSheet.create({
  viewport: {backgroundColor: '#EAF0F8', flex: 1, alignItems: 'center'}, page: {backgroundColor: C.background, flex: 1, maxWidth: 720}, listContent: {gap: 12}, searchBox: {alignItems: 'center', backgroundColor: '#FFF', borderColor: C.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 52, marginTop: 18, paddingHorizontal: 16}, searchInput: {color: C.ink, flex: 1, fontFamily: F.regular, fontSize: 14, paddingVertical: 12}, metrics: {flexDirection: 'row', gap: 10, marginTop: 16}, metricCard: {alignItems: 'center', backgroundColor: '#FFF', borderColor: C.border, borderRadius: 16, borderWidth: 1, flex: 1, minHeight: 112, padding: 10}, metricIcon: {alignItems: 'center', borderRadius: 12, height: 38, justifyContent: 'center', width: 38}, metricValue: {color: C.ink, fontFamily: F.bold, fontSize: 21, marginTop: 4}, metricLabel: {color: C.muted, fontFamily: F.medium, fontSize: 10, lineHeight: 14, textAlign: 'center'}, filters: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16}, filter: {borderColor: C.border, borderRadius: 999, borderWidth: 1, minHeight: 36, justifyContent: 'center', paddingHorizontal: 14}, filterActive: {backgroundColor: C.blue, borderColor: C.blue}, filterText: {color: C.navy, fontFamily: F.semibold, fontSize: 12}, filterTextActive: {color: '#FFF'}, sectionTitle: {color: C.ink, fontFamily: F.bold, fontSize: 18, marginBottom: 4, marginTop: 20}, card: {backgroundColor: '#FFF', borderColor: C.border, borderRadius: 18, borderWidth: 1, padding: 16, shadowColor: '#183B6B', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2}, pressed: {opacity: 0.84}, cardTop: {alignItems: 'center', flexDirection: 'row', gap: 12}, jobIcon: {alignItems: 'center', backgroundColor: '#EDF4FF', borderRadius: 13, height: 48, justifyContent: 'center', width: 48}, cardCopy: {flex: 1, minWidth: 0}, cardTitle: {color: C.ink, fontFamily: F.bold, fontSize: 15, lineHeight: 21}, cardCompany: {color: C.muted, fontFamily: F.regular, fontSize: 12, marginTop: 2}, metaRow: {alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: 14}, metaText: {color: C.muted, flex: 1, fontFamily: F.regular, fontSize: 12}, cardFooter: {alignItems: 'center', borderTopColor: '#EEF2F6', borderTopWidth: 1, flexDirection: 'row', gap: 8, marginTop: 13, paddingTop: 13}, statusPill: {borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6}, statusRated: {backgroundColor: '#EAFBF3'}, statusPending: {backgroundColor: '#FFF6E8'}, statusText: {fontFamily: F.semibold, fontSize: 10}, scoreWrap: {alignItems: 'baseline', flexDirection: 'row'}, score: {color: C.navy, fontFamily: F.bold, fontSize: 18}, scoreMax: {color: C.muted, fontFamily: F.regular, fontSize: 10}, decision: {color: C.muted, flex: 1, fontFamily: F.medium, fontSize: 10, textAlign: 'right'}, loading: {gap: 12, paddingTop: 2}, empty: {alignItems: 'center', backgroundColor: '#FFF', borderRadius: 18, marginTop: 20, padding: 28}, emptyTitle: {color: C.ink, fontFamily: F.bold, fontSize: 16, marginTop: 12, textAlign: 'center'}, emptyText: {color: C.muted, fontFamily: F.regular, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: 'center'}, retry: {backgroundColor: C.blue, borderRadius: 12, marginTop: 16, paddingHorizontal: 22, paddingVertical: 11}, retryText: {color: '#FFF', fontFamily: F.semibold, fontSize: 13},
});

