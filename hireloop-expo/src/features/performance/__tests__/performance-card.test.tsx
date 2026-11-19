import {render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import type {PerformanceContract} from '../performance.schemas';
import {PerformanceCard} from '../screens/PerformanceScreen';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-router', () => ({router: {push: jest.fn()}}));
jest.mock('../hooks/use-performance', () => ({usePerformance: jest.fn()}));

const contract: PerformanceContract = {
  contract_id: 1,
  employee_id: 2,
  employee_code: 'EMP-2',
  employee_name: 'Kandidat',
  position_name: 'Production Operator Dengan Judul Sangat Panjang',
  company_name: 'PT Dummy Project Indonesia Dengan Nama Sangat Panjang',
  cycle_number: 1,
  contract_status: 'active',
  kpi_scores_count: 0,
  kpi_status: 'Belum dinilai',
  kpi_scores: [],
  tindak_lanjut_kontrak: 'belum_diputuskan',
};

describe('PerformanceCard', () => {
  it('truncates long job and company names without overlapping the status pill', () => {
    const screen = render(<PerformanceCard item={contract} />);
    const title = screen.getByText(contract.position_name);
    const company = screen.getByText(contract.company_name!);

    expect(title.props.numberOfLines).toBe(1);
    expect(title.props.ellipsizeMode).toBe('tail');
    expect(company.props.numberOfLines).toBe(1);
    expect(company.props.ellipsizeMode).toBe('tail');
    expect(StyleSheet.flatten(title.props.style).flexShrink).toBe(1);
    expect(StyleSheet.flatten(company.props.style).flexShrink).toBe(1);
    expect(StyleSheet.flatten(screen.getByTestId('performance-card-copy').props.style).overflow).toBe('hidden');
    expect(StyleSheet.flatten(screen.getByTestId('performance-card-decision').props.style).flexShrink).toBe(0);
  });
});
