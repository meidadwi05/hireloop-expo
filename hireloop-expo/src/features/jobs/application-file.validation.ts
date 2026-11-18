export const MAX_APPLICATION_FILE_BYTES = 2 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

export type ApplicationFileMetadata = {
  name: string;
  mimeType?: string | null;
  size?: number | null;
};

export function validateApplicationFile(file: ApplicationFileMetadata): string | null {
  const name = file.name.trim() || 'File';
  const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() ?? '' : '';
  const mimeType = file.mimeType?.trim().toLowerCase() ?? '';
  const hasKnownMimeType = Boolean(mimeType && mimeType !== 'application/octet-stream');

  if (!ALLOWED_EXTENSIONS.has(extension) || (hasKnownMimeType && !ALLOWED_MIME_TYPES.has(mimeType))) {
    return `Format file "${name}" tidak didukung. Gunakan PDF, JPG, JPEG, atau PNG.`;
  }
  if ((file.size ?? 0) > MAX_APPLICATION_FILE_BYTES) {
    return `Ukuran file "${name}" melebihi batas maksimal 2 MB.`;
  }
  return null;
}
