import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import type {CandidateBlacklistInfo} from '../../features/auth/auth.types';
import {CandidateEvaluationNotice} from '../components/CandidateEvaluationNotice';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-file-system', () => ({File: jest.fn(), Paths: {cache: 'cache'}}));
jest.mock('expo-sharing', () => ({isAvailableAsync: jest.fn(), shareAsync: jest.fn()}));

const baseNotice: CandidateBlacklistInfo = {
  id: 9,
  tier: 'tier_1',
  status: 'active',
  reason: 'Kelalaian fasilitas',
  notes: 'Kronologi evaluasi kandidat.',
  evidence_file_url: 'https://example.test/evidence.pdf',
  evidence_file_name: 'Bukti Pelanggaran.pdf',
  company_name: 'PT HireLoop',
  position_name: 'Operator Produksi',
  blacklisted_from: 'Proyek Karawang',
  blacklisted_at: '2026-10-28 08:00:00',
  supervisor_validated_at: null,
  supervisor_notes: null,
};

describe('CandidateEvaluationNotice', () => {
  it('tidak ditampilkan untuk catatan yang belum aktif', () => {
    const screen = render(<CandidateEvaluationNotice notice={{...baseNotice, status: 'pending_supervisor'}} />);
    expect(screen.queryByTestId('candidate-evaluation-alert')).toBeNull();
  });

  it('membuka detail tier 1 sebagai modal dan menampilkan file PDF', () => {
    const screen = render(<CandidateEvaluationNotice notice={baseNotice} />);

    expect(screen.getByText('Catatan Evaluasi')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Lihat catatan evaluasi'));

    expect(screen.getByText('Detail Catatan Evaluasi')).toBeTruthy();
    expect(screen.getByText('Kelalaian fasilitas')).toBeTruthy();
    expect(screen.getByText('Kronologi evaluasi kandidat.')).toBeTruthy();
    expect(screen.getByText('Bukti Pelanggaran.pdf')).toBeTruthy();
    expect(screen.getByText(/tidak membatasi akses melamar/i)).toBeTruthy();
  });

  it('membedakan pesan blacklist tier 2', () => {
    const screen = render(<CandidateEvaluationNotice notice={{...baseNotice, tier: 'tier_2'}} />);

    expect(screen.getByText('Blacklist')).toBeTruthy();
    expect(screen.getByText(/tidak dapat melamar di seluruh proyek/i)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Lihat detail blacklist'));
    expect(screen.getByText('Detail Blacklist')).toBeTruthy();
  });

  it('dapat langsung membuka modal dari deep-link notifikasi', () => {
    const screen = render(<CandidateEvaluationNotice initiallyVisible notice={baseNotice} />);
    expect(screen.getByText('Detail Catatan Evaluasi')).toBeTruthy();
  });
});
