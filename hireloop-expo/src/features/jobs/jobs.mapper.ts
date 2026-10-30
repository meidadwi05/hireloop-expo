import type {
  CandidateJobCard,
  CandidateJobDetail,
  CandidateJobSource,
  CandidateJobsPage,
} from './jobs.types';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function asText(...values: unknown[]): string {
  const value = values.find(item => typeof item === 'string' && item.trim());
  return typeof value === 'string' ? value.trim() : '';
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(item => typeof item === 'string'
        ? item.trim()
        : asText(
          asRecord(item).name,
          asRecord(item).nama,
          asRecord(item).skill_name,
          asRecord(item).nama_skill,
        ))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return asStringArray(parsed);
    } catch {
      // Some existing records store a comma-separated skill list.
    }

    return trimmed.split(',').map(item => item.trim()).filter(Boolean);
  }

  return [];
}

function humanize(value: unknown, fallback: string): string {
  const text = asText(value);
  if (!text) return fallback;

  return text
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatCurrency(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const amount = asNumber(value, -1);
  if (amount < 0) return '';
  return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
}

function formatSalary(job: Record<string, unknown>, source: CandidateJobSource): string {
  if (source === 'project-lowongan' && Boolean(job.gaji_tidak_disebutkan)) {
    return 'Gaji tidak disebutkan';
  }

  const direct = asText(job.salary, job.salary_range, job.rentang_gaji);
  if (direct) return direct;

  const min = source === 'project-lowongan'
    ? formatCurrency(job.gaji_minimal)
    : formatCurrency(job.min_salary ?? job.salary_min);
  const max = source === 'project-lowongan'
    ? formatCurrency(job.gaji_maksimal)
    : formatCurrency(job.max_salary ?? job.salary_max);

  if (min && max) return `${min} - ${max} / bulan`;
  if (min) return `Mulai ${min} / bulan`;
  if (max) return `Hingga ${max} / bulan`;
  return 'Gaji tidak disebutkan';
}

function validDate(value: unknown): string | null {
  const text = asText(value);
  return text && !Number.isNaN(Date.parse(text)) ? text : null;
}

function relativeDateLabel(prefix: string, value: string | null): string {
  if (!value) return `${prefix} baru-baru ini`;
  const difference = Math.max(0, Date.now() - Date.parse(value));
  const days = Math.floor(difference / 86_400_000);
  if (days === 0) return `${prefix} hari ini`;
  if (days < 30) return `${prefix} ${days} hari yang lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${prefix} ${months} bulan yang lalu`;
  return `${prefix} ${Math.floor(months / 12)} tahun yang lalu`;
}

function closingDateLabel(value: string | null): string {
  if (!value) return 'Batas akhir tidak ditentukan';
  return `Berakhir ${new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))}`;
}

function normalizeSource(value: unknown): CandidateJobSource {
  return value === 'project-lowongan' ? 'project-lowongan' : 'job-posting';
}

export function mapJobCard(entry: unknown, index = 0): CandidateJobCard {
  const wrapper = asRecord(entry);
  const job = asRecord(wrapper.job ?? wrapper);
  const project = asRecord(job.project);
  const companyUser = asRecord(job.user);
  const source = normalizeSource(wrapper.source ?? job.source);
  const id = asNumber(job.id, index + 1);
  const skills = asStringArray(job.skills ?? job.keahlian);
  const location = asText(job.location, job.lokasi_kerja, job.city) || 'Lokasi tidak ditentukan';
  const contractType = source === 'project-lowongan'
    ? humanize(job.jenis_kontrak, 'Kontrak tidak ditentukan')
    : humanize(job.work_type, 'Kontrak tidak ditentukan');
  const workMode = source === 'project-lowongan'
    ? humanize(job.pengaturan_tempat_kerja, 'Sistem kerja tidak ditentukan')
    : humanize(job.job_type_expected, 'Sistem kerja tidak ditentukan');
  const salaryLabel = formatSalary(job, source);
  const closingDate = validDate(
    source === 'project-lowongan'
      ? job.tanggal_tutup_lamaran ?? job.deadline_pemenuhan
      : job.closing_date,
  );
  const publishedAt = validDate(
    source === 'project-lowongan'
      ? job.tanggal_publish ?? job.created_at
      : job.published_at ?? job.created_at,
  );
  const updatedAt = validDate(job.updated_at);
  const status = asText(job.status, job.status_lowongan).toLowerCase();
  const active = source === 'project-lowongan'
    ? ['published', 'scheduled'].includes(status)
    : status === '' || (status === 'published' && job.is_active_hiring !== false);

  return {
    id,
    key: `${source}:${id}`,
    source,
    title: asText(job.title, job.nama_lowongan, job.posisi, job.jabatan) || 'Posisi Pekerjaan',
    company: asText(job.company_name, project.client, project.nama_project, companyUser.company_name) || 'Perusahaan HireLoop',
    location,
    contractType,
    workMode,
    salaryLabel,
    urgent: Boolean(job.is_urgent) || ['high', 'urgent'].includes(asText(job.prioritas_hiring).toLowerCase()),
    active,
    skills,
    applicantsCount: Math.max(0, asNumber(job.applicants_count)),
    closingDate,
    publishedAt,
    updatedAt,
    closingLabel: closingDateLabel(closingDate),
    publishedLabel: relativeDateLabel('Tayang', publishedAt),
    updatedLabel: relativeDateLabel('Diperbarui', updatedAt),
    workType: workMode,
    salary: salaryLabel,
  };
}

export function mapCandidateJobsPage(payload: {
  data: unknown[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}): CandidateJobsPage {
  return {
    items: payload.data.map(mapJobCard),
    currentPage: payload.current_page,
    lastPage: payload.last_page,
    perPage: payload.per_page,
    total: payload.total,
    from: payload.from,
    to: payload.to,
  };
}

function splitTextList(value: unknown): string[] {
  if (Array.isArray(value)) return asStringArray(value);
  const text = asText(value);
  if (!text) return [];

  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) return asStringArray(parsed);
  } catch {
    // Legacy records can still contain newline, semicolon, or bullet-delimited text.
  }

  return text
    .split(/\r?\n|;|\u2022/)
    .map(item => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

export function mapJobDetail(payload: unknown, source: CandidateJobSource): CandidateJobDetail {
  const envelope = asRecord(payload);
  const rawJob = asRecord(envelope.data ?? payload);
  const card = mapJobCard({source, job: rawJob});

  return {
    ...card,
    description: asText(rawJob.description, rawJob.deskripsi_pekerjaan) || 'Deskripsi pekerjaan belum tersedia.',
    requirements: splitTextList(rawJob.requirements ?? rawJob.kualifikasi),
    benefits: splitTextList(rawJob.benefits ?? rawJob.benefit),
    education: humanize(rawJob.education_level ?? rawJob.pendidikan_minimal, 'Tidak ditentukan'),
    experience: typeof (rawJob.min_experience ?? rawJob.pengalaman) === 'number'
      ? `${String(rawJob.min_experience ?? rawJob.pengalaman)} tahun`
      : humanize(rawJob.min_experience ?? rawJob.pengalaman, 'Tidak ditentukan'),
  };
}
