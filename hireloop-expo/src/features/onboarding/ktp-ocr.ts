import {masterDataApi} from '../master-data/api/master-data.api';

import type {KtpExtractedData} from './api/onboarding.api';
import type {AddressDetail, MasterOption} from './onboarding.types';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function normalizeOptions(input: unknown): MasterOption[] {
  const root = asRecord(input);
  const source = Array.isArray(input) ? input : Array.isArray(root.data) ? root.data : [];
  return source.map(item => {
    const record = asRecord(item);
    return {
      value: String(record.code ?? record.id ?? ''),
      label: String(record.name ?? record.label ?? ''),
    };
  }).filter(option => option.value && option.label);
}

function normalizeRegionName(value: string | null | undefined): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID')
    .replace(/\b(provinsi|kabupaten|kab\.?|kota|kecamatan|kec\.?|kelurahan|kel\.?|desa)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function findRegion(options: MasterOption[], target: string | null | undefined): MasterOption | undefined {
  const normalizedTarget = normalizeRegionName(target);
  if (!normalizedTarget) return undefined;
  return options.find(option => normalizeRegionName(option.label) === normalizedTarget)
    ?? options.find(option => {
      const normalizedLabel = normalizeRegionName(option.label);
      return normalizedLabel.includes(normalizedTarget) || normalizedTarget.includes(normalizedLabel);
    });
}

export async function resolveKtpAddress(extracted: KtpExtractedData, current: AddressDetail): Promise<AddressDetail> {
  const next: AddressDetail = {
    ...current,
    addressLine: String(extracted.full_address || extracted.address || current.addressLine).trim(),
  };

  const province = findRegion(normalizeOptions(await masterDataApi.provinces()), extracted.provinsi);
  if (!province) return next;
  next.provinceCode = province.value;
  next.provinceName = province.label;

  const regency = findRegion(normalizeOptions(await masterDataApi.regencies(province.value)), extracted.kota_kab);
  if (!regency) return next;
  next.regencyCode = regency.value;
  next.regencyName = regency.label;

  const district = findRegion(normalizeOptions(await masterDataApi.districts(regency.value)), extracted.kecamatan);
  if (!district) return next;
  next.districtCode = district.value;
  next.districtName = district.label;

  const village = findRegion(normalizeOptions(await masterDataApi.villages(district.value)), extracted.kel_desa);
  if (!village) return next;
  next.villageCode = village.value;
  next.villageName = village.label;
  return next;
}

