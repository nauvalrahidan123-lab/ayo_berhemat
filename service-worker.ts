/// <reference lib="webworker" />

// Fix: The explicit 'self' declaration was causing a redeclaration error.
// Casting 'self' to ServiceWorkerGlobalScope and assigning it to a new variable 'swScope'
// avoids global type conflicts and provides correct types for service worker-specific APIs.
const swScope = self as unknown as ServiceWorkerGlobalScope;

// Service worker ini sengaja dibiarkan minimalis.
// Tujuan utamanya adalah agar file ini ada dan dapat didaftarkan untuk mencegah error 404
// yang mungkin muncul dari cache browser yang usang atau konfigurasi build.
// Strategi caching yang lebih canggih dapat ditambahkan di kemudian hari.

swScope.addEventListener('install', () => {
  console.log('Service Worker: Install');
  // Melewati fase waiting agar service worker baru segera aktif.
  swScope.skipWaiting();
});

swScope.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker: Activate');
  // Mengambil alih kontrol semua klien (tab) yang terbuka segera setelah service worker aktif.
  event.waitUntil(swScope.clients.claim());
});

swScope.addEventListener('fetch', () => {
  // Saat ini tidak mengintersep permintaan jaringan.
  // Permintaan akan langsung diteruskan ke jaringan seperti biasa.
  return;
});
