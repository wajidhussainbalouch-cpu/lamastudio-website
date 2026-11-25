#!/usr/bin/env node
'use strict';
/**
 * Normalize public-page SEO signals in the temporary Vercel build workspace.
 * School/student/teacher/admin/auth pages are deliberately outside the scope.
 * Build sitemap entries from existing, indexable HTML; never invent lastmod dates.
 */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const base='https://www.lamastudio.pk';
const ignoreDirs=new Set(['.git','.github','.vercel','node_modules','.next','dist','coverage','tests','__tests__']);
const rootPages=new Set(['index.html','about.html','services.html','privacy.html','terms.html','faqs.html']);
const categoryHubs=new Set(['tech','developer-tools','productivity','network-security','education']);
const showcaseApps=new Set(['lamavpnpro','lamasky','lamaiqmaster','lamamulticalendar','lamaphotoresizer','lamapixelstudio']);
const blogPages=new Set(['tech.html','developer-tools.html','productivity.html','network-security.html','education.html']);

function isCandidate(relative){
  const s=relative.replaceAll('\\','/').toLowerCase();
  if(rootPages.has(s))return true;
  if(s==='guides/school-attendance-management-pakistan.html')return true;
  if(s==='solutions/school-management-software-pakistan.html')return true;
  // Public product/academy homepages and the primary-school learning hub only.
  // Do not include their private dashboards, login, examination or account routes.
  if(s==='lamastudio-school-suite/index.html')return true;
  if(s==='education-academy/index.html')return true;
  if(s==='categories/education/learn-with-fun/index.html')return true;
  let match;
  if((match=s.match(/^blogs\/([^/]+\.html)$/)))return blogPages.has(match[1]);
  if((match=s.match(/^categories\/([^/]+)\/(index\.html|[a-z0-9-]+\.html)$/)))return categoryHubs.has(match[1]);
  if((match=s.match(/^apps\/([^/]+)\/index\.html$/)))return showcaseApps.has(match[1]);
  return false;
}
function urlFor(relative){
  let p=relative.replaceAll('\\','/');
  if(p==='index.html')return base+'/';
  if(p.endsWith('/index.html'))p=p.slice(0,-10);
  return base+'/'+p;
}
function isIndexable(html){
  if(!/<head\b/i.test(html)||!/<\/head\s*>/i.test(html)||!/<title\b/i.test(html)||!/<h1\b/i.test(html))return false;
  const robotsTags=[...html.matchAll(/<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*>/gi)];
  return !robotsTags.some(x=>/(?:noindex|none)/i.test(x[0]));
}
function normalize(html,url){
  const re=/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/gi;
  const tag='<link rel="canonical" href="'+url+'">';
  let seen=false;
  let result=html.replace(re,()=>{if(seen)return '';seen=true;return tag;});
  if(!seen)result=result.replace(/<\/title\s*>/i,match=>match+'\n'+tag);
  // Publisher ownership verification. This does not request or display ads.
  const adsense='<meta name="google-adsense-account" content="ca-pub-4212196297960637">';
  const meta=/<meta\b(?=[^>]*\bname\s*=\s*["']google-adsense-account["'])[^>]*>/gi;
  if(meta.test(result)){meta.lastIndex=0;result=result.replace(meta,()=>adsense);}
  else result=result.replace(/<\/title\s*>/i,match=>match+'\n'+adsense);
  const og=/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:url["'])[^>]*>/gi;
  return result.replace(og,()=>'<meta property="og:url" content="'+url+'">');
}
/**
 * Public content should link to the same directory URLs used by its canonical
 * tags and XML sitemap. Do not rewrite private portal or unknown index paths.
 * Only anchor href attributes in explicitly indexable public HTML are changed.
 */
function normalizePublicIndexLinks(html,relative){
  const sourceUrl=new URL(relative,base+'/');
  return html.replace(/<a\b[^>]*>/gi,tag=>tag.replace(/\bhref\s*=\s*(["'])([^"']+)\1/i,(attribute,quote,href)=>{
    if(!href||/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(href))return attribute;
    let target;
    try{target=new URL(href,sourceUrl)}catch{return attribute;}
    if(!target.pathname.endsWith('/index.html'))return attribute;
    const filename=target.pathname.slice(1);
    if(!isCandidate(filename))return attribute;
    const canonicalPath=target.pathname.slice(0,-'index.html'.length);
    return 'href='+quote+canonicalPath+target.search+target.hash+quote;
  }));
}

function walk(dir,fn){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.isSymbolicLink())continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()){if(!ignoreDirs.has(entry.name)&&!entry.name.startsWith('.'))walk(full,fn);}
    else if(entry.isFile()&&/\.html$/i.test(entry.name))fn(full,path.relative(root,full).replaceAll('\\','/'));
  }
}
function main(){
  const urls=[];let eligible=0,changed=0;
  walk(root,(file,relative)=>{
    if(!isCandidate(relative))return;
    const html=fs.readFileSync(file,'utf8');
    if(!isIndexable(html))return;
    const url=urlFor(relative);
    const updated=normalizePublicIndexLinks(normalize(html,url),relative);
    if(updated!==html){fs.writeFileSync(file,updated,'utf8');changed++;}
    eligible++;urls.push(url);
  });
  if(!urls.includes(base+'/'))throw Error('SEO build aborted: homepage not indexable.');
  const unique=[...new Set(urls)].sort((a,b)=>a===base+'/'?-1:b===base+'/'?1:a.localeCompare(b));
  const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n'+
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
    unique.map(url=>'  <url><loc>'+url.replaceAll('&','&amp;')+'</loc></url>').join('\n')+
    '\n</urlset>\n';
  fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap,'utf8');
  console.log('SEO public pages:',JSON.stringify({eligible,canonicalPagesChanged:changed,sitemapUrls:unique.length}));
}
if(require.main===module)main();
module.exports={isCandidate,urlFor,isIndexable,normalize,normalizePublicIndexLinks};
