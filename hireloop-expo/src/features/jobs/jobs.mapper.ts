import type {JobCardModel} from './jobs.types';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function asText(...values: unknown[]): string {
  const value = values.find(item => typeof item === 'string' && item.trim());
  return typeof value === 'string' ? value.trim() : '';
}

export function mapJobCard(entry: unknown, index: number): JobCardModel {
  const wrapper = asRecord(entry);
  const job = asRecord(wrapper.job ?? wrapper);
  const project = asRecord(job.project);
  const companyUser = asRecord(job.user);
  const source = asText(wrapper.source, job.source) || 'job';
  const skillsRaw = Array.isArray(job.skills) ? job.skills : [];
  const skills = skillsRaw
    .map(skill => typeof skill === 'string'
      ? skill
      : asText(asRecord(skill).name, asRecord(skill).skill_name, asRecord(skill).nama_skill))
    .filter(Boolean)
    .slice(0, 5);
  const salaryMin = job.salary_min ?? job.gaji_min ?? job.min_salary;
  const salaryMax = job.salary_max ?? job.gaji_max ?? job.max_salary;
  const salary = asText(job.salary, job.salary_range, job.rentang_gaji)
    || (salaryMin && salaryMax
      ? `Rp${Number(salaryMin).toLocaleString('id-ID')} – Rp${Number(salaryMax).toLocaleString('id-ID')} / bulan`
      : 'Gaji tidak disebutkan');

  return {
    id: `${source}-${String(job.id ?? index)}`,
    source,
    title: asText(job.title, job.nama_lowongan, job.posisi, job.jabatan) || 'Posisi Pekerjaan',
    company: asText(job.company_name, project.client, project.nama_project, companyUser.company_name) || 'Perusahaan HireLoop',
    location: asText(job.location, job.lokasi_kerja, job.city) || 'Indonesia',
    workType: asText(job.work_type, job.employment_type, job.sistem_kerja, job.tipe_pekerjaan) || 'On-site',
    salary,
    urgent: Boolean(job.is_urgent) || ['high', 'urgent'].includes(String(job.prioritas_hiring ?? '').toLowerCase()),
    skills: skills.length ? skills : ['Komunikasi', 'Kolaborasi'],
    publishedLabel: 'Tayang baru-baru ini',
    updatedLabel: 'Diperbarui terbaru',
  };
}
