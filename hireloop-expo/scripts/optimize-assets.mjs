import path from 'node:path';
import {copyFile, mkdir, stat, unlink} from 'node:fs/promises';
import sharp from 'sharp';

const assetDirectory = path.resolve('src/assets');
const targets = [
  ['Onboarding1.png', 1440],
  ['Onboarding2.png', 1440],
  ['Onboarding3.png', 1440],
  ['Onboarding4.png', 1440],
  ['dashboard_home.png', 1200],
  ['Email_reset_succesed.png', 600],
  ['Email_reset.png', 600],
  ['reset_auth.png', 600],
  ['shortcut_lowongan.png', 256],
  ['shortcut_interview.png', 256],
  ['shortcut_lamaran.png', 256],
  ['shortcut_karier.png', 256],
  ['lockcheck.png', 384],
  ['Lupasandi.png', 800],
  ['HireLoopLogo.png', 1000],
];

for (const [filename, maxDimension] of targets) {
  const source = path.join(assetDirectory, filename);
  const temporary = `${source}.optimized`;
  const before = (await stat(source)).size;

  await sharp(source)
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .png({compressionLevel: 9, adaptiveFiltering: true, palette: false})
    .toFile(temporary);

  const metadata = await sharp(temporary).metadata();
  const after = (await stat(temporary)).size;
  await copyFile(temporary, source);
  await unlink(temporary);

  console.log(
    `${filename}: ${metadata.width}x${metadata.height}, ${(before / 1024).toFixed(1)} KB -> ${(after / 1024).toFixed(1)} KB`,
  );
}

const publicDirectory = path.resolve('public');
await mkdir(publicDirectory, {recursive: true});

for (const size of [192, 512]) {
  const icon = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="hireloop-gradient" x1="96" y1="256" x2="416" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#0865FF" />
          <stop offset="1" stop-color="#00D4F5" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="#050B55" />
      <path
        d="M96 256C130 164 210 164 256 256C302 348 382 348 416 256C382 164 302 164 256 256C210 348 130 348 96 256Z"
        fill="none"
        stroke="url(#hireloop-gradient)"
        stroke-width="58"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `);

  await sharp(icon)
    .png({compressionLevel: 9, adaptiveFiltering: true, palette: false})
    .toFile(path.join(publicDirectory, `icon-${size}.png`));
}

sharp.cache(false);
