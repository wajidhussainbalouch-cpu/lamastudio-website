#!/usr/bin/env node
'use strict';
/** Inject AskLama into every public HTML page during the static Vercel build.
 * No modifications to private school dashboards, exam interfaces or admin areas.
 * Only the temporary build workspace changes; Git tracked pages remain untouched. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const tag='<script defer src="/ask-lama.js?v=3"></script>';
const ignoreDirs=new Set(['.git','.github','.vercel','node_modules','dist','.next','coverage','__tests__','test','tests']);
let scanned=0,added=0,updated=0,skipped=0,failed=0;
function isPublic(relative){
 const p=relative.replaceAll('\\','/').toLowerCase();
 if(!/\.html?$/.test(p))return false;
 if(p.startsWith('lamastudio-school-suite/')){
   return ['index.html','help-support.html','privacy.html','terms.html'].includes(p.slice(24));
 }
 if(p.startsWith('education-academy/')){
   return ['index.html','help.html','privacy.html','terms.html','section.html'].includes(p.slice(18));
 }
 if(p.startsWith('examination-system/'))return false;
 if(p.startsWith('apps/') && /\/(desktop|editor|platform|internal|admin|settings)\//.test(p))return false;
 if(/(^|\/)(admin|superadmin|super-admin|dashboard|attendance|finance|exam|print|checkout|password|payment|auth)(\/|\.|-)/.test(p))return false;
 return true;
}
function inject(html){
 const re=/<script\b[^>]*\bsrc\s*=\s*["'][^"']*ask-lama\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>\s*/gi;
 const existing=re.test(html);re.lastIndex=0;
 let updatedHtml=html.replace(re,'');
 if(/<\/body\s*>/i.test(updatedHtml))updatedHtml=updatedHtml.replace(/<\/body\s*>/i,tag+'\n</body>');
 else if(/<\/html\s*>/i.test(updatedHtml))updatedHtml=updatedHtml.replace(/<\/html\s*>/i,tag+'\n</html>');
 else updatedHtml += '\n'+tag+'\n';
 return {content:updatedHtml,changed:updatedHtml!==html,existing};
}
function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.isSymbolicLink())continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory()){
   if(!ignoreDirs.has(entry.name)&&!entry.name.startsWith('.'))walk(full);
  }else if(entry.isFile()&&/\.html?$/.test(entry.name.toLowerCase())){
   scanned++;const relative=path.relative(root,full);
   if(!isPublic(relative)){skipped++;continue}
   const original=fs.readFileSync(full,'utf8'),r=inject(original);
   if(r.error){failed++;console.warn('AskLama build skip:',relative,r.error);continue}
   if(r.changed){fs.writeFileSync(full,r.content,'utf8');r.existing?updated++:added++}
  }
 }
}
if(require.main===module){
 walk(root);
 if(!added&&!updated)throw Error('No public site pages received AskLama.');
 console.log('AskLama pages:',JSON.stringify({scanned,added,updated,skipped,failed}));
}
module.exports={isPublic,inject};
