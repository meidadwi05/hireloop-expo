import {render} from '@testing-library/react-native';
import React from 'react';

import {JobInformationSections} from '../components/JobInformationSections';
import type {CandidateJobDetail} from '../jobs.types';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

function detail(overrides: Partial<CandidateJobDetail> = {}): CandidateJobDetail {
  return {
    id: 1,
    key: 'project-lowongan:1',
    source: 'project-lowongan',
    title: 'Operator Produksi',
    company: 'HireLoop',
    location: 'Karawang',
    contractType: 'Kontrak',
    workMode: 'On Site',
    salaryLabel: 'Rp6.000.000 / bulan',
    urgent: false,
    active: true,
    skills: ['Quality Control', 'Adaptability'],
    applicantsCount: 1,
    closingDate: null,
    publishedAt: null,
    updatedAt: null,
    closingLabel: 'Batas akhir tidak ditentukan',
    publishedLabel: '',
    updatedLabel: '',
    workType: 'On Site',
    salary: 'Rp6.000.000 / bulan',
    description: 'Mengoperasikan mesin',
    descriptionItems: ['Mengoperasikan mesin'],
    requirements: ['Teliti dan disiplin'],
    additionalQualifications: ['Usia 20 - 21 tahun'],
    benefits: ['THR'],
    education: 'SMA/SMK',
    experience: 'Tanpa pengalaman',
    documentRequirements: [],
    familyDeclarationRequired: false,
    policies: [],
    ...overrides,
  };
}

describe('JobInformationSections', () => {
  it('renders four web-aligned information cards and their content', () => {
    const screen = render(<JobInformationSections job={detail()} />);

    expect(screen.getByTestId('job-information-description')).toBeTruthy();
    expect(screen.getByTestId('job-information-qualifications')).toBeTruthy();
    expect(screen.getByTestId('job-information-skills')).toBeTruthy();
    expect(screen.getByTestId('job-information-benefits')).toBeTruthy();
    expect(screen.getByText('Deskripsi Pekerjaan')).toBeTruthy();
    expect(screen.getByText('Kualifikasi')).toBeTruthy();
    expect(screen.getByText('Keahlian yang Dibutuhkan')).toBeTruthy();
    expect(screen.getByText('Benefit')).toBeTruthy();
    expect(screen.getByText('Usia 20 - 21 tahun')).toBeTruthy();
    expect(screen.getByText('Teliti dan disiplin')).toBeTruthy();
    expect(screen.getByText('Quality Control')).toBeTruthy();
    expect(screen.getByText('THR')).toBeTruthy();
  });

  it('keeps all cards visible with a dash when detail arrays are empty', () => {
    const screen = render(<JobInformationSections job={detail({
      descriptionItems: [],
      requirements: [],
      additionalQualifications: [],
      skills: [],
      benefits: [],
    })} />);

    expect(screen.getAllByText('-')).toHaveLength(4);
    expect(screen.getByTestId('job-information-sections')).toBeTruthy();
  });
});
