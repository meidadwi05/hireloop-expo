import Ionicons from '@expo/vector-icons/Ionicons';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import type {
  ApplicationStage,
  RecruitmentProcessResult,
  RecruitmentProcessSchedule,
} from '../applications.types';
import {
  APPLICATION_COLORS,
  APPLICATION_FONTS,
  formatApplicationDate,
} from './applications.ui';

const STAGE_WIDTH = 112;

function stageKind(stage: ApplicationStage): string {
  const raw = `${stage.type ?? ''} ${stage.value} ${stage.label}`.toLowerCase();
  if (raw.includes('cancel') || raw.includes('batal')) return 'canceled';
  if (raw.includes('reject') || raw.includes('not completed')) return 'rejected';
  if (raw.includes('hired') || raw.includes('diterima')) return 'hired';
  if (raw.includes('offer')) return 'offering';
  if (raw.includes('medical') || raw.includes('mcu')) return 'medical';
  if (raw.includes('interview') || raw.includes('wawancara')) return 'interview';
  if (raw.includes('test') || raw.includes('tes') || raw.includes('psikotes')) return 'test';
  if (raw.includes('screen')) return 'screening';
  if (raw.includes('applied') || raw.includes('lamaran')) return 'applied';
  return 'stage';
}

function isTerminal(stage: ApplicationStage): boolean {
  return ['canceled', 'rejected', 'hired'].includes(stageKind(stage));
}

function statusTone(status: string | null | undefined) {
  const value = String(status ?? '').toLowerCase();
  if (value.includes('cancel') || value.includes('batal') || value.includes('reject') || value.includes('fail') || value.includes('not complete')) {
    return {color: APPLICATION_COLORS.red, background: '#FFECEF'};
  }
  if (value.includes('complete') || value.includes('pass') || value.includes('accept') || value.includes('hired')) {
    return {color: APPLICATION_COLORS.green, background: '#E7F9F1'};
  }
  if (value.includes('pending')) return {color: '#718097', background: '#EFF2F6'};
  return {color: APPLICATION_COLORS.blue, background: '#EAF2FF'};
}

function stageDate(stage: ApplicationStage): string | null {
  return stage.completedAt ?? stage.startedAt;
}

function cleanTime(value: string | null): string | null {
  if (!value) return null;
  return value.replace(/:\d{2}$/, '');
}

function normalizeUrl(value: string | null): string | null {
  const url = value?.trim();
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function DetailValue({icon, label, value, href}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number | null | undefined;
  href?: string | null;
}) {
  const text = value === null || value === undefined || value === '' ? '-' : String(value);
  const content = (
    <View style={styles.detailValue}>
      <Ionicons name={icon} size={16} color={APPLICATION_COLORS.body} />
      <View style={styles.detailValueCopy}>
        <Text style={styles.detailValueLabel}>{label}</Text>
        <Text style={[styles.detailValueText, href && styles.detailValueLink]}>{text}</Text>
      </View>
    </View>
  );

  if (!href) return content;
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(href)}>
      {content}
    </Pressable>
  );
}

function ActivityCard({icon, title, children}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityIcon}>
          <Ionicons name={icon} size={18} color={APPLICATION_COLORS.blue} />
        </View>
        <Text style={styles.activityTitle}>{title}</Text>
      </View>
      <View style={styles.activityBody}>{children}</View>
    </View>
  );
}

function ResultCard({result, stage}: {result: RecruitmentProcessResult; stage: ApplicationStage}) {
  const kind = stageKind(stage);
  return (
    <ActivityCard icon="document-text-outline" title={`Hasil ${stage.label}`}>
      <View style={styles.detailGrid}>
        <DetailValue icon="play-circle-outline" label="Status Pelaksanaan" value={result.executionStatus} />
        {result.score !== null ? <DetailValue icon="star-outline" label="Nilai / Score" value={result.score} /> : null}
        <DetailValue
          icon="checkmark-circle-outline"
          label={kind === 'medical' ? 'Hasil Medical' : kind === 'test' ? 'Hasil Test' : 'Status Hasil'}
          value={result.status}
        />
        <DetailValue icon="document-text-outline" label="Catatan" value={result.note || 'Tidak ada catatan'} />
      </View>
    </ActivityCard>
  );
}

function ScheduleCard({schedule, stage}: {schedule: RecruitmentProcessSchedule; stage: ApplicationStage}) {
  const kind = stageKind(stage);
  const startTime = cleanTime(schedule.startTime);
  const endTime = cleanTime(schedule.endTime);
  const time = startTime ? `${startTime} s/d ${endTime || 'Selesai'}` : endTime;
  const addressHref = normalizeUrl(schedule.addressLink);
  return (
    <ActivityCard icon="calendar-outline" title={schedule.agenda || `Jadwal ${stage.label}`}>
      <View style={styles.detailGrid}>
        <DetailValue icon="calendar-outline" label="Tanggal" value={formatApplicationDate(schedule.date, false)} />
        <DetailValue icon="time-outline" label="Waktu" value={time} />
        <DetailValue icon="chatbubbles-outline" label="Metode" value={schedule.method} />
        <DetailValue
          icon={kind === 'medical' ? 'medkit-outline' : 'attach-outline'}
          label={kind === 'medical' ? 'Klinik / Provider' : 'Lokasi / Platform'}
          value={schedule.locationPlatform}
        />
        <DetailValue
          icon={kind === 'medical' ? 'location-outline' : 'compass-outline'}
          label={kind === 'medical' ? 'Alamat' : 'Alamat / Link'}
          value={schedule.addressLink}
          href={addressHref}
        />
        <DetailValue icon="document-text-outline" label={kind === 'medical' ? 'Instruksi' : 'Catatan'} value={schedule.note || 'Tidak ada catatan'} />
      </View>
    </ActivityCard>
  );
}

function CancellationCard({schedule, stage}: {schedule: RecruitmentProcessSchedule; stage: ApplicationStage}) {
  return (
    <ActivityCard icon="calendar-clear-outline" title={`Pembatalan Jadwal ${stage.label}`}>
      <View style={styles.detailGrid}>
        <DetailValue icon="document-text-outline" label="Alasan Pembatalan" value={schedule.cancellationReason} />
        <DetailValue icon="help-circle-outline" label="Tindakan Selanjutnya" value={schedule.cancellationAfterAction} />
        <DetailValue icon="document-outline" label="Catatan" value={schedule.cancellationNote || 'Tidak ada catatan'} />
      </View>
    </ActivityCard>
  );
}

function hasCancellation(schedule: RecruitmentProcessSchedule): boolean {
  const status = String(schedule.status ?? '').toLowerCase();
  return Boolean(
    schedule.cancellationReason
      || schedule.cancellationAfterAction
      || schedule.cancellationNote
      || status.includes('cancel')
      || status.includes('batal'),
  );
}

type StageEvent =
  | {key: string; type: 'result'; occurredAt: string | null; result: RecruitmentProcessResult}
  | {key: string; type: 'schedule' | 'cancellation'; occurredAt: string | null; schedule: RecruitmentProcessSchedule};

function StageDetails({stage}: {stage: ApplicationStage}) {
  const events = useMemo<StageEvent[]>(() => [
    ...stage.results.map(result => ({
      key: `result-${result.id}`,
      type: 'result' as const,
      occurredAt: result.updatedAt ?? result.createdAt,
      result,
    })),
    ...stage.schedules.map(schedule => ({
      key: `schedule-${schedule.id}`,
      type: 'schedule' as const,
      occurredAt: schedule.createdAt ?? schedule.updatedAt,
      schedule,
    })),
    ...stage.schedules.filter(hasCancellation).map(schedule => ({
      key: `cancellation-${schedule.id}`,
      type: 'cancellation' as const,
      occurredAt: schedule.updatedAt ?? schedule.createdAt,
      schedule,
    })),
  ].sort((first, second) => {
    const firstTime = first.occurredAt ? Date.parse(first.occurredAt) : 0;
    const secondTime = second.occurredAt ? Date.parse(second.occurredAt) : 0;
    return secondTime - firstTime;
  }), [stage.results, stage.schedules]);

  const latestOffering = stage.offerings[0];
  const effectiveStatus = latestOffering?.status ?? stage.status;
  const effectiveNote = latestOffering?.note ?? stage.note;
  const effectiveDate = latestOffering?.updatedAt ?? latestOffering?.createdAt ?? stageDate(stage);
  const tone = statusTone(effectiveStatus);

  return (
    <View style={styles.stageDetailCard}>
      <View style={styles.stageDetailHeader}>
        <View style={styles.stageDetailIdentity}>
          <View style={styles.stageDetailIcon}>
            <Ionicons name={isTerminal(stage) ? 'flag-outline' : 'ellipse-outline'} size={18} color={APPLICATION_COLORS.blue} />
          </View>
          <Text style={styles.stageDetailTitle}>{stage.label}</Text>
        </View>
        <View style={styles.stageDetailStatusBlock}>
          <View style={[styles.statusPill, {backgroundColor: tone.background}]}>
            <Text style={[styles.statusPillText, {color: tone.color}]}>{effectiveStatus}</Text>
          </View>
          <Text style={styles.stageDetailDate}>{formatApplicationDate(effectiveDate)}</Text>
        </View>
      </View>

      {events.length ? (
        <View style={styles.eventList}>
          {events.map(event => (
            <View key={event.key} style={styles.eventRow}>
              <View style={styles.eventRail}>
                <View style={[
                  styles.eventDot,
                  event.type === 'cancellation' ? styles.eventDotDanger : event.type === 'result' ? styles.eventDotSuccess : styles.eventDotInfo,
                ]} />
                <View style={styles.eventLine} />
              </View>
              <View style={styles.eventContent}>
                <View style={styles.eventMeta}>
                  <Text style={styles.eventLabel}>
                    {event.type === 'cancellation' ? 'Informasi Pembatalan Jadwal' : event.type === 'result' ? 'Informasi Hasil' : 'Informasi Jadwal'}
                  </Text>
                  <Text style={styles.eventDate}>{formatApplicationDate(event.occurredAt)}</Text>
                </View>
                {event.type === 'result'
                  ? <ResultCard result={event.result} stage={stage} />
                  : event.type === 'cancellation'
                    ? <CancellationCard schedule={event.schedule} stage={stage} />
                    : <ScheduleCard schedule={event.schedule} stage={stage} />}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.simpleDetail}>
          <DetailValue icon="information-circle-outline" label="Status Tahap" value={effectiveStatus} />
          <DetailValue icon="calendar-outline" label="Tanggal Aktivitas" value={formatApplicationDate(effectiveDate)} />
          <DetailValue icon="document-text-outline" label="Catatan" value={effectiveNote || 'Detail aktivitas tahap ini belum tersedia.'} />
          {latestOffering?.effectiveDate ? (
            <DetailValue icon="briefcase-outline" label="Tanggal Efektif" value={formatApplicationDate(latestOffering.effectiveDate, false)} />
          ) : null}
        </View>
      )}
    </View>
  );
}

export function ApplicationRecruitmentProgress({stages, currentStageIndex}: {
  stages: ApplicationStage[];
  currentStageIndex?: number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const resolvedCurrentIndex = useMemo(() => {
    const byFlag = stages.findIndex(stage => stage.isCurrent);
    if (byFlag >= 0) return byFlag;
    if (currentStageIndex !== undefined && stages[currentStageIndex]) return currentStageIndex;
    return 0;
  }, [currentStageIndex, stages]);
  const [selectedStageKey, setSelectedStageKey] = useState<string | null>(null);

  const selectedIndex = useMemo(() => {
    if (selectedStageKey) {
      const selected = stages.findIndex(stage => `${stage.value}-${stage.index}` === selectedStageKey);
      if (selected >= 0) return selected;
    }
    return resolvedCurrentIndex;
  }, [resolvedCurrentIndex, selectedStageKey, stages]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({x: Math.max(0, resolvedCurrentIndex * STAGE_WIDTH - STAGE_WIDTH), animated: true});
    }, 0);
    return () => clearTimeout(timeout);
  }, [resolvedCurrentIndex, stages.length]);

  const terminalSourceIndex = isTerminal(stages[resolvedCurrentIndex] ?? stages[0]) ? resolvedCurrentIndex - 1 : -1;
  const selectedStage = stages[selectedIndex] ?? stages[resolvedCurrentIndex] ?? stages[0];

  if (!selectedStage) return null;

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.progressContent}
      >
        {stages.map((stage, index) => {
          const active = stage.isCurrent || index === resolvedCurrentIndex;
          const completed = stage.isCompleted && !active;
          const terminalSource = index === terminalSourceIndex;
          const enabled = completed || active || terminalSource;
          const selected = selectedIndex === index;
          const terminalFailure = ['canceled', 'rejected'].includes(stageKind(stage));
          const connectorReached = completed || (stage.isCompleted && active);
          return (
            <View key={`${stage.value}-${stage.index}`} style={styles.progressStage}>
              {index < stages.length - 1 ? (
                <View style={[styles.progressLine, connectorReached && styles.progressLineReached]} />
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Lihat tahap ${stage.label}`}
                accessibilityState={{disabled: !enabled, selected}}
                disabled={!enabled}
                onPress={() => setSelectedStageKey(`${stage.value}-${stage.index}`)}
                style={({pressed}) => [
                  styles.progressNode,
                  completed && styles.progressNodeCompleted,
                  active && styles.progressNodeActive,
                  active && terminalFailure && styles.progressNodeDanger,
                  terminalSource && styles.progressNodeActive,
                  selected && enabled && styles.progressNodeSelected,
                  pressed && enabled && styles.progressNodePressed,
                ]}
              >
                {completed ? <Ionicons name="checkmark" size={15} color="white" /> : null}
                {active && terminalFailure ? <Ionicons name="close" size={15} color="white" /> : null}
                {(active && !terminalFailure) || terminalSource ? <View style={styles.progressCurrentDot} /> : null}
              </Pressable>
              <Text numberOfLines={2} style={[
                styles.progressLabel,
                enabled && styles.progressLabelReached,
                selected && enabled && styles.progressLabelSelected,
              ]}>
                {stage.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.detailDivider} />
      <StageDetails stage={selectedStage} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressContent: {paddingHorizontal: 3, paddingTop: 4, paddingBottom: 9},
  progressStage: {width: STAGE_WIDTH, minHeight: 76, alignItems: 'center', position: 'relative', paddingHorizontal: 6},
  progressLine: {position: 'absolute', top: 13, left: '61%', width: '89%', height: 2, backgroundColor: APPLICATION_COLORS.future},
  progressLineReached: {backgroundColor: APPLICATION_COLORS.green},
  progressNode: {width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: APPLICATION_COLORS.future, backgroundColor: '#EEF2F7', alignItems: 'center', justifyContent: 'center', zIndex: 2},
  progressNodeCompleted: {borderColor: APPLICATION_COLORS.green, backgroundColor: APPLICATION_COLORS.green},
  progressNodeActive: {borderColor: APPLICATION_COLORS.blue, backgroundColor: APPLICATION_COLORS.blue},
  progressNodeDanger: {borderColor: APPLICATION_COLORS.red, backgroundColor: APPLICATION_COLORS.red},
  progressNodeSelected: {shadowColor: APPLICATION_COLORS.blue, shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.32, shadowRadius: 6, elevation: 5, borderWidth: 3},
  progressNodePressed: {transform: [{scale: 0.92}]},
  progressCurrentDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: 'white'},
  progressLabel: {width: 102, marginTop: 7, fontFamily: APPLICATION_FONTS.semibold, fontSize: 10.5, lineHeight: 14, textAlign: 'center', color: APPLICATION_COLORS.muted},
  progressLabelReached: {color: APPLICATION_COLORS.navy},
  progressLabelSelected: {color: APPLICATION_COLORS.blue},
  detailDivider: {height: 1, backgroundColor: '#EDF1F7', marginTop: 6, marginBottom: 14},
  stageDetailCard: {borderRadius: 14, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: 'white', padding: 13},
  stageDetailHeader: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10},
  stageDetailIdentity: {flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9},
  stageDetailIcon: {width: 34, height: 34, borderRadius: 9, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center'},
  stageDetailTitle: {flex: 1, fontFamily: APPLICATION_FONTS.bold, fontSize: 13.5, lineHeight: 19, color: APPLICATION_COLORS.navy},
  stageDetailStatusBlock: {maxWidth: '45%', alignItems: 'flex-end', gap: 4},
  statusPill: {maxWidth: '100%', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5},
  statusPillText: {fontFamily: APPLICATION_FONTS.bold, fontSize: 9, lineHeight: 13, textAlign: 'center'},
  stageDetailDate: {fontFamily: APPLICATION_FONTS.medium, fontSize: 8.5, lineHeight: 13, color: APPLICATION_COLORS.muted, textAlign: 'right'},
  simpleDetail: {gap: 13, marginTop: 15, borderTopWidth: 1, borderTopColor: '#EDF1F7', paddingTop: 13},
  eventList: {marginTop: 17},
  eventRow: {flexDirection: 'row', alignItems: 'stretch'},
  eventRail: {width: 18, alignItems: 'center'},
  eventDot: {width: 9, height: 9, borderRadius: 5, marginTop: 4, zIndex: 2, borderWidth: 2, borderColor: 'white'},
  eventDotDanger: {backgroundColor: APPLICATION_COLORS.red},
  eventDotSuccess: {backgroundColor: APPLICATION_COLORS.green},
  eventDotInfo: {backgroundColor: APPLICATION_COLORS.blue},
  eventLine: {position: 'absolute', top: 12, bottom: -1, width: 1.5, backgroundColor: APPLICATION_COLORS.border},
  eventContent: {flex: 1, minWidth: 0, paddingLeft: 7, paddingBottom: 16},
  eventMeta: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 7},
  eventLabel: {fontFamily: APPLICATION_FONTS.semibold, fontSize: 9.5, lineHeight: 14, color: APPLICATION_COLORS.body},
  eventDate: {fontFamily: APPLICATION_FONTS.medium, fontSize: 8.5, lineHeight: 13, color: APPLICATION_COLORS.muted},
  activityCard: {overflow: 'hidden', borderRadius: 11, borderWidth: 1, borderColor: APPLICATION_COLORS.border, backgroundColor: '#FFFFFF'},
  activityHeader: {minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 11, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EDF1F7'},
  activityIcon: {width: 28, height: 28, borderRadius: 8, backgroundColor: '#EDF5FF', alignItems: 'center', justifyContent: 'center'},
  activityTitle: {flex: 1, fontFamily: APPLICATION_FONTS.bold, fontSize: 11.5, lineHeight: 17, color: APPLICATION_COLORS.navy},
  activityBody: {padding: 11},
  detailGrid: {gap: 13},
  detailValue: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  detailValueCopy: {flex: 1, minWidth: 0},
  detailValueLabel: {fontFamily: APPLICATION_FONTS.semibold, fontSize: 8.5, lineHeight: 13, color: APPLICATION_COLORS.muted},
  detailValueText: {marginTop: 1, fontFamily: APPLICATION_FONTS.medium, fontSize: 10.5, lineHeight: 16, color: APPLICATION_COLORS.navy},
  detailValueLink: {color: APPLICATION_COLORS.blue, textDecorationLine: 'underline'},
});
