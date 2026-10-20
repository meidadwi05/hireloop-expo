import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = process.cwd();
const easConfig = JSON.parse(await readFile(path.join(root, 'eas.json'), 'utf8'));
const productionApiUrl = easConfig?.build?.production?.env?.EXPO_PUBLIC_API_URL;

if (typeof productionApiUrl !== 'string' || productionApiUrl.length === 0) {
  throw new Error('EXPO_PUBLIC_API_URL production tidak tersedia di eas.json.');
}

const parsedApiUrl = new URL(productionApiUrl);
if (parsedApiUrl.protocol !== 'https:') {
  throw new Error('API production PWA wajib menggunakan HTTPS.');
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const build = spawnSync(npmCommand, ['run', 'build:pwa'], {
  cwd: root,
  env: {...process.env, EXPO_PUBLIC_API_URL: productionApiUrl},
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

if (build.error) throw build.error;

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const bundleDirectory = path.join(root, 'dist', '_expo', 'static', 'js', 'web');
const bundleName = (await readdir(bundleDirectory)).find(
  (filename) => filename.startsWith('entry-') && filename.endsWith('.js'),
);

if (!bundleName) {
  throw new Error('JavaScript entry PWA tidak ditemukan setelah export.');
}

const bundle = await readFile(path.join(bundleDirectory, bundleName), 'utf8');
if (!bundle.includes(productionApiUrl)) {
  throw new Error('Bundle PWA tidak memuat API URL production yang diharapkan.');
}

const localEnvironmentPath = path.join(root, '.env.local');
try {
  const localEnvironment = await readFile(localEnvironmentPath, 'utf8');
  const localApiUrl = localEnvironment
    .split(/\r?\n/u)
    .find((line) => line.startsWith('EXPO_PUBLIC_API_URL='))
    ?.slice('EXPO_PUBLIC_API_URL='.length)
    .trim();

  if (localApiUrl && localApiUrl !== productionApiUrl && bundle.includes(localApiUrl)) {
    throw new Error('Bundle PWA production masih memuat API URL local.');
  }
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

console.log(`Bundle PWA production terverifikasi memakai ${productionApiUrl}`);
