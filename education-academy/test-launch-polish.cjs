'use strict';
/* Pre-launch interface and disclosure checks; does not certify paid billing or live mobile UX. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const file=name=>fs.readFileSync(path.join(root,name),'utf8');
const exists=name=>fs.existsSync(path.join(root,name));
const html=file('index.html'),polish=file('academy-polish.css'),worker=file('sw.js');
const manifest=JSON.parse(file('manifest.webmanifest')),adminManifest=JSON.parse(file('admin.webmanifest'));
for(const name of ['academy-polish.css','help.html','privacy.html','terms.html']){
 assert.ok(exists(name),'Missing launch page '+name);
 assert.ok(html.includes('href="./'+name+'"'),'Main academy missing '+name+' link');
 assert.ok(worker.includes("'./"+name+"'"),'Offline cache missing '+name);
}
assert.ok(html.includes('class="skip-to-content"'),'Skip-to-content link missing');
assert.ok(html.includes('id="mainContent"'),'Accessible main target missing');
assert.ok(html.includes('class="academy-footer"'),'Candidate support and information footer missing');
assert.ok(polish.includes('prefers-reduced-motion'),'Reduced motion accessibility rule missing');
assert.ok(polish.includes(':focus-visible'),'Keyboard focus indication missing');
assert.ok(polish.includes('min-height:44px'),'Touch targets should meet mobile minimum');
assert.ok(polish.includes('body.academy-routed'),'Compact secondary page layout missing');
assert.ok(polish.includes('@media print'),'Print presentation missing');
assert.ok(html.includes('Membership and payment approval are not active yet'),'Inactive payment warning absent');
assert.ok(html.includes('Do not transfer funds'),'Payment safeguard warning absent');
for(const name of ['help.html','privacy.html','terms.html']){
 const page=file(name);
 assert.ok(page.includes('viewport'),'Mobile viewport missing from '+name);
 assert.ok(page.includes('Not affiliated with PPSC'),'PPSC independence disclosure missing in '+name);
 assert.ok(page.includes('href="./index.html"'),'Back-to-academy navigation missing in '+name);
}
for(const entry of [manifest,adminManifest]){
 assert.ok(entry.icons.some(icon=>icon.sizes==='192x192'&&exists(icon.src.replace(/^\.\//,''))),'192px icon missing');
 assert.ok(entry.icons.some(icon=>icon.sizes==='512x512'&&exists(icon.src.replace(/^\.\//,''))),'512px icon missing');
 assert.equal(entry.display,'standalone','PWA should open in standalone mode');
}
const router=file('academy-router.js');
assert.ok(router.includes("'aria-current'"),'Current menu location should be accessible');
assert.ok(router.includes('document.title='),'Routed pages should have meaningful titles');
assert.ok(!/service_role|sb_secret_/i.test(file('supabase-config.js')),'Public config must not contain a service role or secret key');
assert.ok(!worker.includes('admin.html'),'Private admin page must not be explicitly precached');
const engine=file('engine.js'),account=file('auth-supabase.js');
assert.ok(!engine.includes("||window.LAMA_PPSC_PAPERS?.[0]"),'Missing job paper must never fall back to Headmaster');
assert.ok(engine.includes("location.hash!=='#paper'"),'Sticky exam timer must be hidden outside exam view');
assert.ok(engine.includes("addEventListener('hashchange',tick)"),'Timer should react to route changes');
assert.ok(html.includes('selectedPublicPaper'),'Missing paper should not trigger a generic page-load error');
assert.ok(html.includes('id="benefitExamCount"'),'Public exam count should be dynamic');
assert.ok(account.includes('reset-password.html'),'Candidate account recovery needs academy callback');
assert.ok(exists('reset-password.html'),'Academy password recovery form missing');
assert.ok(!worker.includes("'./reset-password.html'"),'Password recovery callback should not be precached offline');
console.log('Academy launch presentation checks passed: mobile polish, keyboard access, policy pages, public PWA and payment warning.');
