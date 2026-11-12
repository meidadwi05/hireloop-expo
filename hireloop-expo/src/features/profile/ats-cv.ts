import {File, Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {Platform} from 'react-native';

import {formatAddress} from './profile.mapper';
import type {CandidateProfile} from './profile.types';

const PAGE_LINE_LIMIT = 48;
const TEXT_WIDTH = 88;

function pdfSafe(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '-')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrap(value: string, width = TEXT_WIDTH): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = '';
  words.forEach(word => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function section(lines: string[], title: string, content: string[]) {
  if (!content.length) return;
  lines.push('', title.toUpperCase(), ...content);
}

function formatDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', {month: 'short', year: 'numeric'}).format(date);
}

export function buildAtsCvLines(profile: CandidateProfile): string[] {
  const lines = [
    profile.fullName || 'Kandidat HireLoop',
    [profile.email, profile.phone, formatAddress(profile.domicileAddress ?? profile.ktpAddress)].filter(Boolean).join(' | '),
  ].flatMap(line => wrap(line));

  section(lines, 'Ringkasan', wrap(profile.selfDescription));
  section(lines, 'Pengalaman Kerja', profile.experiences.flatMap(item => [
    `${item.position} - ${item.companyName}`,
    `${formatDate(item.startDate)} - ${item.isCurrent ? 'Sekarang' : formatDate(item.endDate)}`,
    item.skills.length ? `Keahlian: ${item.skills.map(skill => skill.name).join(', ')}` : '',
    ...wrap(item.description),
    '',
  ].filter(Boolean)));
  section(lines, 'Pendidikan', profile.educations.flatMap(item => [
    `${item.educationLevel}${item.majorName ? ` - ${item.majorName}` : ''}`,
    item.schoolName,
    [formatDate(item.startDate), formatDate(item.endDate)].filter(Boolean).join(' - '),
    '',
  ].filter(Boolean)));
  section(lines, 'Keahlian', wrap(profile.skills.join(', ')));
  section(lines, 'Tools', wrap(profile.skillTools.map(item => item.name).join(', ')));
  section(lines, 'Bahasa', wrap(profile.languages.join(', ')));
  section(lines, 'Preferensi Kerja', wrap([
    ...profile.jobPreferences.map(item => item.name),
    ...profile.expectedLocations,
  ].filter(Boolean).join(', ')));

  return lines.filter((line, index) => line !== '' || lines[index - 1] !== '');
}

export function createAtsPdfBytes(lines: string[]): Uint8Array {
  const pages = Array.from({length: Math.max(1, Math.ceil(lines.length / PAGE_LINE_LIMIT))}, (_, index) => (
    lines.slice(index * PAGE_LINE_LIMIT, (index + 1) * PAGE_LINE_LIMIT)
  ));
  const pageIds = pages.map((_, index) => 4 + index * 2);
  const objects: string[] = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  pages.forEach((pageLines, index) => {
    const pageId = pageIds[index];
    const contentId = pageId + 1;
    const content = [
      'BT',
      '/F1 10 Tf',
      '14 TL',
      '50 790 Td',
      ...pageLines.flatMap((line, lineIndex) => lineIndex === 0
        ? [`(${pdfSafe(line)}) Tj`]
        : ['T*', `(${pdfSafe(line)}) Tj`]),
      'ET',
    ].join('\n');
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  let document = '%PDF-1.4\n';
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = document.length;
    document += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = document.length;
  document += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    document += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  document += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Uint8Array.from(document, character => character.charCodeAt(0));
}

export function atsCvFileName(fullName: string): string {
  const safeName = pdfSafe(fullName).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Kandidat';
  return `CV_ATS_${safeName}.pdf`;
}

export async function exportAtsCv(profile: CandidateProfile): Promise<void> {
  const bytes = createAtsPdfBytes(buildAtsCvLines(profile));
  const fileName = atsCvFileName(profile.fullName);

  if (Platform.OS === 'web') {
    const webBytes = Uint8Array.from(bytes);
    const blob = new Blob([webBytes.buffer as ArrayBuffer], {type: 'application/pdf'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create({intermediates: true});
  file.write(bytes);
  if (!await Sharing.isAvailableAsync()) throw new Error('Fitur berbagi file tidak tersedia di perangkat ini.');
  await Sharing.shareAsync(file.uri, {mimeType: 'application/pdf', dialogTitle: 'Simpan atau bagikan CV ATS'});
}
