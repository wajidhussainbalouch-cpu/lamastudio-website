/* This private PWA only installs a shortcut to a role-protected page.
 * It never caches accounts, registration records, question drafts or passwords. */
'use strict';
(()=>{
 const button=document.getElementById('installAdminPwa');
 if(!button)return;
 let pending=null;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pending=e;button.hidden=false});
 window.addEventListener('appinstalled',()=>{pending=null;button.textContent='Private App Installed';button.disabled=true});
 button.addEventListener('click',async()=>{
  if(pending){
   try{pending.prompt();await pending.userChoice}finally{pending=null}
   return;
  }
  alert('On Android Chrome, open the browser menu (⋮) and select Install app or Add to Home screen. Sign in with your verified Super Admin account after opening it.');
 });
})();
