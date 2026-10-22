import {getOnboardingHeroLayout, ONBOARDING_HERO_COPY} from '../components/OnboardingHero';

describe('OnboardingHero', () => {
  test('menggunakan copy sesuai desain pada kedua langkah', () => {
    expect(ONBOARDING_HERO_COPY[1]).toEqual({
      title: 'Lengkapi Data Diri',
      description: 'Lengkapi informasi berikut untuk memulai perjalanan karirmu',
    });
    expect(ONBOARDING_HERO_COPY[2]).toEqual({
      title: 'Pengalaman Kerja',
      description: 'Lengkapi informasi berikut untuk melanjutkan perjalanan karirmu',
    });
  });

  test('menjaga tinggi hero proporsional pada layar ponsel dan tablet', () => {
    expect(getOnboardingHeroLayout(320)).toMatchObject({heroHeight: 200, narrow: true, copyTop: 60});
    expect(getOnboardingHeroLayout(390)).toMatchObject({heroHeight: 244, narrow: false, copyTop: 73});
    expect(getOnboardingHeroLayout(720)).toMatchObject({heroHeight: 380, narrow: false, copyTop: 88});
  });

  test('membatasi ukuran hero pada viewport yang lebih lebar dari konten', () => {
    expect(getOnboardingHeroLayout(1200)).toEqual(getOnboardingHeroLayout(720));
  });
});
