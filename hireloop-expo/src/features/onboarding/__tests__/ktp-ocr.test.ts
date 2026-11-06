import {resolveKtpAddress} from '../ktp-ocr';
import {emptyAddress} from '../onboarding.types';
import {masterDataApi} from '../../master-data/api/master-data.api';

jest.mock('../../master-data/api/master-data.api', () => ({
  masterDataApi: {
    provinces: jest.fn(),
    regencies: jest.fn(),
    districts: jest.fn(),
    villages: jest.fn(),
  },
}));

const mockedMasterDataApi = masterDataApi as jest.Mocked<typeof masterDataApi>;

describe('resolver alamat OCR KTP', () => {
  it('mencocokkan nama wilayah OCR ke kode master region', async () => {
    mockedMasterDataApi.provinces.mockResolvedValue([{code: '32', name: 'JAWA BARAT'}]);
    mockedMasterDataApi.regencies.mockResolvedValue([{code: '3273', name: 'KOTA BANDUNG'}]);
    mockedMasterDataApi.districts.mockResolvedValue([{code: '3273010', name: 'SUKASARI'}]);
    mockedMasterDataApi.villages.mockResolvedValue([{code: '3273010001', name: 'GEGERKALONG'}]);

    const address = await resolveKtpAddress({
      full_address: 'Jl. Setiabudi 10 RT/RW 01/02',
      provinsi: 'Provinsi Jawa Barat',
      kota_kab: 'Bandung',
      kecamatan: 'Kec. Sukasari',
      kel_desa: 'Kelurahan Gegerkalong',
    }, emptyAddress());

    expect(address).toMatchObject({
      addressLine: 'Jl. Setiabudi 10 RT/RW 01/02',
      provinceCode: '32',
      regencyCode: '3273',
      districtCode: '3273010',
      villageCode: '3273010001',
    });
  });
});

