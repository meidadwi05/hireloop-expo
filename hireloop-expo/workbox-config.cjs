const ONE_DAY = 24 * 60 * 60;

module.exports = {
  globDirectory: 'dist',
  globPatterns: [
    '**/*.{html,js,css,json,ico,ttf,woff,woff2}',
    'icon-192.png',
    'icon-512.png',
  ],
  globIgnores: ['**/metadata.json', 'sw.js', 'workbox-*.js'],
  swDest: 'dist/sw.js',
  sourcemap: false,
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  // Required for the migration from older clients that do not yet send
  // Workbox's SKIP_WAITING message. Expo currently emits one hashed JS bundle,
  // so immediate activation cannot mix independently lazy-loaded JS chunks.
  skipWaiting: true,
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  navigateFallback: '/index.html',
  runtimeCaching: [
    {
      urlPattern: ({request, url}) =>
        request.destination === 'image' && url.origin === self.location.origin,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'hireloop-images-v1',
        cacheableResponse: {statuses: [0, 200]},
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 30 * ONE_DAY,
          purgeOnQuotaError: true,
        },
      },
    },
  ],
};
