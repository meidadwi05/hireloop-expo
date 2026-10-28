import type {ApplicationUiState} from '../applications.types';

export const APPLICATION_FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const APPLICATION_COLORS = {
  background: '#F4F8FF',
  card: '#FFFFFF',
  navy: '#00195E',
  blue: '#146CFF',
  blueDark: '#0646A8',
  body: '#52627A',
  muted: '#8A98AE',
  border: '#DCE7F5',
  green: '#16B97B',
  amber: '#FFA800',
  red: '#FF334D',
  purple: '#8254E8',
  future: '#D9E2EF',
} as const;

export const applicationShadow = {
  shadowColor: '#17376C',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};

export function applicationStatePresentation(state: ApplicationUiState, currentStage: string) {
  switch (state) {
    case 'applied': return {label: 'Applied', color: APPLICATION_COLORS.blue, background: '#EAF2FF'};
    case 'in-progress': return {label: currentStage || 'In Progress', color: APPLICATION_COLORS.amber, background: '#FFF7DF'};
    case 'hired': return {label: 'Hired', color: APPLICATION_COLORS.green, background: '#E7F9F1'};
    case 'rejected': return {label: 'Rejected', color: APPLICATION_COLORS.red, background: '#FFECEF'};
    case 'canceled': return {label: 'Dibatalkan', color: APPLICATION_COLORS.red, background: '#FFECEF'};
    case 'closed': return {label: 'Ditutup', color: '#718097', background: '#EFF2F6'};
    case 'temporary': return {label: 'Lengkapi Persyaratan', color: '#C57E00', background: '#FFF7DF'};
    case 'transferred': return {label: 'Dialihkan', color: APPLICATION_COLORS.purple, background: '#F3EEFF'};
  }
}

export function formatApplicationDate(value: string | null, includeTime = true): string {
  if (!value || Number.isNaN(Date.parse(value))) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? {hour: '2-digit', minute: '2-digit'} : {}),
  }).format(new Date(value)).replace(',', ' ·');
}
