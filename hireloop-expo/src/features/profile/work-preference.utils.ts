export function sanitizeRupiahInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '');
}

export function formatRupiahInput(value: string | number | null | undefined): string {
  const digits = sanitizeRupiahInput(value);
  if (!digits) return '';

  return `Rp ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function parseRupiahInput(value: string | number | null | undefined): number | null {
  const digits = sanitizeRupiahInput(value);
  if (!digits) return null;

  const parsed = Number(digits);
  return Number.isSafeInteger(parsed) ? parsed : null;
}
