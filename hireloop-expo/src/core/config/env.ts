const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

function normalizeApiUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL harus berupa URL HTTP/HTTPS yang valid.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('EXPO_PUBLIC_API_URL hanya mendukung protokol HTTP atau HTTPS.');
  }

  return value.replace(/\/+$/, '');
}

const apiUrl = normalizeApiUrl(rawApiUrl);

export const env = {
  apiUrl,
  isApiConfigured: Boolean(apiUrl),
} as const;

export function requireApiUrl(): string {
  if (!apiUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_URL belum dikonfigurasi. Atur environment Expo/EAS lalu restart Metro.',
    );
  }

  return apiUrl;
}
