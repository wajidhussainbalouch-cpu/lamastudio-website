'use strict';
const $=id=>document.getElementById(id);const storageKey='lama-mail-launcher-url-v1';let deferred=null;
function checked(s){try{const u=new URL(s);return u.protocol==='https:'&&u.hostname==='script.google.com'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/macros\/(?:u\/\d+\/)?s\/[A-Za-z0-9_-]+\/exec$/.test(u.pathname)?u.href:''}catch{return ''}}
function show(s){const url=checked(s);$('open').hidden=!url;if(url)$('open').href=url;else $('open').removeAttribute('href');}
try{$('url').value=localStorage.getItem(storageKey)||''}catch{}show($('url').value);
$('save').onclick=()=>{const s=checked($('url').value.trim());if(!s){$('status').textContent='Use the deployed Google Apps Script /exec URL, without extra parameters.';return;}try{localStorage.setItem(storageKey,s);$('status').textContent='Saved on this device only.'}catch{$('status').textContent='Storage unavailable; open the workspace now.'}show(s)};
$('forget').onclick=()=>{try{localStorage.removeItem(storageKey)}catch{}$('url').value='';show('');$('status').textContent='Saved link cleared.'};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('install').hidden=false});
$('install').onclick=async()=>{if(!deferred)return;const p=deferred;deferred=null;$('install').hidden=true;await p.prompt()};
window.addEventListener('appinstalled',()=>{$('install').hidden=true;$('installHint').textContent='Launcher installed.'});
if(window.matchMedia('(display-mode: standalone)').matches)$('installHint').textContent='Running as an installed launcher.';
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
