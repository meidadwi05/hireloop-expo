import {File, Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {Platform} from 'react-native';

import type {CandidateProfile} from './profile.types';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 54;
const MARGIN_TOP = 48;
const MARGIN_BOTTOM = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

type AtsCvItem = {
  title: string;
  period: string;
  bullets: string[];
};

type AtsCvSection = {
  title: string;
  paragraphs: string[];
  items: AtsCvItem[];
};

export type AtsCvDocument = {
  fullName: string;
  contacts: string[];
  sections: AtsCvSection[];
};

type PdfPage = {commands: string[]};

function cleanText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00a0/g, ' ')
    .replace(/[^\x20-\x7E]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function pdfSafe(value: string): string {
  return cleanText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function textWidth(value: string, fontSize: number, bold = false): number {
  const factor = bold ? 1.04 : 1;
  return [...cleanText(value)].reduce((width, character) => {
    if (character === ' ') return width + fontSize * 0.28;
    if (/[ilI1.,'`]/.test(character)) return width + fontSize * 0.25;
    if (/[MW@%]/.test(character)) return width + fontSize * 0.86;
    if (/[A-Z0-9]/.test(character)) return width + fontSize * 0.6;
    return width + fontSize * 0.5;
  }, 0) * factor;
}

function wrapText(value: string, maxWidth: number, fontSize: number, bold = false): string[] {
  const words = cleanText(value).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = '';

  words.forEach(word => {
    const next = current ? `${current} ${word}` : word;
    if (current && textWidth(next, fontSize, bold) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function formatMonthYear(value: string | null): string {
  if (!value) return '';
  const match = value.match(/^(\d{4})-(\d{2})/);
  if (!match) return cleanText(value);
  const month = Number(match[2]);
  return month >= 1 && month <= 12 ? `${MONTHS[month - 1]} ${match[1]}` : match[1];
}

function formatPeriod(start: string | null, end: string | null, isCurrent = false): string {
  const startText = formatMonthYear(start);
  const endText = startText && (isCurrent || !end) ? 'Sekarang' : formatMonthYear(end);
  return [startText, endText].filter(Boolean).join(' - ');
}

function comparableDate(value: string | null): number {
  if (!value) return 0;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? Number(`${match[1]}${match[2]}${match[3]}`) : 0;
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values.map(cleanText).filter(Boolean).filter(value => {
    const key = value.toLocaleLowerCase('id-ID');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function descriptionBullets(value: string): string[] {
  return value
    .replace(/\r/g, '')
    .split(/\n+/)
    .map(line => line.replace(/^\s*(?:[-*\u2022]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
}

function profileLocation(profile: CandidateProfile): string {
  const address = profile.domicileAddress ?? profile.ktpAddress;
  if (!address) return '';
  const concise = unique([address.regencyName, address.provinceName]).join(', ');
  return concise || cleanText(address.addressLine);
}

export function buildAtsCvDocument(profile: CandidateProfile): AtsCvDocument {
  const skillParagraphs: string[] = [];
  const skills = unique(profile.skills);
  const languages = unique(profile.languages);
  if (skills.length) skillParagraphs.push(`Keahlian: ${skills.join(', ')}`);
  if (languages.length) skillParagraphs.push(`Bahasa: ${languages.join(', ')}`);

  const sections: AtsCvSection[] = [];
  if (profile.selfDescription.trim()) {
    sections.push({
      title: 'Ringkasan Profesional',
      paragraphs: [profile.selfDescription],
      items: [],
    });
  }
  if (skillParagraphs.length) {
    sections.push({title: 'Keahlian', paragraphs: skillParagraphs, items: []});
  }

  const experiences = [...profile.experiences]
    .sort((left, right) => {
      if (left.isCurrent !== right.isCurrent) return left.isCurrent ? -1 : 1;
      return comparableDate(right.startDate) - comparableDate(left.startDate);
    })
    .map(item => ({
      title: [item.position, item.companyName].filter(Boolean).join(' | '),
      period: formatPeriod(item.startDate, item.endDate, item.isCurrent),
      bullets: descriptionBullets(item.description),
    }));
  if (experiences.length) {
    sections.push({title: 'Pengalaman Kerja', paragraphs: [], items: experiences});
  }

  const educations = [...profile.educations]
    .sort((left, right) => (
      comparableDate(right.endDate ?? right.startDate) - comparableDate(left.endDate ?? left.startDate)
    ))
    .map(item => ({
      title: [
        [item.educationLevel, item.majorName].filter(Boolean).join(', '),
        item.schoolName,
      ].filter(Boolean).join(' | '),
      period: formatPeriod(item.startDate, item.endDate),
      bullets: descriptionBullets(item.additionalInfo),
    }));
  if (educations.length) {
    sections.push({title: 'Pendidikan', paragraphs: [], items: educations});
  }

  return {
    fullName: profile.fullName || 'Kandidat HireLoop',
    contacts: [profileLocation(profile), profile.phone, profile.email].map(cleanText).filter(Boolean),
    sections,
  };
}

export function buildAtsCvLines(profile: CandidateProfile): string[] {
  const document = buildAtsCvDocument(profile);
  const lines = [document.fullName, document.contacts.join(' | ')];
  document.sections.forEach(section => {
    lines.push('', section.title.toUpperCase(), ...section.paragraphs.map(cleanText));
    section.items.forEach(item => {
      lines.push([item.title, item.period].filter(Boolean).join(' | '));
      lines.push(...item.bullets.map(bullet => `- ${cleanText(bullet)}`));
    });
  });
  return lines.filter((line, index) => line !== '' || lines[index - 1] !== '');
}

function addText(
  page: PdfPage,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  bold = false,
  align: 'left' | 'center' | 'right' = 'left',
) {
  const safeText = pdfSafe(text);
  let drawX = x;
  const width = textWidth(text, fontSize, bold);
  if (align === 'center') drawX -= width / 2;
  if (align === 'right') drawX -= width;
  page.commands.push(`BT /${bold ? 'F2' : 'F1'} ${fontSize} Tf ${drawX.toFixed(2)} ${y.toFixed(2)} Td (${safeText}) Tj ET`);
}

function addLine(page: PdfPage, x1: number, y1: number, x2: number, y2: number, width: number) {
  page.commands.push(`${width.toFixed(2)} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
}

function createLegacyDocument(lines: string[]): AtsCvDocument {
  const [fullName = 'Kandidat HireLoop', contacts = '', ...content] = lines;
  const sections: AtsCvSection[] = [];
  let current: AtsCvSection | null = null;
  content.forEach(line => {
    if (!line) return;
    if (line === line.toUpperCase()) {
      current = {title: line, paragraphs: [], items: []};
      sections.push(current);
      return;
    }
    if (!current) {
      current = {title: 'Profil', paragraphs: [], items: []};
      sections.push(current);
    }
    current.paragraphs.push(line);
  });
  return {fullName, contacts: contacts ? contacts.split(' | ') : [], sections};
}

export function createAtsPdfBytes(input: AtsCvDocument | string[]): Uint8Array {
  const document = Array.isArray(input) ? createLegacyDocument(input) : input;
  const pages: PdfPage[] = [{commands: ['0.18 0.22 0.28 RG']}];
  let page = pages[0];
  let y = PAGE_HEIGHT - MARGIN_TOP;

  const newPage = () => {
    page = {commands: ['0.18 0.22 0.28 RG']};
    pages.push(page);
    y = PAGE_HEIGHT - MARGIN_TOP;
  };
  const ensureSpace = (height: number) => {
    if (y - height >= MARGIN_BOTTOM) return;
    newPage();
  };
  const paragraph = (value: string, fontSize = 9.5, bold = false, indent = 0, after = 4) => {
    const lineHeight = fontSize * 1.18;
    const lines = wrapText(value, CONTENT_WIDTH - indent, fontSize, bold);
    if (!lines.length) return;
    ensureSpace(lines.length * lineHeight + after);
    lines.forEach(line => {
      addText(page, line, MARGIN_X + indent, y, fontSize, bold);
      y -= lineHeight;
    });
    y -= after;
  };
  const sectionTitle = (title: string) => {
    ensureSpace(28);
    y -= 11;
    addText(page, title.toUpperCase(), MARGIN_X, y, 10.5, true);
    y -= 5;
    addLine(page, MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y, 0.9);
    y -= 13;
  };
  const itemHeader = (item: AtsCvItem) => {
    const dateWidth = item.period ? textWidth(item.period, 9.7, true) : 0;
    const titleWidth = CONTENT_WIDTH - (dateWidth ? dateWidth + 20 : 0);
    const titleLines = wrapText(item.title, titleWidth, 9.7, true);
    const height = Math.max(1, titleLines.length) * 11.5 + 4;
    ensureSpace(height + (item.bullets.length ? 14 : 0));
    titleLines.forEach((line, index) => {
      addText(page, line, MARGIN_X, y - index * 11.5, 9.7, true);
    });
    if (item.period) addText(page, item.period, PAGE_WIDTH - MARGIN_X, y, 9.7, true, 'right');
    y -= height;
  };
  const bullets = (items: string[]) => {
    items.forEach(item => {
      const lines = wrapText(item, CONTENT_WIDTH - 17, 9.3);
      const lineHeight = 11;
      ensureSpace(Math.max(1, lines.length) * lineHeight + 3);
      addText(page, '-', MARGIN_X + 3, y, 9.3);
      lines.forEach((line, index) => {
        addText(page, line, MARGIN_X + 15, y - index * lineHeight, 9.3);
      });
      y -= Math.max(1, lines.length) * lineHeight + 3;
    });
  };

  const nameLines = wrapText(document.fullName.toUpperCase(), CONTENT_WIDTH, 17, true);
  nameLines.forEach(line => {
    addText(page, line, PAGE_WIDTH / 2, y, 17, true, 'center');
    y -= 19;
  });
  if (document.contacts.length) {
    wrapText(document.contacts.join(' | '), CONTENT_WIDTH, 9.2).forEach(line => {
      addText(page, line, PAGE_WIDTH / 2, y, 9.2, false, 'center');
      y -= 12;
    });
  }
  y -= 2;
  addLine(page, MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y, 1.25);
  y -= 5;

  document.sections.forEach(section => {
    sectionTitle(section.title);
    section.paragraphs.forEach(value => paragraph(value));
    section.items.forEach(item => {
      itemHeader(item);
      bullets(item.bullets);
      y -= 5;
    });
  });

  const pageIds = pages.map((_, index) => 5 + index * 2);
  const objects: string[] = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

  pages.forEach((pdfPage, index) => {
    const pageId = pageIds[index];
    const contentId = pageId + 1;
    const content = pdfPage.commands.join('\n');
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Uint8Array.from(pdf, character => character.charCodeAt(0));
}

export function atsCvFileName(fullName: string): string {
  const safeName = cleanText(fullName).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Kandidat';
  return `CV_ATS_${safeName}.pdf`;
}

export async function exportAtsCv(profile: CandidateProfile): Promise<void> {
  const bytes = createAtsPdfBytes(buildAtsCvDocument(profile));
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
