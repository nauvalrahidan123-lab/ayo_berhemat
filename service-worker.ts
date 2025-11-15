/// <reference lib="webworker" />
// FIX: Explicitly declare `self` as `ServiceWorkerGlobalScope` to fix type inference issues.
declare const self: ServiceWorkerGlobalScope;

// Service worker ini sengaja dibiarkan minimalis.
// Tujuan utamanya adalah agar file ini ada dan dapat didaftarkan untuk mencegah error 404
// yang mungkin muncul dari cache browser yang usang atau konfigurasi build.
// Strategi caching yang lebih canggih dapat ditambahkan di kemudian hari.

self.addEventListener('install', () => {
  console.log('Service Worker: Install');
  // Melewati fase waiting agar service worker baru segera aktif.
  self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker: Activate');
  // Mengambil alih kontrol semua klien (tab) yang terbuka segera setelah service worker aktif.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Saat ini tidak mengintersep permintaan jaringan.
  // Permintaan akan langsung diteruskan ke jaringan seperti biasa.
  return;
});
