import {generateSW} from 'workbox-build';
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import workboxConfig from '../workbox-config.cjs';

const result = await generateSW(workboxConfig);

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim(),
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim(),
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
};
const firebaseConfigured = [
  firebaseConfig.apiKey,
  firebaseConfig.appId,
  firebaseConfig.authDomain,
  firebaseConfig.messagingSenderId,
  firebaseConfig.projectId,
].every(Boolean);

if (firebaseConfigured) {
  const serviceWorkerPath = path.resolve(workboxConfig.swDest);
  const generatedServiceWorker = await readFile(serviceWorkerPath, 'utf8');
  const firebaseBootstrap = `
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js"
);

function hireloopPushDestination(actionUrl) {
  if (typeof actionUrl !== "string") return "/notifications";
  const path = actionUrl.split("?")[0].replace(/\\\/$/, "").toLowerCase();
  if (path === "/dashboard" || path === "/dashboard-user") return "/home";
  if (path === "/lamaran-saya") return "/career";
  if (path === "/lowongan" || path === "/job-listing-all") return "/jobs";
  if (path === "/profile") return "/profile";
  const application = path.match(/^\\/lamaran-saya\\/(job-posting|project-lowongan)\\/(\\d+)$/);
  if (application) return "/applications/" + application[1] + "/" + application[2];
  const job = path.match(/^\\/(?:job-listing-all\\/)?(job-posting|project-lowongan)\\/(\\d+)$/);
  if (job) return "/jobs/" + job[1] + "/" + job[2];
  return "/notifications";
}

self.addEventListener("notificationclick", function (event) {
  event.stopImmediatePropagation();
  event.notification.close();
  const message = event.notification && event.notification.data && event.notification.data.FCM_MSG;
  const destination = hireloopPushDestination(message && message.data && message.data.action_url);
  const targetUrl = new URL(destination, self.location.origin).href;
  event.waitUntil(
    clients.matchAll({type: "window", includeUncontrolled: true}).then(function (windows) {
      const existing = windows.find(function (client) {
        return new URL(client.url).origin === self.location.origin;
      });
      if (existing) return existing.focus().then(function () { return existing.navigate(targetUrl); });
      return clients.openWindow(targetUrl);
    })
  );
});

firebase.initializeApp(${JSON.stringify(firebaseConfig)});
firebase.messaging();
`;
  await writeFile(serviceWorkerPath, `${firebaseBootstrap}\n${generatedServiceWorker}`, 'utf8');
  console.log('Firebase Messaging ditambahkan ke service worker PWA.');
} else {
  console.warn('Firebase Messaging PWA dilewati karena konfigurasi EXPO_PUBLIC_FIREBASE_* belum lengkap.');
}

for (const warning of result.warnings) {
  console.warn(warning);
}

console.log(
  `Service worker mem-precache ${result.count} URL (${(result.size / 1024 / 1024).toFixed(2)} MB).`,
);
