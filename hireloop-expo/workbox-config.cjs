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
  clientsClaim: false,
  skipWaiting: false,
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
    {
      urlPattern: ({request}) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'hireloop-pages-v1',
        networkTimeoutSeconds: 4,
        cacheableResponse: {statuses: [0, 200]},
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: ONE_DAY,
          purgeOnQuotaError: true,
        },
      },
    },
  ],
};
