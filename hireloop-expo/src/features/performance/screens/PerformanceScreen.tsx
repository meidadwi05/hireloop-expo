import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import {toAppApiError} from '../../../core/api/api-error';
import {ShimmerBlock, ShimmerGroup} from '../../../shared/components/shimmer';
import {PerformanceHeader} from '../components/PerformanceHeader';
import {usePerformance} from '../hooks/use-performance';
import type {PerformanceContract} from '../performance.schemas';
import {contractMatches, decisionLabel, formatPerformanceDate, type PerformanceFilter} from '../performance.utils';

const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

const C = {
  background: '#F4F7FC',
  blue: '#0051FD',
  navy: '#071C4D',
  ink: '#101828',
  muted: '#667085',
  soft: '#98A2B3',
  border: '#E3EAF4',
  green: '#12B76A',
  amber: '#F79009',
};

type MetricCardProps = {
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  primary: string;
  secondary: string;
  value: number;
};

function MetricCard({color, icon, primary, secondary, value}: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, {backgroundColor: `${color}14`}]}>
        <Ionicons name={icon} color={color} size={16} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.metricPrimary}>{primary}</Text>
      <Text numberOfLines={1} style={styles.metricSecondary}>{secondary}</Text>
    </View>
  );
}

function CompactStars({score = 0}: {score?: number | null}) {
  return (
    <View accessible accessibilityLabel={`Nilai ${Number(score).toFixed(1)} dari 5`} style={styles.stars}>
      {[1, 2, 3, 4, 5].map(value => (
        <Ionicons
          color={Number(score) >= value - 0.25 ? '#FFB800' : '#DCE3ED'}
          key={value}
          name="star"
          size={14}
        />
      ))}
    </View>
  );
}

function decisionTone(value: string) {
  if (value === 'perpanjang' || value === 'perpanjang_kontrak') return {backgroundColor: '#EAFBF3', color: '#087A55'};
  if (value === 'selesai' || value === 'selesai_kontrak') return {backgroundColor: '#FFF0F2', color: '#E11D48'};
  if (value === 'perlu_tindak_lanjut') return {backgroundColor: '#FFF6E8', color: '#B54708'};
  return {backgroundColor: '#F2F4F7', color: '#475467'};
}

function PerformanceCard({item}: {item: PerformanceContract}) {
  const rated = item.kpi_status === 'Sudah dinilai';
  const evaluationCount = item.kpi_scores.length;
  const tone = decisionTone(item.tindak_lanjut_kontrak);
  const title = item.lowongan_name || item.position_name;

  return (
    <Pressable
      accessibilityLabel={`Buka performance ${title}`}
      accessibilityRole="button"
      onPress={() => router.push(`/(candidate)/performance/${item.contract_id}` as never)}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardTop}>
        <View style={styles.jobIcon}>
          <Ionicons name="briefcase-outline" color={C.blue} size={21} />
        </View>
        <View style={styles.cardCopy}>
          <Text numberOfLines={2} style={styles.cardTitle}>{title}</Text>
          <Text numberOfLines={1} style={styles.cardCompany}>{item.company_name || item.project_name || '-'}</Text>
        </View>
        <View style={[styles.decisionPill, {backgroundColor: tone.backgroundColor}]}>
          <Text numberOfLines={1} style={[styles.decisionText, {color: tone.color}]}>
            {decisionLabel(item.tindak_lanjut_kontrak)}
          </Text>
        </View>
      </View>

      <View style={styles.periodRow}>
        <View style={styles.periodCopy}>
          <Ionicons name="calendar-outline" color="#7A8DA8" size={15} />
          <Text numberOfLines={1} style={styles.metaText}>
            {formatPerformanceDate(item.contract_start_date)} – {formatPerformanceDate(item.contract_end_date)}
          </Text>
        </View>
        {evaluationCount > 0 ? (
          <View style={styles.countPill}>
            <Text style={styles.countText}>{evaluationCount}x Penilaian</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardFooter}>
        {rated ? (
          <View style={styles.ratingRow}>
            <View style={styles.scoreWrap}>
              <Text style={styles.score}>{Number(item.final_score ?? 0).toFixed(1)}</Text>
              <Text style={styles.scoreMax}>/ 5</Text>
            </View>
            <CompactStars score={item.final_score} />
          </View>
        ) : (
          <View style={styles.ratingRow}>
            <CompactStars />
            <Text style={styles.pendingText}>Belum dinilai</Text>
          </View>
        )}
        <View style={styles.detailLink}>
          <Text style={styles.detailText}>Lihat Detail</Text>
          <Ionicons name="chevron-forward" color={C.blue} size={17} />
        </View>
      </View>
    </Pressable>
  );
}

function LoadingState() {
  return (
    <ShimmerGroup>
      <View accessibilityLabel="Memuat performance" accessibilityRole="progressbar" style={styles.loading}>
        <View style={styles.metrics}>
          {[0, 1, 2].map(index => <ShimmerBlock borderRadius={16} height={126} key={index} width="31%" />)}
        </View>
        {[0, 1, 2].map(index => <ShimmerBlock borderRadius={18} height={164} key={index} width="100%" />)}
      </View>
    </ShimmerGroup>
  );
}

export function PerformanceScreen() {
  const {width} = useWindowDimensions();
  const containerWidth = Math.min(width, 560);
  const pagePadding = width < 360 ? 14 : 20;
  const query = usePerformance();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PerformanceFilter>('all');
  const contracts = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const metrics = query.data?.metrics;
  const visible = useMemo(
    () => contracts.filter(item => contractMatches(item, search, filter)),
    [contracts, filter, search],
  );
  const error = query.isError ? toAppApiError(query.error).message : null;
  const filterCount: Record<PerformanceFilter, number> = {
    all: metrics?.total_pekerjaan ?? contracts.length,
    rated: metrics?.sudah_dinilai ?? contracts.filter(item => item.kpi_status === 'Sudah dinilai').length,
    pending: metrics?.belum_dinilai ?? contracts.filter(item => item.kpi_status !== 'Sudah dinilai').length,
  };

  const controls = (
    <View style={{paddingHorizontal: pagePadding}}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" color="#8794A8" size={19} />
        <TextInput
          accessibilityLabel="Cari posisi atau perusahaan"
          onChangeText={setSearch}
          placeholder="Cari posisi atau perusahaan..."
          placeholderTextColor="#98A2B3"
          returnKeyType="search"
          style={styles.searchInput}
          value={search}
        />
        {search ? (
          <Pressable accessibilityLabel="Hapus pencarian" hitSlop={8} onPress={() => setSearch('')}>
            <Ionicons name="close-circle" color="#98A2B3" size={19} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metrics}>
        <MetricCard color={C.blue} icon="calendar-outline" primary="Total" secondary="Pekerjaan" value={metrics?.total_pekerjaan ?? 0} />
        <MetricCard color={C.green} icon="checkmark-circle-outline" primary="Sudah Dinilai" secondary="Evaluasi siap" value={metrics?.sudah_dinilai ?? 0} />
        <MetricCard color={C.amber} icon="time-outline" primary="Belum Dinilai" secondary="Menunggu" value={metrics?.belum_dinilai ?? 0} />
      </View>

      <ScrollView contentContainerStyle={styles.filters} horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'rated', 'pending'] as PerformanceFilter[]).map(value => (
          <Pressable
            key={value}
            onPress={() => setFilter(value)}
            style={[styles.filter, filter === value && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
              {value === 'all' ? 'Semua' : value === 'rated' ? 'Sudah Dinilai' : 'Belum Dinilai'} ({filterCount[value]})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Daftar Pekerjaan &amp; Penilaian</Text>
        <Text style={styles.sectionCount}>{visible.length} pekerjaan</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.viewport}>
      <StatusBar style="light" />
      <View style={[styles.page, {width: containerWidth}]}>
        <PerformanceHeader containerWidth={containerWidth} />
        {query.isLoading ? (
          <View style={{paddingHorizontal: pagePadding}}><LoadingState /></View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={visible}
            keyExtractor={item => String(item.contract_id)}
            ListEmptyComponent={(
              <View style={[styles.empty, {marginHorizontal: pagePadding}]}>
                <Ionicons name={error ? 'cloud-offline-outline' : 'stats-chart-outline'} color={C.soft} size={42} />
                <Text style={styles.emptyTitle}>
                  {error ? 'Performance gagal dimuat' : search || filter !== 'all' ? 'Data tidak ditemukan' : 'Belum ada data performance'}
                </Text>
                <Text style={styles.emptyText}>{error ?? 'Penilaian KPI dari kontrak kerja Anda akan tampil di sini.'}</Text>
                {error ? (
                  <Pressable onPress={() => void query.refetch()} style={styles.retry}>
                    <Text style={styles.retryText}>Coba lagi</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
            ListHeaderComponent={controls}
            refreshControl={(
              <RefreshControl
                colors={[C.blue]}
                onRefresh={() => void query.refetch()}
                refreshing={query.isRefetching}
                tintColor={C.blue}
              />
            )}
            renderItem={({item}) => <View style={{paddingHorizontal: pagePadding}}><PerformanceCard item={item} /></View>}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {alignItems: 'center', backgroundColor: '#EAF0F8', flex: 1},
  page: {backgroundColor: C.background, flex: 1, maxWidth: 560},
  listContent: {gap: 12, paddingBottom: 40},
  searchBox: {alignItems: 'center', backgroundColor: '#FFF', borderColor: C.border, borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 52, marginTop: 18, paddingHorizontal: 16},
  searchInput: {color: C.ink, flex: 1, fontFamily: F.regular, fontSize: 13, paddingVertical: 12},
  metrics: {flexDirection: 'row', gap: 8, marginTop: 16},
  metricCard: {alignItems: 'flex-start', backgroundColor: '#FFF', borderColor: C.border, borderRadius: 16, borderWidth: 1, elevation: 1, flex: 1, minHeight: 126, paddingHorizontal: 12, paddingVertical: 14, shadowColor: '#183B6B', shadowOffset: {height: 3, width: 0}, shadowOpacity: 0.04, shadowRadius: 8},
  metricIcon: {alignItems: 'center', borderRadius: 9, height: 28, justifyContent: 'center', width: 28},
  metricValue: {color: C.ink, fontFamily: F.bold, fontSize: 18, lineHeight: 23, marginTop: 7},
  metricPrimary: {color: C.ink, fontFamily: F.semibold, fontSize: 10.5, lineHeight: 14, marginTop: 1},
  metricSecondary: {color: C.soft, fontFamily: F.regular, fontSize: 9.5, lineHeight: 13, marginTop: 1},
  filters: {gap: 8, paddingRight: 12, paddingTop: 14},
  filter: {borderColor: '#D5DEEA', borderRadius: 999, borderWidth: 1, justifyContent: 'center', minHeight: 36, paddingHorizontal: 14},
  filterActive: {backgroundColor: C.blue, borderColor: C.blue},
  filterText: {color: '#344054', fontFamily: F.semibold, fontSize: 11.5},
  filterTextActive: {color: '#FFF'},
  sectionHeading: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, marginTop: 20},
  sectionTitle: {color: C.ink, flex: 1, fontFamily: F.bold, fontSize: 13, paddingRight: 8},
  sectionCount: {color: C.soft, fontFamily: F.regular, fontSize: 11.5},
  card: {backgroundColor: '#FFF', borderColor: C.border, borderRadius: 18, borderWidth: 1, elevation: 2, padding: 16, shadowColor: '#183B6B', shadowOffset: {height: 5, width: 0}, shadowOpacity: 0.07, shadowRadius: 12},
  pressed: {opacity: 0.84},
  cardTop: {alignItems: 'flex-start', flexDirection: 'row', gap: 11},
  jobIcon: {alignItems: 'center', backgroundColor: '#EDF4FF', borderRadius: 12, height: 42, justifyContent: 'center', width: 42},
  cardCopy: {flex: 1, minWidth: 0},
  cardTitle: {color: C.ink, fontFamily: F.bold, fontSize: 14, lineHeight: 19},
  cardCompany: {color: C.muted, fontFamily: F.regular, fontSize: 11.5, marginTop: 2},
  decisionPill: {borderRadius: 999, maxWidth: 130, paddingHorizontal: 10, paddingVertical: 6},
  decisionText: {fontFamily: F.semibold, fontSize: 9.5},
  periodRow: {alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 15},
  periodCopy: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: 7, minWidth: 0},
  metaText: {color: C.muted, flex: 1, fontFamily: F.regular, fontSize: 11.5},
  countPill: {backgroundColor: '#EAF2FF', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 5},
  countText: {color: C.blue, fontFamily: F.semibold, fontSize: 9.5},
  cardFooter: {alignItems: 'center', borderTopColor: '#EEF2F6', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, minHeight: 38, paddingTop: 12},
  ratingRow: {alignItems: 'center', flexDirection: 'row', gap: 8},
  scoreWrap: {alignItems: 'baseline', flexDirection: 'row'},
  score: {color: C.navy, fontFamily: F.bold, fontSize: 17},
  scoreMax: {color: C.soft, fontFamily: F.medium, fontSize: 10},
  stars: {flexDirection: 'row', gap: 1},
  pendingText: {color: C.soft, fontFamily: F.regular, fontSize: 10.5, fontStyle: 'italic'},
  detailLink: {alignItems: 'center', flexDirection: 'row', gap: 3, marginLeft: 8},
  detailText: {color: C.blue, fontFamily: F.semibold, fontSize: 11.5},
  loading: {gap: 12, paddingTop: 2},
  empty: {alignItems: 'center', backgroundColor: '#FFF', borderRadius: 18, marginTop: 20, padding: 28},
  emptyTitle: {color: C.ink, fontFamily: F.bold, fontSize: 16, marginTop: 12, textAlign: 'center'},
  emptyText: {color: C.muted, fontFamily: F.regular, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: 'center'},
  retry: {backgroundColor: C.blue, borderRadius: 12, marginTop: 16, paddingHorizontal: 22, paddingVertical: 11},
  retryText: {color: '#FFF', fontFamily: F.semibold, fontSize: 13},
});
