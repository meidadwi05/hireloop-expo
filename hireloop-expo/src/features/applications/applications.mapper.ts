import type {RawApplication, RawRecruitmentProcess} from './applications.schemas';
import type {ApplicationStage, ApplicationUiState, CandidateApplication, RecruitmentProcess} from './applications.types';

const DEFAULT_STAGES = [
  {label: 'Applied', value: 'applied'},
  {label: 'Screening', value: 'screening'},
  {label: 'Interview', value: 'interview'},
  {label: 'Offering', value: 'offering'},
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function asText(...values: unknown[]): string {
  const result = values.find(value => typeof value === 'string' && value.trim());
  return typeof result === 'string' ? result.trim() : '';
}

function parseStageSnapshot(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.map(asRecord);
  if (!value || typeof value !== 'string') return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(asRecord) : [asRecord(parsed)].filter(item => Object.keys(item).length > 0);
  } catch {
    return [];
  }
}

export function normalizeApplicationStatus(value: unknown): string {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return '';
  if (raw.includes('cancel') || raw.includes('batal') || raw.includes('withdraw')) return 'canceled';
  if (raw.includes('reject') || raw.includes('tidak lolos') || raw.includes('not complete') || raw.includes('failed')) return 'rejected';
  if (raw.includes('hired') || raw.includes('diterima') || raw === 'accepted') return 'hired';
  if (raw.includes('closed') || raw.includes('ditutup')) return 'closed';
  if (raw.includes('screen')) return 'screening';
  if (raw.includes('medical') || raw.includes('mcu')) return 'medical';
  if (raw.includes('offer')) return 'offering';
  if (raw.includes('interview')) return raw.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (raw.includes('test') || raw.includes('tes') || raw.includes('psikotes')) return 'test';
  if (raw.includes('applied') || raw.includes('lamaran') || raw === 'pending') return 'applied';
  return raw.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function stateFromApplication(raw: RawApplication, currentValue: string): ApplicationUiState {
  const combined = [
    raw.application_status,
    raw.status,
    raw.status_key,
    raw.status_label,
    raw.stage_status,
    raw.current_stage_value,
    raw.current_stage_name,
    raw.current_stage_label,
  ].filter(Boolean).join(' ');

  if (raw.deleted_at || raw.canceled_at || raw.cancelled_at || normalizeApplicationStatus(combined) === 'canceled') return 'canceled';
  if (Boolean(raw.is_temporary)) return 'temporary';
  if (
    (raw.transfer_type && raw.transfer_type !== 'none')
    || raw.transferred_from_applicant_id
    || combined.toLowerCase().includes('moved to')
    || combined.toLowerCase().includes('dialihkan')
  ) return 'transferred';

  const normalized = normalizeApplicationStatus(combined || currentValue);
  if (normalized === 'hired') return 'hired';
  if (normalized === 'rejected') return 'rejected';
  if (normalized === 'closed') return 'closed';
  if (normalized === 'applied' || !normalized) return 'applied';
  return 'in-progress';
}

function stagesFromApplication(raw: RawApplication, currentValue: string, state: ApplicationUiState): ApplicationStage[] {
  const snapshot = parseStageSnapshot(raw.application_stage_snapshot ?? raw.stage_snapshot);
  const definitionSource: Record<string, unknown>[] = snapshot.length
    ? snapshot
    : DEFAULT_STAGES.map(item => ({...item}));
  const definitions = definitionSource.map((item, index) => {
    const label = asText(item.nama, item.label, item.title) || `Tahap ${index + 1}`;
    const value = asText(item.value) || normalizeApplicationStatus(label) || `stage-${index}`;
    return {label, value};
  });

  if (!definitions.some(stage => normalizeApplicationStatus(stage.value || stage.label) === 'applied')) {
    definitions.unshift(DEFAULT_STAGES[0]);
  }

  let currentIndex = Number.isInteger(raw.current_stage_index) ? Number(raw.current_stage_index) : -1;
  if (currentIndex < 0 || currentIndex >= definitions.length) {
    currentIndex = definitions.findIndex(stage => normalizeApplicationStatus(stage.value || stage.label) === currentValue);
  }
  if (currentIndex < 0) currentIndex = state === 'applied' ? 0 : Math.min(1, definitions.length - 1);

  const stages: ApplicationStage[] = definitions.map((stage, index) => ({
    index,
    value: stage.value,
    label: stage.label,
    type: null,
    status: index < currentIndex ? 'Completed' : index === currentIndex ? raw.stage_status || 'In Progress' : 'Pending',
    isCurrent: index === currentIndex,
    isCompleted: index < currentIndex,
    startedAt: index === 0 ? raw.submitted_at ?? raw.created_at ?? null : null,
    completedAt: null,
    note: null,
  }));

  if (['canceled', 'rejected', 'closed', 'hired'].includes(state)) {
    const labelByState = {canceled: 'Dibatalkan', rejected: 'Rejected', closed: 'Ditutup', hired: 'Hired'} as const;
    stages.forEach(stage => { stage.isCurrent = false; });
    stages.push({
      index: stages.length,
      value: state,
      label: labelByState[state as keyof typeof labelByState],
      type: 'terminal',
      status: state,
      isCurrent: true,
      isCompleted: true,
      startedAt: raw.deleted_at ?? raw.canceled_at ?? raw.cancelled_at ?? raw.updated_at ?? null,
      completedAt: raw.deleted_at ?? raw.canceled_at ?? raw.cancelled_at ?? raw.updated_at ?? null,
      note: null,
    });
  }

  return stages;
}

export function mapApplication(raw: RawApplication): CandidateApplication | null {
  const storageKind = raw.job_reference_type ? 'applicant-data' : 'legacy-job-applicant';
  const source = raw.job_reference_type === 'project-lowongan' ? 'project-lowongan' : 'job-posting';
  const referenceId = Number(raw.job_reference_id ?? raw.job_posting_id);
  if (!Number.isInteger(referenceId) || referenceId <= 0) return null;

  const currentRaw = asText(
    raw.current_stage_value,
    raw.current_stage_name,
    raw.current_stage_label,
    raw.application_status,
    raw.status,
  );
  const currentStageValue = normalizeApplicationStatus(currentRaw) || 'applied';
  const state = stateFromApplication(raw, currentStageValue);
  const stages = stagesFromApplication(raw, currentStageValue, state);
  const currentStage = stages.find(stage => stage.isCurrent) ?? stages[0];

  return {
    applicationId: raw.id,
    source,
    referenceId,
    storageKind,
    title: asText(raw.job_title) || 'Lowongan Pekerjaan',
    company: asText(raw.company_name) || 'Perusahaan HireLoop',
    location: asText(raw.location) || 'Lokasi tidak tersedia',
    applicationStatus: asText(raw.application_status, raw.status) || 'Applied',
    stageStatus: asText(raw.stage_status) || 'In Progress',
    currentStageIndex: currentStage?.index ?? 0,
    currentStageValue: currentStage?.value ?? currentStageValue,
    currentStageLabel: currentStage?.label ?? (currentRaw || 'Applied'),
    stages,
    state,
    submittedAt: raw.submitted_at ?? raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    canceledAt: raw.canceled_at ?? raw.cancelled_at ?? raw.deleted_at ?? null,
    isTemporary: Boolean(raw.is_temporary),
    isTransferred: state === 'transferred',
    transferNote: raw.transfer_note ?? null,
  };
}

export function mapApplications(raw: RawApplication[]): CandidateApplication[] {
  return raw.map(mapApplication).filter((item): item is CandidateApplication => item !== null);
}

export function mapRecruitmentProcess(raw: RawRecruitmentProcess): RecruitmentProcess {
  return {
    applicationId: raw.application_id,
    currentStage: {
      index: raw.current_stage.index,
      value: raw.current_stage.value,
      label: raw.current_stage.label,
      status: raw.current_stage.status,
    },
    finalDecision: raw.final_decision ? {
      value: raw.final_decision.value,
      label: raw.final_decision.label,
      status: raw.final_decision.status,
      note: raw.final_decision.note ?? null,
      decidedAt: raw.final_decision.decided_at ?? null,
    } : null,
    stages: raw.stages.map(stage => ({
      index: stage.index,
      value: stage.value,
      label: stage.label,
      type: stage.type ?? null,
      status: stage.status,
      isCurrent: stage.is_current,
      isCompleted: stage.is_completed,
      startedAt: stage.started_at ?? null,
      completedAt: stage.completed_at ?? null,
      note: stage.note ?? null,
    })),
  };
}

export function mergeRecruitmentProcess(application: CandidateApplication, process: RecruitmentProcess): CandidateApplication {
  const current = process.stages.find(stage => stage.isCurrent) ?? process.stages[process.currentStage.index];
  const finalState = process.finalDecision?.value;
  const normalized = normalizeApplicationStatus(process.currentStage.value || process.currentStage.label);
  const state: ApplicationUiState = finalState === 'hired'
    ? 'hired'
    : finalState === 'rejected'
      ? 'rejected'
      : normalized === 'canceled' || normalized === 'closed'
        ? normalized
        : normalized === 'applied' ? 'applied' : 'in-progress';

  return {
    ...application,
    state,
    stages: process.stages,
    currentStageIndex: process.currentStage.index,
    currentStageValue: process.currentStage.value,
    currentStageLabel: current?.label ?? process.currentStage.label,
    stageStatus: process.currentStage.status,
  };
}

export function canCancelApplication(application: CandidateApplication): boolean {
  if (application.isTemporary || application.isTransferred) return false;
  if (application.state !== 'applied') return false;
  const stageStatus = application.stageStatus.trim().toLowerCase();
  if (['not completed', 'not complete', 'locked'].includes(stageStatus)) return false;
  return normalizeApplicationStatus(application.currentStageValue || application.applicationStatus) === 'applied';
}
