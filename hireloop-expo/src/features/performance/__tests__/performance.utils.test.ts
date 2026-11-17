import type {PerformanceContract} from '../performance.schemas';
import {contractMatches, criterionLabel, decisionEffectiveDate, decisionLabel, performanceHistory, scoreLabel} from '../performance.utils';

const contract = (overrides: Partial<PerformanceContract> = {}): PerformanceContract => ({
  contract_id: 1,
  employee_id: 10,
  employee_code: 'EMP-10',
  employee_name: 'Kandidat',
  position_name: 'Product Designer',
  cycle_number: 1,
  contract_status: 'active',
  kpi_scores_count: 0,
  kpi_status: 'Belum dinilai',
  kpi_scores: [],
  tindak_lanjut_kontrak: 'belum_diputuskan',
  ...overrides,
});

describe('performance utilities', () => {
  it('matches search and assessment status', () => {
    const item = contract({company_name: 'HireLoop', kpi_status: 'Sudah dinilai'});
    expect(contractMatches(item, 'hireloop', 'rated')).toBe(true);
    expect(contractMatches(item, 'hireloop', 'pending')).toBe(false);
    expect(contractMatches(item, 'unknown', 'all')).toBe(false);
  });

  it('uses the same score labels as candidate web', () => {
    expect(scoreLabel(4.5)).toBe('Istimewa');
    expect(scoreLabel(3.5)).toBe('Sangat Baik');
    expect(criterionLabel(2.5)).toBe('Cukup');
    expect(decisionLabel('perlu_tindak_lanjut')).toBe('Perlu Tindak Lanjut');
    expect(decisionLabel('perpanjang_kontrak')).toBe('Perpanjangan');
    expect(decisionLabel('selesai_kontrak')).toBe('Tidak Diperpanjang');
  });

  it('groups and sorts submitted score history for the same job', () => {
    const selected = contract({project_production_lowongan_id: 99, kpi_scores: [{id: 1, evaluation_date: '2026-01-01', status: 'submitted'}]});
    const nextCycle = contract({contract_id: 2, project_production_lowongan_id: 99, kpi_scores: [{id: 2, evaluation_date: '2026-06-01', status: 'submitted'}]});
    const otherJob = contract({contract_id: 3, project_production_lowongan_id: 100, kpi_scores: [{id: 3, evaluation_date: '2026-12-01', status: 'submitted'}]});

    const history = performanceHistory([selected, nextCycle, otherJob], selected);
    expect(history.map(item => item.score.id)).toEqual([2, 1]);
    expect(history.map(item => item.sequence)).toEqual([2, 1]);
    expect(history[0].contract.contract_id).toBe(2);
  });

  it('uses the effective date that belongs to the contract decision', () => {
    expect(decisionEffectiveDate(contract({
      tindak_lanjut_kontrak: 'selesai_kontrak',
      contract_decision: {id: 1, non_extension_effective_date: '2026-10-07'},
    }))).toBe('2026-10-07');
    expect(decisionEffectiveDate(contract({
      tindak_lanjut_kontrak: 'perpanjang_kontrak',
      contract_decision: {id: 2, new_contract_start_date: '2026-10-08'},
    }))).toBe('2026-10-08');
  });
});
