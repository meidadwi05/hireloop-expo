import {readdir, stat} from 'node:fs/promises';
import path from 'node:path';

const DIST_DIRECTORY = path.resolve('dist');
// The onboarding artwork adds ~2.92 MB to the existing export. Keep a strict
// per-file cap while allowing the approved, measured total bundle increase.
const MAX_TOTAL_BYTES = Number(process.env.PWA_MAX_TOTAL_MB ?? 18) * 1024 * 1024;
const MAX_FILE_BYTES = Number(process.env.PWA_MAX_FILE_MB ?? 3) * 1024 * 1024;

async function collectFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(target) : [target];
    }),
  );

  return nested.flat();
}

function formatMegabytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

let files;
try {
  files = await collectFiles(DIST_DIRECTORY);
} catch (error) {
  console.error('Folder dist belum tersedia. Jalankan export web terlebih dahulu.', error);
  process.exit(1);
}

const records = await Promise.all(
  files.map(async (file) => ({
    file: path.relative(DIST_DIRECTORY, file).replaceAll('\\', '/'),
    bytes: (await stat(file)).size,
  })),
);
const totalBytes = records.reduce((sum, record) => sum + record.bytes, 0);
const oversizedFiles = records.filter((record) => record.bytes > MAX_FILE_BYTES);

console.log(`PWA export: ${records.length} file, ${formatMegabytes(totalBytes)}`);
console.table(
  [...records]
    .sort((left, right) => right.bytes - left.bytes)
    .slice(0, 10)
    .map((record) => ({file: record.file, size: formatMegabytes(record.bytes)})),
);

if (oversizedFiles.length > 0) {
  console.error(`Ada ${oversizedFiles.length} file yang melebihi ${formatMegabytes(MAX_FILE_BYTES)}.`);
}

if (totalBytes > MAX_TOTAL_BYTES || oversizedFiles.length > 0) {
  console.error(`PWA melewati budget ${formatMegabytes(MAX_TOTAL_BYTES)}.`);
  process.exit(1);
}

console.log(`PWA memenuhi budget ${formatMegabytes(MAX_TOTAL_BYTES)}.`);
