const CACHE = 'motorz-v1';

// Pré-cacheia as rotas mais acessadas
const PRECACHE = ['/', '/estoque', '/manifest.json', '/assets/images/MZAPP.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // Remove caches de versões anteriores
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Não intercepta: non-GET, API routes, Next.js internals, extensões de browser
  if (
    e.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.protocol === 'chrome-extension:'
  ) return;

  // Network-first: tenta rede, cai no cache se offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Só cacheia respostas válidas de mesma origem ou assets estáticos
        if (res.ok && (url.origin === self.location.origin || url.pathname.startsWith('/assets/'))) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
