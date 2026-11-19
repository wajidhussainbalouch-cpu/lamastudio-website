'use strict';
// Mock DOM and circular data: never sends or deletes a real school message.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'notifications.html'),'utf8');
const a=html.indexOf('function escapeCircularHtml(value) {');
const b=html.indexOf('function openCircularModal()',a);
assert.ok(a>0&&b>a,'Cannot locate circular data safety helpers');
const nodes=new Map(),handlers={};
function node(id){
 if(!nodes.has(id))nodes.set(id,{
  innerHTML:'',textContent:'',classList:{add(){},toggle(){}},
  addEventListener:(name,callback)=>{handlers[id+':'+name]=callback;}
 });
 return nodes.get(id);
}
const schoolRow={
 id:"id' onclick='alert(1)",
 title:'<script>window.steal=1</script>',
 audience:'<img src=x onerror=alert(1)>',
 channel:'SMS',
 status:'Sent',
 createdAt:'2026-11-15T11:00:00Z',
 message:'Dear Parents <b>Tomorrow is a school day.</b>\nآپ کو اطلاع دی جاتی ہے',
 fileData:'javascript:alert(1)',
 fileName:'bad" onclick="alert(1)',
 fileType:'application/pdf'
};
let shouldFail=false,synced=0;
const ctx={
 document:{getElementById:node},
 LamaAPI:{list:async()=>{if(shouldFail)throw Error('Network');return [schoolRow];}},
 NOTIFICATIONS:'notifications',activeFilter:'All',
 formatDate:()=> '15 Nov 2026',STATUS_STYLES:{Sent:'sent',Draft:'draft'},
 syncToMainDashboard:async()=>{synced++},
 deleteCircular:()=>{}
};
vm.createContext(ctx);
vm.runInContext(html.slice(a,b),ctx);
assert.equal(ctx.safeCircularAttachmentUrl('javascript:alert(1)'),'');
assert.equal(ctx.safeCircularAttachmentUrl('https://cdn.example.org/circular.pdf'),'https://cdn.example.org/circular.pdf');
assert.equal(ctx.safeCircularAttachmentUrl('data:application/pdf;base64,SGVsbG8='),'data:application/pdf;base64,SGVsbG8=');
(async()=>{
 await ctx.renderFeed();
 const rendered=node('feedContainer').innerHTML;
 assert.doesNotMatch(rendered,/<script/i);
 assert.doesNotMatch(rendered,/<img src=x/i);
 assert.doesNotMatch(rendered,/onclick\s*=\s*["']?deleteCircular/i,'No executable inline delete handlers');
 assert.match(rendered,/&lt;script&gt;/);
 assert.match(rendered,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(rendered,/&lt;b&gt;Tomorrow is a school day.&lt;\/b&gt;/);
 assert.doesNotMatch(rendered,/href="javascript:/i,'Unsafe media links are not rendered');
 assert.match(rendered,/data-delete-circular=/);
 assert.equal(synced,1);
 shouldFail=true;
 await ctx.renderFeed();
 assert.match(node('feedContainer').textContent,/could not be loaded/i);
 assert.equal(synced,1,'Failed read cannot fake a dashboard sync');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
 for(const script of scripts)new vm.Script(script,{filename:'notifications inline'});
 console.log('PASS: Circulars escape stored text, reject dangerous links, handle unavailable APIs, and retain valid inline JavaScript.');
})().catch(error=>{console.error(error);process.exitCode=1});
