import type {PerformanceContract, PerformanceScore} from './performance.schemas';

export type PerformanceFilter = 'all' | 'pending' | 'rated';

export const KPI_CRITERIA = [
  ['kualitas_kerja', 'Kualitas Kerja'],
  ['produktivitas', 'Produktivitas'],
  ['kehadiran_ketepatan_waktu', 'Kehadiran & Ketepatan Waktu'],
  ['kedisiplinan_kepatuhan', 'Kedisiplinan & Kepatuhan'],
  ['sikap_kerja_sama', 'Sikap Kerja Sama'],
] as const;

export function formatPerformanceDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}).format(date);
}

export function scoreLabel(score?: number | null): string {
  if (score == null) return 'Belum dinilai';
  if (score >= 4.5) return 'Istimewa';
  if (score >= 3.5) return 'Sangat Baik';
  if (score >= 2.5) return 'Baik';
  if (score >= 1.5) return 'Perlu Perbaikan';
  return 'Tidak Memenuhi Ekspektasi';
}

export function criterionLabel(score?: number | null): string {
  if (score == null) return '-';
  if (score >= 4.5) return 'Sangat Baik';
  if (score >= 3.5) return 'Baik';
  if (score >= 2.5) return 'Cukup';
  if (score >= 1.5) return 'Kurang';
  return 'Sangat Kurang';
}

export function decisionLabel(value?: string | null): string {
  const labels: Record<string, string> = {
    perpanjang: 'Perpanjangan',
    selesai: 'Tidak Diperpanjang',
    perlu_tindak_lanjut: 'Perlu Tindak Lanjut',
    belum_diputuskan: 'Belum Diputuskan',
  };
  return labels[value ?? ''] ?? 'Belum Diputuskan';
}

export function contractMatches(contract: PerformanceContract, search: string, filter: PerformanceFilter): boolean {
  const needle = search.trim().toLocaleLowerCase('id-ID');
  const haystack = [contract.position_name, contract.lowongan_name, contract.project_name, contract.company_name]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('id-ID');
  const filterMatches = filter === 'all'
    || (filter === 'rated' && contract.kpi_status === 'Sudah dinilai')
    || (filter === 'pending' && contract.kpi_status !== 'Sudah dinilai');
  return filterMatches && (!needle || haystack.includes(needle));
}

export function performanceHistory(contracts: PerformanceContract[], selected: PerformanceContract): PerformanceScore[] {
  const sameJob = contracts.filter(item => {
    if (item.employee_id !== selected.employee_id) return false;
    if (selected.project_production_lowongan_id != null) {
      return item.project_production_lowongan_id === selected.project_production_lowongan_id;
    }
    if (selected.lowongan_name) return item.lowongan_name === selected.lowongan_name;
    return item.position_name === selected.position_name && item.project_name === selected.project_name;
  });
  const unique = new Map<number, PerformanceScore>();
  sameJob.flatMap(item => item.kpi_scores).forEach(score => unique.set(score.id, score));
  return [...unique.values()].sort((left, right) => {
    const leftDate = Date.parse(left.evaluation_date ?? left.created_at ?? '') || 0;
    const rightDate = Date.parse(right.evaluation_date ?? right.created_at ?? '') || 0;
    return rightDate - leftDate;
  });
}

