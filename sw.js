/* Quick O service worker：離線快取 app 外殼、vendor 檔案及官方數據 JSON。
   每次發佈新版本請更新 VERSION，啟用時會刪除舊快取（舊數據不會殘留）。全部相對路徑，適用於 /quick-o/ 子路徑。 */
const VERSION = 'quick-o-2026-10-28-r2';
const SHELL = ['./', 'index.html', 'app.js', 'style.css', 'theme.css', 'manifest.webmanifest',
  'vendor/leaflet/leaflet.css', 'vendor/leaflet/leaflet.js', 'vendor/markercluster/MarkerCluster.css', 'vendor/markercluster/leaflet.markercluster.js',
  'assets/logo-1-light.svg', 'assets/logo-1-dark.svg', 'assets/logo-2-light.svg', 'assets/logo-2-dark.svg', 'assets/icon-c.svg',
  'assets/favicon-32.png', 'assets/apple-touch-icon.png', 'assets/icon-192.png', 'assets/icon-512.png'];
const DATA = ['data/toilets.json', 'data/babycare.json', 'data/had_accessible.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll([...SHELL, ...DATA].map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('quick-o-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // 地圖圖磚等外部資源不快取
  const isData = u.pathname.endsWith('.json');
  e.respondWith(isData
    // 數據：先試網絡（取最新官方數據），離線時用快取
    ? fetch(e.request).then(r => { if (r.ok) caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }))
    // 外殼：先用快取（快），背景更新
    : caches.match(e.request, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request).then(r => { if (r.ok) caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit || caches.match('index.html'));
        return hit || net;
      }));
});
