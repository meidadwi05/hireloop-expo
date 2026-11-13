import type {AvailabilityStatus, EmploymentStatus, MasterOption, WorkSystem} from './onboarding.types';

export const educationLevelOptions: MasterOption[] = [
  {value: 'Kurang dari SD', label: 'Kurang dari SD'},
  {value: 'SD', label: 'SD/Sederajat'},
  {value: 'SMP', label: 'SMP/Sederajat'},
  {value: 'SMA/SMK', label: 'SMA/SMK/Sederajat'},
  {value: 'D1', label: 'Diploma I (D1)'},
  {value: 'D2', label: 'Diploma II (D2)'},
  {value: 'D3', label: 'Diploma III (D3)'},
  {value: 'D4', label: 'Diploma IV (D4)'},
  {value: 'S1', label: 'Sarjana (S1)'},
  {value: 'S2', label: 'Magister (S2)'},
  {value: 'S3', label: 'Doktor (S3)'},
];

export const workSystemOptions: {value: WorkSystem; label: string}[] = [
  {value: 'on_site', label: 'On Site'},
  {value: 'remote', label: 'Remote'},
  {value: 'hybrid', label: 'Hybrid'},
];

export const employmentStatusOptions: {value: EmploymentStatus; label: string}[] = [
  {value: 'full_time', label: 'Full Time'},
  {value: 'paruh_waktu', label: 'Paruh Waktu'},
  {value: 'kontrak', label: 'Kontrak'},
  {value: 'freelance', label: 'Freelance'},
  {value: 'internship', label: 'Internship'},
  {value: 'outsourcing', label: 'Outsourcing'},
  {value: 'kasual', label: 'Kasual'},
];

export const availabilityOptions: {value: Exclude<AvailabilityStatus, ''>; label: string}[] = [
  {value: 'available', label: 'Siap Bekerja'},
  {value: 'actively_looking', label: 'Terbuka untuk Peluang'},
];

export function isNoFormalEducation(value: string): boolean {
  return ['KURANG DARI SD', 'TIDAK BERSEKOLAH', 'TIDAK SEKOLAH'].includes(value.trim().replaceAll('_', ' ').toUpperCase());
}

export function normalizeWorkSystem(value: unknown): WorkSystem | '' {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');
  if (['onsite', 'on_site'].includes(normalized)) return 'on_site';
  if (normalized === 'remote' || normalized === 'hybrid') return normalized;
  return '';
}

export function normalizeEmploymentStatus(value: unknown): EmploymentStatus | '' {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');
  const aliases: Record<string, EmploymentStatus> = {
    full_time: 'full_time',
    penuh_waktu: 'full_time',
    part_time: 'paruh_waktu',
    parttime: 'paruh_waktu',
    paruh_waktu: 'paruh_waktu',
    contract: 'kontrak',
    kontrak: 'kontrak',
    freelance: 'freelance',
    internship: 'internship',
    magang: 'internship',
    outsourcing: 'outsourcing',
    casual: 'kasual',
    kasual: 'kasual',
  };
  return aliases[normalized] ?? '';
}

export function normalizeAvailability(value: unknown): AvailabilityStatus {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll('_', ' ');
  if (['available', 'siap bekerja', 'segera'].includes(normalized)) return 'available';
  if (['actively looking', 'terbuka untuk peluang', '2minggu', '30hari'].includes(normalized)) return 'actively_looking';
  if (['not available', 'belum tersedia'].includes(normalized)) return 'not_available';
  return '';
}
