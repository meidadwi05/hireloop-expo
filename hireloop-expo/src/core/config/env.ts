const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const env = {
  apiUrl,
  isApiConfigured: Boolean(apiUrl),
} as const;

export function requireApiUrl(): string {
  if (!apiUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_URL belum dikonfigurasi. Tambahkan URL API ke .env.local lalu restart Metro.',
    );
  }

  return apiUrl;
}
