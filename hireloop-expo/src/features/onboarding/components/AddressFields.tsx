import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {View} from 'react-native';

import {masterDataApi} from '../../master-data/api/master-data.api';
import {onboardingKeys} from '../onboarding.keys';
import type {AddressDetail, MasterOption} from '../onboarding.types';
import {SelectField, TextField} from './FormControls';

function normalizeOptions(input: unknown): MasterOption[] {
  const root = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const source = Array.isArray(input) ? input : Array.isArray(root.data) ? root.data : [];
  return source.map(item => {
    const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const value = String(record.code ?? record.id ?? '');
    const label = String(record.name ?? record.label ?? '');
    return {value, label};
  }).filter(option => option.value && option.label);
}

export function AddressFields({label, value, onChange, disabled, error}: {
  label: string;
  value: AddressDetail;
  onChange: (value: AddressDetail) => void;
  disabled?: boolean;
  error?: string;
}) {
  const provinces = useQuery({queryKey: onboardingKeys.regions('province'), queryFn: async () => normalizeOptions(await masterDataApi.provinces()), staleTime: 60 * 60 * 1000});
  const regencies = useQuery({queryKey: onboardingKeys.regions('regency', value.provinceCode), queryFn: async () => normalizeOptions(await masterDataApi.regencies(value.provinceCode)), enabled: Boolean(value.provinceCode), staleTime: 60 * 60 * 1000});
  const districts = useQuery({queryKey: onboardingKeys.regions('district', value.regencyCode), queryFn: async () => normalizeOptions(await masterDataApi.districts(value.regencyCode)), enabled: Boolean(value.regencyCode), staleTime: 60 * 60 * 1000});
  const villages = useQuery({queryKey: onboardingKeys.regions('village', value.districtCode), queryFn: async () => normalizeOptions(await masterDataApi.villages(value.districtCode)), enabled: Boolean(value.districtCode), staleTime: 60 * 60 * 1000});
  const setOption = (field: keyof AddressDetail, nameField: keyof AddressDetail, options: MasterOption[], next: string, reset: Partial<AddressDetail>) => {
    onChange({...value, ...reset, [field]: next, [nameField]: options.find(option => option.value === next)?.label ?? ''});
  };

  return (
    <View>
      <TextField label={label} required multiline disabled={disabled} value={value.addressLine} onChangeText={addressLine => onChange({...value, addressLine})} placeholder={`Alamat sesuai ${label.replace('Alamat ', '')}`} error={error} />
      <SelectField label="Provinsi" required searchable disabled={disabled || provinces.isLoading} value={value.provinceCode} options={provinces.data ?? []} onChange={next => setOption('provinceCode', 'provinceName', provinces.data ?? [], next, {regencyCode: '', regencyName: '', districtCode: '', districtName: '', villageCode: '', villageName: '', postalCode: ''})} placeholder={provinces.isLoading ? 'Memuat provinsi...' : 'Pilih provinsi'} />
      <SelectField label="Kota / Kabupaten" required searchable disabled={disabled || !value.provinceCode || regencies.isLoading} value={value.regencyCode} options={regencies.data ?? []} onChange={next => setOption('regencyCode', 'regencyName', regencies.data ?? [], next, {districtCode: '', districtName: '', villageCode: '', villageName: '', postalCode: ''})} placeholder="Pilih kota / kabupaten" />
      <SelectField label="Kecamatan" required searchable disabled={disabled || !value.regencyCode || districts.isLoading} value={value.districtCode} options={districts.data ?? []} onChange={next => setOption('districtCode', 'districtName', districts.data ?? [], next, {villageCode: '', villageName: '', postalCode: ''})} placeholder="Pilih kecamatan" />
      <SelectField label="Kelurahan / Desa" required searchable disabled={disabled || !value.districtCode || villages.isLoading} value={value.villageCode} options={villages.data ?? []} onChange={next => setOption('villageCode', 'villageName', villages.data ?? [], next, {})} placeholder="Pilih kelurahan / desa" />
      <TextField label="Kode Pos" disabled={disabled} value={value.postalCode} onChangeText={postalCode => onChange({...value, postalCode})} placeholder="Kode pos" keyboardType="number-pad" />
    </View>
  );
}
