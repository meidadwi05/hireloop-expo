import {generateSW} from 'workbox-build';
import workboxConfig from '../workbox-config.cjs';

const result = await generateSW(workboxConfig);

for (const warning of result.warnings) {
  console.warn(warning);
}

console.log(
  `Service worker mem-precache ${result.count} URL (${(result.size / 1024 / 1024).toFixed(2)} MB).`,
);
