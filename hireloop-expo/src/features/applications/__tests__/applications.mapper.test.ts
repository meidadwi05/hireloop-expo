import {
  canCancelApplication,
  mapApplication,
  mapRecruitmentProcess,
  normalizeApplicationStatus,
} from '../applications.mapper';
import {rawApplicationSchema, recruitmentProcessResponseSchema} from '../applications.schemas';

describe('applications mapper', () => {
  it('membedakan application id dan reference id untuk applicant-data', () => {
    const raw = rawApplicationSchema.parse({
      id: 91,
      job_reference_type: 'project-lowongan',
      job_reference_id: 24,
      job_title: 'Operator Produksi',
      company_name: 'PT Contoh',
      application_status: 'Applied',
      stage_status: 'In Progress',
      submitted_at: '2026-09-30T11:13:00+07:00',
      application_stage_snapshot: [
        {nama: 'Applied', value: 'applied'},
        {nama: 'Screening', value: 'screening'},
        {nama: 'Offering', value: 'offering'},
      ],
    });

    const result = mapApplication(raw);

    expect(result?.applicationId).toBe(91);
    expect(result?.referenceId).toBe(24);
    expect(result?.storageKind).toBe('applicant-data');
    expect(result?.state).toBe('applied');
    expect(result?.stages).toHaveLength(3);
    expect(result && canCancelApplication(result)).toBe(true);
  });

  it('mendeteksi legacy application dan status batal', () => {
    const raw = rawApplicationSchema.parse({
      id: 12,
      job_posting_id: 7,
      status: 'pending',
      deleted_at: '2026-10-01T15:18:00+07:00',
    });

    const result = mapApplication(raw);

    expect(result?.storageKind).toBe('legacy-job-applicant');
    expect(result?.source).toBe('job-posting');
    expect(result?.state).toBe('canceled');
    expect(result && canCancelApplication(result)).toBe(false);
  });

  it('menormalisasi variasi status backend', () => {
    expect(normalizeApplicationStatus('Dibatalkan Kandidat')).toBe('canceled');
    expect(normalizeApplicationStatus('Medical Checkup')).toBe('medical');
    expect(normalizeApplicationStatus('Declined by Company')).toBe('declined-by-company');
    expect(normalizeApplicationStatus('Lamaran dikirim')).toBe('applied');
  });

  it('memetakan proses rekrutmen typed', () => {
    const parsed = recruitmentProcessResponseSchema.parse({
      success: true,
      data: {
        application_id: 91,
        current_stage: {index: 1, value: 'screening', label: 'Screening', status: 'In Progress'},
        final_decision: null,
        stages: [
          {index: 0, value: 'applied', label: 'Applied', status: 'Completed', is_current: false, is_completed: true, started_at: '2026-09-30T11:13:00+07:00'},
          {index: 1, value: 'screening', label: 'Screening', status: 'In Progress', is_current: true, is_completed: false, started_at: '2026-09-30T11:14:00+07:00'},
        ],
      },
    });

    const result = mapRecruitmentProcess(parsed.data);

    expect(result.currentStage.label).toBe('Screening');
    expect(result.stages[0].isCompleted).toBe(true);
    expect(result.stages[1].isCurrent).toBe(true);
  });
});
