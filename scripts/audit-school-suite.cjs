#!/usr/bin/env node
'use strict';
// Read-only audit. Run: node scripts/audit-school-suite.cjs
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../lamastudio-school-suite');
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile())files.push(p)}}
walk(root);
const relative=p=>path.relative(root,p).replace(/\\/g,'/');
const existing=new Set(files.map(relative));
const groups=new Map(),redirects=[],missing=[];
for(const f of files){
 const rel=relative(f),buf=fs.readFileSync(f),hash=crypto.createHash('sha256').update(buf).digest('hex');
 if(!groups.has(hash))groups.set(hash,[]);
 groups.get(hash).push(rel);
 if(!/\\.(?:html?|js|css|webmanifest)$/i.test(rel))continue;
 const s=buf.toString('utf8');
 if(/location\\.replace\\s*\\(/.test(s)&&buf.length<1024)redirects.push(rel);
 const pattern=/(?:href|src)\\s*=\\s*["']([^"'#]+)["']/g;
 for(const m of s.matchAll(pattern)){
  const v=m[1];if(/^(?:[a-z]+:|\\/\\/|#|\\$\\{|data:)/i.test(v))continue;
  const url=v.split(/[?#]/)[0];if(!url||url.includes('${'))continue;
  const target=url.startsWith('/')?url.replace(/^\\/+/, ''):path.posix.normalize(path.posix.join(path.posix.dirname(rel),url));
  const inSuite=target.startsWith('lamastudio-school-suite/')?target.slice('lamastudio-school-suite/'.length):target;
  if(!existing.has(inSuite)&&!fs.existsSync(path.resolve(root,'..',target)))missing.push({source:rel,reference:v});
 }
}
const result={fileCount:files.length,byteIdenticalGroups:[...groups.values()].filter(x=>x.length>1),legacyRedirectPages:redirects,unresolvedLocalReferences:missing};
process.stdout.write(JSON.stringify(result,null,2)+'\\n');
