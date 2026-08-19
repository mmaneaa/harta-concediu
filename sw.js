/* Harta Italia — service worker
   Ține aplicația, hărțile și pozele în memoria telefonului, ca să meargă fără semnal. */
const V = 'italia-v7';
const SHELL = V + '-shell';
const TILES = 'italia-tiles';     // fără versiune: hărțile descărcate supraviețuiesc actualizărilor
const MEDIA = 'italia-media';

const CORE = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

const TILE_HOSTS = ['basemaps.cartocdn.com', 'tile.openstreetmap.org', 'tile.opentopomap.org'];
const MEDIA_HOSTS = ['upload.wikimedia.org'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
/* Astea au nevoie de internet proaspăt; offline eșuează elegant, aplicația merge mai departe. */
const LIVE_HOSTS = ['photon.komoot.io', 'nominatim.openstreetmap.org', 'overpass.kumi.systems',
  'overpass-api.de', 'overpass.private.coffee', 'api.open-meteo.com',
  'router.project-osrm.org', 'api.anthropic.com'];
const isWiki = h => /(^|\.)wikipedia\.org$/.test(h) || /(^|\.)wikimedia\.org$/.test(h);
/* serverele de hărți au subdomenii rotative: a./b./c. — comparăm și sufixul */
const hostIn = (h, list) => list.some(d => h === d || h.endsWith('.' + d));

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await Promise.all(CORE.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.endsWith('-shell') && k !== SHELL).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function cacheFirst(req, cacheName, cap){
  const c = await caches.open(cacheName);
  const hit = await c.match(req, {ignoreVary: true});
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')){
      c.put(req, res.clone());
      if (cap) trim(cacheName, cap);
    }
    return res;
  } catch(e){
    return hit || new Response('', {status: 504, statusText: 'offline'});
  }
}
async function staleWhileRevalidate(req, cacheName){
  const c = await caches.open(cacheName);
  const hit = await c.match(req, {ignoreVary: true});
  const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || new Response('', {status: 504});
}
async function trim(cacheName, max){
  const c = await caches.open(cacheName);
  const keys = await c.keys();
  if (keys.length <= max) return;
  for (let i = 0; i < keys.length - max; i++) c.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch(err){ return; }
  const h = url.hostname;

  if (hostIn(h, LIVE_HOSTS)) return;                        // direct la rețea
  if (url.pathname.endsWith('/plan.json')) return;          // planul comun: mereu proaspăt
  if (isWiki(h) && url.pathname.indexOf('/w/api.php') >= 0) return;

  if (hostIn(h, TILE_HOSTS)){ e.respondWith(cacheFirst(req, TILES, 6000)); return; }
  if (hostIn(h, MEDIA_HOSTS)){ e.respondWith(cacheFirst(req, MEDIA, 800)); return; }
  if (hostIn(h, FONT_HOSTS)){ e.respondWith(staleWhileRevalidate(req, SHELL)); return; }

  if (url.origin === self.location.origin || h === 'unpkg.com'){
    e.respondWith((async () => {
      const c = await caches.open(SHELL);
      const hit = await c.match(req, {ignoreVary: true});
      if (hit){ fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); }).catch(() => {}); return hit; }
      try {
        const r = await fetch(req);
        if (r && r.ok) c.put(req, r.clone());
        return r;
      } catch(err){
        if (req.mode === 'navigate') return (await c.match('./index.html')) || Response.error();
        return Response.error();
      }
    })());
  }
});

/* Descărcarea hărților pentru o zonă, cerută din aplicație */
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'CACHE_TILES') cacheTiles(d.urls, e.source);
  if (d.type === 'TILE_STATS') tileStats(e.source);
  if (d.type === 'CLEAR_TILES')
    caches.delete(TILES).then(() => e.source && e.source.postMessage({type:'TILES_CLEARED'}));
});
async function cacheTiles(urls, client){
  const c = await caches.open(TILES);
  let ok = 0, fail = 0;
  for (let i = 0; i < urls.length; i++){
    const u = urls[i];
    try {
      if (await c.match(u)){ ok++; }
      else {
        let r = await fetch(u).catch(() => null);
        if (!r || (!r.ok && r.type !== 'opaque')) r = await fetch(u, {mode:'no-cors'}).catch(() => null);
        if (r && (r.ok || r.type === 'opaque')){ await c.put(u, r.clone()); ok++; } else fail++;
      }
    } catch(err){ fail++; }
    if (client && (i % 15 === 0 || i === urls.length - 1))
      client.postMessage({type:'TILE_PROGRESS', done: i + 1, total: urls.length, ok, fail});
  }
  if (client) client.postMessage({type:'TILE_DONE', ok, fail, total: urls.length});
}
async function tileStats(client){
  const c = await caches.open(TILES);
  const n = (await c.keys()).length;
  if (client) client.postMessage({type:'TILE_STATS', n});
}
