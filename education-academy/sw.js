/* Public academy shell only. Never cache credentials, private APIs or payment evidence. */
const CACHE='lama-ppsc-preview-v65';
const ASSETS=['./','./index.html','./section.html','./app.js','./supabase-config.js','./auth-supabase.js','./candidate-account-ui.js','./membership-status.js','./academy-router.js','./job-catalog-ui.js','./syllabus-finder.js','./jobs.js','./catalog-store.js','./shell.js','./print.html','./answer-key.html','./papers.js','./papers/headmaster-02-part1.js','./papers/headmaster-02-part2.js','./papers/headmaster-02-part3.js','./papers/headmaster-02-part4.js','./papers/headmaster-02-register.js','./papers/headmaster-03-part1.js','./papers/headmaster-03-part2.js','./papers/headmaster-03-part3.js','./papers/headmaster-03-part4.js','./papers/headmaster-03-register.js','./papers/headmaster-04-part1.js','./papers/headmaster-04-part2.js','./papers/headmaster-04-part3.js','./papers/headmaster-04-part4.js','./papers/headmaster-04-register.js','./papers/headmaster-05-part1.js','./papers/headmaster-05-part2.js','./papers/headmaster-05-part3.js','./papers/headmaster-05-part4.js','./papers/headmaster-05-register.js','./papers/headmaster-06-part1.js','./papers/headmaster-06-part2.js','./papers/headmaster-06-part3.js','./papers/headmaster-06-part4.js','./papers/headmaster-06-register.js','./papers/headmaster-07-part1.js','./papers/headmaster-07-part2.js','./papers/headmaster-07-part3.js','./papers/headmaster-07-part4.js','./papers/headmaster-07-register.js','./papers/headmaster-08-part1.js','./papers/headmaster-08-part2.js','./papers/headmaster-08-part3.js','./papers/headmaster-08-part4.js','./papers/headmaster-08-register.js','./papers/headmaster-09-part1.js','./papers/headmaster-09-part2.js','./papers/headmaster-09-part3.js','./papers/headmaster-09-part4.js','./papers/headmaster-09-register.js','./papers/headmaster-10-part1.js','./papers/headmaster-10-part2.js','./papers/headmaster-10-part3.js','./papers/headmaster-10-part4.js','./papers/headmaster-10-register.js','./paper-library.js','./engine.js','./manifest.webmanifest','./academy-logo.png','./academy-logo.svg','./question-bank.html','./advanced-bank.js','./bank-ui.js'];
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
