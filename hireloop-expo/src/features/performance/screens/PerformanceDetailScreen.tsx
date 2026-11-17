import Ionicons from '@expo/vector-icons/Ionicons';
import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {toAppApiError} from '../../../core/api/api-error';
import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';
import {ShimmerBlock, ShimmerGroup} from '../../../shared/components/shimmer';
import {PerformanceHeader} from '../components/PerformanceHeader';
import {usePerformance} from '../hooks/use-performance';
import type {PerformanceContract, PerformanceScore} from '../performance.schemas';
import {
  criterionLabel,
  decisionEffectiveDate,
  decisionLabel,
  formatPerformanceDate,
  formatPerformanceDateTime,
  KPI_CRITERIA,
  performanceHistory,
  scoreLabel,
} from '../performance.utils';

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
  border: '#DFE7F2',
  green: '#12B76A',
  amber: '#F79009',
  red: '#E11D48',
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'K';
}

function Stars({score, size = 17}: {score: number; size?: number}) {
  return (
    <View accessible accessibilityLabel={`Nilai ${score.toFixed(1)} dari 5`} style={styles.stars}>
      {[1, 2, 3, 4, 5].map(value => (
        <Ionicons
          color={score >= value - 0.25 ? '#FFB800' : '#DCE3ED'}
          key={value}
          name="star"
          size={size}
        />
      ))}
    </View>
  );
}

function scoreTone(score: number) {
  if (score < 2.5) return {backgroundColor: '#FFF0F2', color: C.red};
  if (score < 3.5) return {backgroundColor: '#EAF2FF', color: '#0052CC'};
  return {backgroundColor: '#EAFBF3', color: '#087A55'};
}

function decisionTone(value: string) {
  if (value === 'perpanjang' || value === 'perpanjang_kontrak') return {backgroundColor: '#EAFBF3', color: '#087A55'};
  if (value === 'selesai' || value === 'selesai_kontrak') return {backgroundColor: '#FFF0F2', color: C.red};
  if (value === 'perlu_tindak_lanjut') return {backgroundColor: '#FFF6E8', color: '#B54708'};
  return {backgroundColor: '#F2F4F7', color: '#475467'};
}

function FeedbackRow({
  color,
  icon,
  title,
  value,
}: {
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  value?: string | null;
}) {
  const hasValue = Boolean(value?.trim());
  return (
    <View style={styles.feedbackRow}>
      <View style={[styles.feedbackIcon, {backgroundColor: `${color}14`}]}>
        <Ionicons color={color} name={icon} size={19} />
      </View>
      <View style={styles.feedbackCopy}>
        <Text style={styles.feedbackTitle}>{title}</Text>
        <Text style={[styles.feedbackText, !hasValue && styles.feedbackEmpty]}>
          {hasValue ? value : title === 'Catatan Penilai *' ? 'Belum ada catatan penilai' : 'Belum ada catatan (Opsional)'}
        </Text>
      </View>
    </View>
  );
}

function DetailLoading({containerWidth, pagePadding}: {containerWidth: number; pagePadding: number}) {
  return (
    <View style={styles.viewport}>
      <StatusBar style="light" />
      <View style={[styles.page, {width: containerWidth}]}>
        <PerformanceHeader containerWidth={containerWidth} detail />
        <ShimmerGroup>
          <View style={[styles.loading, {paddingHorizontal: pagePadding}]}>
            <ShimmerBlock borderRadius={20} height={190} width="100%" />
            <ShimmerBlock borderRadius={20} height={250} width="100%" />
            <ShimmerBlock borderRadius={20} height={180} width="100%" />
          </View>
        </ShimmerGroup>
      </View>
    </View>
  );
}

function DetailMissing({
  containerWidth,
  error,
  onRetry,
  pagePadding,
}: {
  containerWidth: number;
  error: string | null;
  onRetry: () => void;
  pagePadding: number;
}) {
  return (
    <View style={styles.viewport}>
      <StatusBar style="light" />
      <View style={[styles.page, {width: containerWidth}]}>
        <PerformanceHeader containerWidth={containerWidth} detail />
        <View style={[styles.missing, {marginHorizontal: pagePadding}]}>
          <Ionicons name="alert-circle-outline" color={C.soft} size={44} />
          <Text style={styles.missingTitle}>Detail performance tidak ditemukan</Text>
          <Text style={styles.missingText}>{error ?? 'Data mungkin sudah diperbarui. Kembali ke daftar performance dan coba lagi.'}</Text>
          {error ? (
            <Pressable onPress={onRetry} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Coba lagi</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function EmployeeScoreCard({
  contract,
  rated,
  score,
  scoreData,
}: {
  contract: PerformanceContract;
  rated: boolean;
  score: number;
  scoreData?: PerformanceScore;
}) {
  const tone = scoreTone(score);
  const grade = scoreData?.score_grade || contract.score_grade || scoreLabel(score);
  return (
    <View style={styles.heroCard}>
      <View style={styles.employeeRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(contract.employee_name)}</Text>
        </View>
        <View style={styles.employeeCopy}>
          <Text numberOfLines={1} style={styles.employeeName}>{contract.employee_name}</Text>
          <Text numberOfLines={1} style={styles.employeeCompany}>{contract.company_name || contract.project_name || '-'}</Text>
        </View>
      </View>

      {rated ? (
        <View style={styles.scoreArea}>
          <View>
            <Text style={styles.scoreEyebrow}>NILAI AKHIR</Text>
            <View style={styles.scoreLine}>
              <Text style={styles.heroScore}>{score.toFixed(1)}</Text>
              <Text style={styles.heroMax}>/ 5</Text>
            </View>
            <Stars score={score} />
          </View>
          <View style={styles.scoreSummary}>
            <View style={[styles.gradePill, {backgroundColor: tone.backgroundColor}]}>
              <Text style={[styles.gradeText, {color: tone.color}]}>{grade}</Text>
            </View>
            <Text style={styles.evaluationDate}>{formatPerformanceDate(scoreData?.evaluation_date ?? contract.evaluation_date)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function PerformanceDetailScreen({contractId}: {contractId: string}) {
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const containerWidth = Math.min(width, 560);
  const pagePadding = width < 360 ? 14 : 20;
  const query = usePerformance();
  const selected = query.data?.data.find(item => String(item.contract_id) === contractId);
  const history = useMemo(
    () => selected && query.data ? performanceHistory(query.data.data, selected) : [],
    [query.data, selected],
  );
  const [selectedScoreId, setSelectedScoreId] = useState<number | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const currentEntry = selected ? history.find(item => item.contract.contract_id === selected.contract_id) : undefined;
  const activeEntry = selectedScoreId == null
    ? currentEntry
    : history.find(item => item.score.id === selectedScoreId);
  const activeContract = activeEntry?.contract ?? selected;
  const activeScore = activeEntry?.score;
  const score = Number(activeScore?.final_score ?? activeContract?.final_score ?? 0);
  const rated = Boolean(activeScore) || activeContract?.kpi_status === 'Sudah dinilai';
  const error = query.isError ? toAppApiError(query.error).message : null;

  if (query.isLoading) return <DetailLoading containerWidth={containerWidth} pagePadding={pagePadding} />;
  if (!selected || !activeContract) {
    return (
      <DetailMissing
        containerWidth={containerWidth}
        error={error}
        onRetry={() => void query.refetch()}
        pagePadding={pagePadding}
      />
    );
  }

  const headerSubtitle = [selected.project_name, selected.lowongan_name || selected.position_name].filter(Boolean).join(' · ');
  const activeDecision = activeContract.tindak_lanjut_kontrak;
  const activeDecisionTone = decisionTone(activeDecision);
  const evaluator = activeScore?.evaluator || activeContract.evaluator_name;
  const updatedAt = activeContract.contract_decision?.decided_at
    ?? activeScore?.updated_at
    ?? activeContract.updated_at;

  return (
    <View style={styles.viewport}>
      <StatusBar style="light" />
      <View style={[styles.page, {width: containerWidth}]}>
        <PerformanceHeader
          containerWidth={containerWidth}
          detail
          subtitle={headerSubtitle || 'Detail penilaian KPI dan evaluasi kinerja Anda'}
        />

        <ScrollView
          contentContainerStyle={[styles.content, {paddingBottom: 86 + insets.bottom, paddingHorizontal: pagePadding}]}
          showsVerticalScrollIndicator={false}
        >
          <EmployeeScoreCard contract={activeContract} rated={rated} score={score} scoreData={activeScore} />

          {!rated ? (
            <View style={styles.pendingCard}>
              <View style={styles.pendingIcon}>
                <Ionicons name="time-outline" color={C.amber} size={25} />
              </View>
              <Text style={styles.pendingTitle}>Evaluasi Belum Tersedia</Text>
              <Text style={styles.pendingText}>
                Penilaian kinerja untuk periode kontrak ini sedang menunggu proses evaluasi dari penilai.
              </Text>
            </View>
          ) : null}

          {rated && activeScore ? (
            <>
              <View>
                <View style={styles.historyHeading}>
                  <View style={styles.historyTitleRow}>
                    <Text style={styles.historyTitle}>Pilih Riwayat Penilaian</Text>
                    <View style={styles.historyCount}><Text style={styles.historyCountText}>{history.length}</Text></View>
                  </View>
                  {history.length > 1 ? (
                    <Pressable hitSlop={8} onPress={() => setHistoryOpen(true)}>
                      <Text style={styles.link}>Lihat Semua</Text>
                    </Pressable>
                  ) : null}
                </View>
                <ScrollView contentContainerStyle={styles.historyRow} horizontal showsHorizontalScrollIndicator={false}>
                  {history.map(entry => {
                    const isActive = activeScore.id === entry.score.id;
                    return (
                      <Pressable
                        key={entry.score.id}
                        onPress={() => setSelectedScoreId(entry.score.id)}
                        style={[styles.historyChip, isActive && styles.historyChipActive]}
                      >
                        <Text style={[styles.historyChipTitle, isActive && styles.historyChipTitleActive]}>
                          Penilaian ke-{entry.sequence}
                        </Text>
                        <Text style={[styles.historyChipMeta, isActive && styles.historyChipMetaActive]}>
                          {formatPerformanceDate(entry.score.evaluation_date)} · Skor {Number(entry.score.final_score ?? 0).toFixed(1)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>Rincian Penilaian</Text>
                  <Text style={styles.sectionMeta}>{KPI_CRITERIA.length} Parameter</Text>
                </View>
                <View style={styles.criteriaList}>
                  {KPI_CRITERIA.map(([key, label], index) => {
                    const value = Number(activeScore[key] ?? 0);
                    const tone = scoreTone(value);
                    return (
                      <View key={key} style={[styles.criterion, index === KPI_CRITERIA.length - 1 && styles.lastRow]}>
                        <View style={styles.criterionTop}>
                          <Text style={styles.criterionTitle}>{label}</Text>
                          <View style={[styles.criterionPill, {backgroundColor: tone.backgroundColor}]}>
                            <Text style={[styles.criterionPillText, {color: tone.color}]}>
                              {value.toFixed(1)} · {criterionLabel(value)}
                            </Text>
                          </View>
                        </View>
                        <Stars score={value} size={15} />
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.decisionHeading}>
                  <View style={styles.decisionTitleRow}>
                    <View style={styles.decisionIcon}>
                      <Ionicons name="shield-checkmark-outline" color={C.blue} size={17} />
                    </View>
                    <Text style={styles.sectionTitle}>Tindak Lanjut Kontrak</Text>
                  </View>
                  <View style={[styles.contractPill, {backgroundColor: activeDecisionTone.backgroundColor}]}>
                    <Text style={[styles.contractPillText, {color: activeDecisionTone.color}]}>
                      {decisionLabel(activeDecision)}
                    </Text>
                  </View>
                </View>
                <View style={styles.decisionGrid}>
                  <View style={styles.decisionColumn}>
                    <Text style={styles.decisionLabel}>TANGGAL EFEKTIF</Text>
                    <Text style={styles.decisionValue}>{formatPerformanceDate(decisionEffectiveDate(activeContract))}</Text>
                  </View>
                  <View style={styles.decisionColumn}>
                    <Text style={styles.decisionLabel}>DIPERBARUI</Text>
                    <Text style={styles.decisionValue}>{formatPerformanceDateTime(updatedAt)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Catatan &amp; Umpan Balik</Text>
                <View style={styles.feedbackList}>
                  <FeedbackRow color={C.green} icon="trophy-outline" title="Kelebihan Karyawan" value={activeScore.kelebihan_karyawan} />
                  <FeedbackRow color={C.blue} icon="bar-chart-outline" title="Hal yang Perlu Ditingkatkan" value={activeScore.hal_perlu_ditingkatkan} />
                  <FeedbackRow color="#8B5CF6" icon="clipboard-outline" title="Catatan Penilai *" value={activeScore.catatan_penilai} />
                </View>
                {evaluator ? <Text style={styles.evaluator}>Dinilai oleh {evaluator}</Text> : null}
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom, 12)}]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => goBackOrReplace('/(candidate)/performance')}
            style={({pressed}) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Kembali</Text>
          </Pressable>
        </View>

        <Modal animationType="slide" onRequestClose={() => setHistoryOpen(false)} transparent visible={historyOpen}>
          <Pressable onPress={() => setHistoryOpen(false)} style={styles.overlay}>
            <Pressable
              onPress={event => event.stopPropagation()}
              style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, 20), width: containerWidth}]}
            >
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeading}>
                <View style={styles.sheetCopy}>
                  <Text style={styles.sheetTitle}>Semua Riwayat Penilaian</Text>
                  <Text style={styles.sheetSubtitle}>Ketuk salah satu untuk melihat detailnya</Text>
                </View>
                <Pressable accessibilityLabel="Tutup" onPress={() => setHistoryOpen(false)} style={styles.closeButton}>
                  <Ionicons name="close" color="#64748B" size={20} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.sheetList} showsVerticalScrollIndicator={false}>
                {history.map(entry => {
                  const isActive = activeScore?.id === entry.score.id;
                  const tone = decisionTone(entry.contract.tindak_lanjut_kontrak);
                  return (
                    <Pressable
                      key={entry.score.id}
                      onPress={() => {
                        setSelectedScoreId(entry.score.id);
                        setHistoryOpen(false);
                      }}
                      style={[styles.historyListItem, isActive && styles.historyListActive]}
                    >
                      <View style={styles.historyListCopy}>
                        <View style={styles.historyListTitleRow}>
                          <Text style={styles.historyListTitle}>Penilaian ke-{entry.sequence}</Text>
                          <View style={[styles.historyDecisionPill, {backgroundColor: tone.backgroundColor}]}>
                            <Text style={[styles.historyDecisionText, {color: tone.color}]}>
                              {decisionLabel(entry.contract.tindak_lanjut_kontrak)}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.historyListDate}>{formatPerformanceDate(entry.score.evaluation_date)}</Text>
                      </View>
                      <View style={styles.historyListScoreCopy}>
                        <View style={styles.historyScoreLine}>
                          <Text style={styles.historyListScore}>{Number(entry.score.final_score ?? 0).toFixed(1)}</Text>
                          <Text style={styles.historyListMax}>/ 5</Text>
                        </View>
                        <Text style={[styles.historyAction, isActive && styles.historyActionActive]}>
                          {isActive ? 'Sedang dipilih' : 'Pilih'}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {alignItems: 'center', backgroundColor: '#EAF0F8', flex: 1},
  page: {backgroundColor: C.background, flex: 1, maxWidth: 560},
  content: {gap: 14, paddingTop: 18},
  heroCard: {backgroundColor: '#FFF', borderColor: C.border, borderRadius: 20, borderWidth: 1, padding: 16, shadowColor: '#183B6B', shadowOffset: {height: 4, width: 0}, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2},
  employeeRow: {alignItems: 'center', borderBottomColor: '#EEF2F6', borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingBottom: 14},
  avatar: {alignItems: 'center', backgroundColor: '#E8F1FF', borderRadius: 22, height: 44, justifyContent: 'center', width: 44},
  avatarText: {color: C.blue, fontFamily: F.bold, fontSize: 15},
  employeeCopy: {flex: 1, minWidth: 0},
  employeeName: {color: C.ink, fontFamily: F.bold, fontSize: 15},
  employeeCompany: {color: C.muted, fontFamily: F.regular, fontSize: 12, marginTop: 2},
  scoreArea: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14},
  scoreEyebrow: {color: C.soft, fontFamily: F.semibold, fontSize: 10, letterSpacing: 0.8},
  scoreLine: {alignItems: 'baseline', flexDirection: 'row', gap: 3, marginTop: 2},
  heroScore: {color: C.ink, fontFamily: F.bold, fontSize: 28, lineHeight: 34},
  heroMax: {color: C.soft, fontFamily: F.semibold, fontSize: 14},
  stars: {flexDirection: 'row', gap: 2, marginTop: 4},
  scoreSummary: {alignItems: 'flex-end', marginLeft: 12},
  gradePill: {borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6},
  gradeText: {fontFamily: F.semibold, fontSize: 12},
  evaluationDate: {color: C.soft, fontFamily: F.regular, fontSize: 11, marginTop: 7},
  pendingCard: {alignItems: 'center', backgroundColor: '#FFF', borderColor: C.border, borderRadius: 20, borderWidth: 1, padding: 24},
  pendingIcon: {alignItems: 'center', backgroundColor: '#FFF6E8', borderRadius: 24, height: 48, justifyContent: 'center', width: 48},
  pendingTitle: {color: C.ink, fontFamily: F.bold, fontSize: 15, marginTop: 12},
  pendingText: {color: C.muted, fontFamily: F.regular, fontSize: 12.5, lineHeight: 19, marginTop: 5, textAlign: 'center'},
  historyHeading: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2},
  historyTitleRow: {alignItems: 'center', flexDirection: 'row', gap: 6},
  historyTitle: {color: '#475467', fontFamily: F.semibold, fontSize: 12},
  historyCount: {backgroundColor: '#E4E7EC', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2},
  historyCountText: {color: '#475467', fontFamily: F.semibold, fontSize: 10},
  link: {color: C.blue, fontFamily: F.semibold, fontSize: 11.5},
  historyRow: {gap: 8, paddingRight: 20, paddingTop: 8},
  historyChip: {backgroundColor: '#FFF', borderColor: C.border, borderRadius: 13, borderWidth: 1, minWidth: 142, paddingHorizontal: 13, paddingVertical: 10},
  historyChipActive: {backgroundColor: C.blue, borderColor: C.blue},
  historyChipTitle: {color: C.ink, fontFamily: F.semibold, fontSize: 12.5},
  historyChipTitleActive: {color: '#FFF'},
  historyChipMeta: {color: C.soft, fontFamily: F.regular, fontSize: 10.5, marginTop: 3},
  historyChipMetaActive: {color: 'rgba(255,255,255,0.82)'},
  sectionCard: {backgroundColor: '#FFF', borderColor: C.border, borderRadius: 20, borderWidth: 1, padding: 16, shadowColor: '#183B6B', shadowOffset: {height: 4, width: 0}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1},
  sectionHeading: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  sectionTitle: {color: C.ink, fontFamily: F.bold, fontSize: 14},
  sectionMeta: {color: C.soft, fontFamily: F.medium, fontSize: 11},
  criteriaList: {marginTop: 6},
  criterion: {borderBottomColor: '#EEF2F6', borderBottomWidth: 1, paddingVertical: 13},
  lastRow: {borderBottomWidth: 0, paddingBottom: 2},
  criterionTop: {alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between'},
  criterionTitle: {color: '#344054', flex: 1, fontFamily: F.semibold, fontSize: 12.5},
  criterionPill: {borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5},
  criterionPillText: {fontFamily: F.semibold, fontSize: 10.5},
  decisionHeading: {alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between'},
  decisionTitleRow: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: 8, minWidth: 0},
  decisionIcon: {alignItems: 'center', backgroundColor: '#E8F1FF', borderRadius: 9, height: 28, justifyContent: 'center', width: 28},
  contractPill: {borderRadius: 999, maxWidth: 145, paddingHorizontal: 10, paddingVertical: 6},
  contractPillText: {fontFamily: F.semibold, fontSize: 10.5},
  decisionGrid: {backgroundColor: '#F8FAFC', borderColor: '#EEF2F6', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 10, marginTop: 14, padding: 13},
  decisionColumn: {flex: 1, minWidth: 0},
  decisionLabel: {color: C.soft, fontFamily: F.semibold, fontSize: 9.5, letterSpacing: 0.5},
  decisionValue: {color: '#344054', fontFamily: F.semibold, fontSize: 11.5, lineHeight: 16, marginTop: 4},
  feedbackList: {marginTop: 8},
  feedbackRow: {alignItems: 'flex-start', borderBottomColor: '#EEF2F6', borderBottomWidth: 1, flexDirection: 'row', gap: 11, paddingVertical: 13},
  feedbackIcon: {alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36},
  feedbackCopy: {flex: 1, minWidth: 0},
  feedbackTitle: {color: '#344054', fontFamily: F.semibold, fontSize: 12.5},
  feedbackText: {color: C.muted, fontFamily: F.regular, fontSize: 11.5, lineHeight: 17, marginTop: 3},
  feedbackEmpty: {color: C.soft, fontStyle: 'italic'},
  evaluator: {color: C.soft, fontFamily: F.regular, fontSize: 10.5, marginTop: 12},
  bottomBar: {backgroundColor: 'rgba(255,255,255,0.98)', borderTopColor: C.border, borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 11},
  backButton: {alignItems: 'center', backgroundColor: C.blue, borderRadius: 12, justifyContent: 'center', minHeight: 48, width: '100%'},
  pressed: {opacity: 0.84},
  primaryButton: {backgroundColor: C.blue, borderRadius: 12, marginTop: 16, paddingHorizontal: 22, paddingVertical: 12},
  primaryText: {color: '#FFF', fontFamily: F.semibold, fontSize: 14},
  overlay: {alignItems: 'center', backgroundColor: 'rgba(4,14,38,0.55)', flex: 1, justifyContent: 'flex-end'},
  sheet: {backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '75%', padding: 20},
  sheetHandle: {alignSelf: 'center', backgroundColor: '#D0D5DD', borderRadius: 99, height: 4, marginBottom: 16, width: 42},
  sheetHeading: {alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between'},
  sheetCopy: {flex: 1, minWidth: 0},
  sheetTitle: {color: C.ink, fontFamily: F.bold, fontSize: 15},
  sheetSubtitle: {color: C.soft, fontFamily: F.regular, fontSize: 11.5, marginTop: 2},
  closeButton: {alignItems: 'center', backgroundColor: '#F2F4F7', borderRadius: 17, height: 34, justifyContent: 'center', width: 34},
  sheetList: {gap: 9, paddingTop: 14},
  historyListItem: {alignItems: 'center', borderColor: C.border, borderRadius: 13, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 88, padding: 13},
  historyListActive: {backgroundColor: '#F4F8FF', borderColor: C.blue},
  historyListCopy: {flex: 1, minWidth: 0, paddingRight: 10},
  historyListTitleRow: {alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 7},
  historyListTitle: {color: C.ink, fontFamily: F.bold, fontSize: 12.5},
  historyDecisionPill: {borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4},
  historyDecisionText: {fontFamily: F.semibold, fontSize: 9.5},
  historyListDate: {color: C.muted, fontFamily: F.regular, fontSize: 11, marginTop: 5},
  historyListScoreCopy: {alignItems: 'flex-end'},
  historyScoreLine: {alignItems: 'baseline', flexDirection: 'row'},
  historyListScore: {color: C.navy, fontFamily: F.bold, fontSize: 19},
  historyListMax: {color: C.soft, fontFamily: F.semibold, fontSize: 10},
  historyAction: {color: C.soft, fontFamily: F.semibold, fontSize: 10, marginTop: 4},
  historyActionActive: {color: C.blue},
  loading: {gap: 14, paddingTop: 18},
  missing: {alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, marginTop: 20, padding: 28},
  missingTitle: {color: C.ink, fontFamily: F.bold, fontSize: 17, marginTop: 12, textAlign: 'center'},
  missingText: {color: C.muted, fontFamily: F.regular, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: 'center'},
});
