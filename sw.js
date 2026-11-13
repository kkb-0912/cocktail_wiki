// 오프라인 지원. 파일을 새로 올리면 아래 VERSION 값을 바꿔 주세요(옛 캐시를 지웁니다).
const VERSION='bar-2026-11-13b';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){ // 페이지: 인터넷이 되면 최신, 안 되면 저장본
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));return}
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ // 아이콘·글꼴: 저장본 먼저, 뒤에서 갱신
    e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp))}return res}).catch(()=>hit);return hit||net}))}
});
