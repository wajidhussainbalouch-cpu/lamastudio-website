/* Public academy shell only. Never cache credentials, private APIs or payment evidence. */
const CACHE='lama-ppsc-preview-v22';
const ASSETS=['./','./index.html','./app.js','./jobs.js','./shell.js','./print.html','./papers.js','./engine.js','./manifest.webmanifest'];
const allowed=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).pathname));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('lama-ppsc-preview-')&&key!==CACHE).map(key=>caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||request.mode==='navigate'&&new URL(request.url).pathname!==new URL('./index.html',self.registration.scope).pathname&&new URL(request.url).pathname!==new URL('./',self.registration.scope).pathname)return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||!allowed.has(url.pathname)||url.search||request.headers.has('authorization'))return;
  event.respondWith(fetch(request).then(response=>{
    if(response.ok&&response.type==='basic'&&!response.headers.has('set-cookie')){
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));
    }
    return response;
  }).catch(()=>caches.match(request)));
});
