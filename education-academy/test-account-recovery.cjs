'use strict';
/* Launch QA for client-side recovery: no network calls or real candidate accounts. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname;
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const authCode=read('auth-supabase.js'),recoveryHtml=read('reset-password.html');
assert.ok(authCode.includes("recover?redirect_to="),'Recovery must explicitly target the academy page');
assert.ok(authCode.includes('reset-password.html'),'Recovery page redirect missing');
assert.ok(recoveryHtml.includes('autocomplete="new-password"'));
assert.ok(recoveryHtml.includes('id="confirmPassword"'));
assert.ok(recoveryHtml.includes('history.replaceState'),'Recovery tokens must leave browser URL history');
assert.ok(!/localStorage\.setItem\s*\(\s*[^,]+,\s*(?:password|token)/.test(recoveryHtml),'Recovery token/password may not be copied to localStorage');
const config={enabled:true,url:'https://example.supabase.co',publishableKey:'sb_publishable_testkey_only_not_a_secret'};
const endpoints=[];
const fetchMock=async (url,options={})=>{
 endpoints.push({url:String(url),method:options.method||'GET',body:options.body,authorization:options.headers?.Authorization});
 return {ok:true,json:async()=>({id:'user-demo'})};
};
const sessionStorage={getItem:()=>null,setItem(){throw Error('Recovery should not use sessionStorage')},removeItem(){}};
const context={window:{LAMA_PPSC_SUPABASE:config},sessionStorage,fetch:fetchMock,AbortController,setTimeout,clearTimeout};
vm.runInNewContext(authCode,context,{filename:'auth-supabase.js',timeout:4000});
async function checkRequest(){
 await context.window.LamaAcademyAuth.resetPassword('candidate@example.com');
 assert.equal(endpoints.length,1);
 assert.ok(endpoints[0].url.startsWith(config.url+'/auth/v1/recover?redirect_to='));
 assert.equal(new URL(endpoints[0].url).searchParams.get('redirect_to'),'https://www.lamastudio.pk/education-academy/reset-password.html');
 assert.equal(JSON.parse(endpoints[0].body).email,'candidate@example.com');
}
class Element{
 constructor(){this.textContent='';this.hidden=true;this.disabled=false;this.value='';this.type='password';this.listeners={};this.classList={toggle(){} };}
 addEventListener(name,fn){this.listeners[name]=fn;}
}
const names=['status','recoveryForm','password','confirmPassword','savePassword'];
async function checkForm({type,match=true}){
 const el=Object.fromEntries(names.map(n=>[n,new Element()]));el.password.value='a-strong-unique-password';el.confirmPassword.value=match?el.password.value:'different-password';
 let removed=null;
 const loc={hash:type==='recovery'?'#access_token='+('x'.repeat(180))+'&type=recovery':'#type=signup',pathname:'/education-academy/reset-password.html'};
 const document={getElementById:id=>el[id],querySelectorAll:()=>[]};
 const script=[...recoveryHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)?.[1];
 assert.ok(script,'Recovery module script missing');
 const calls=[];
 const fetch=async (url,options={})=>{calls.push({url:String(url),options});return {ok:true,json:async()=>({})}};
 vm.runInNewContext(script,{window:{LAMA_PPSC_SUPABASE:config},location:loc,history:{replaceState(...args){removed=args}},document,URLSearchParams,fetch,AbortController,setTimeout,clearTimeout},{filename:'reset-password.html',timeout:4000});
 assert.ok(removed,'Sensitive hash must be cleared immediately');
 if(type!=='recovery'){assert.equal(el.recoveryForm.hidden,true,'Non-recovery link must not activate reset');assert.equal(calls.length,0);return}
 assert.equal(el.recoveryForm.hidden,false,'Recovery form should become available');
 await el.recoveryForm.listeners.submit({preventDefault(){}});
 if(!match){assert.equal(calls.length,0,'Mismatched passwords must not cause a request');return}
 assert.ok(calls.length>0,'No password update request issued');
 assert.equal(calls[0].url,config.url+'/auth/v1/user');
 assert.equal(calls[0].options.method,'PUT');
 assert.equal(calls[0].options.headers.Authorization,'Bearer '+('x'.repeat(180)));
 assert.equal(JSON.parse(calls[0].options.body).password,'a-strong-unique-password');
 assert.equal(el.recoveryForm.hidden,true,'Successful reset must close password form');
 assert.ok(el.status.textContent.includes('updated successfully'),'Success status missing');
}
(async()=>{
 await checkRequest();
 await checkForm({type:'signup'});
 await checkForm({type:'recovery',match:false});
 await checkForm({type:'recovery',match:true});
 console.log('Academy password recovery checks passed: redirect, token cleanup, matching, authenticated update.');
})().catch(e=>{console.error(e);process.exitCode=1});
