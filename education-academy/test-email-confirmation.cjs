'use strict';
/* Supabase email confirmation regression; no actual account is created and no real messages are sent.
 * node education-academy/test-email-confirmation.cjs
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=__dirname,read=f=>fs.readFileSync(path.join(root,f),'utf8');
const publicURL='https://www.lamastudio.pk/education-academy/';
const cfg={enabled:true,url:'https://example.supabase.co',publishableKey:'sb_publishable_public_test_key_for_qa'};
const authScript=read('auth-supabase.js');
const confirmHtml=read('confirm.html');
const calls=[];
const store={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const fetchMock=async (url,opts)=>{
 calls.push({url,opts});
 return {ok:true,json:async()=>url.includes('/signup')?{user:{id:'local-qa-only'}}:{}};
};
const context={window:{LAMA_PPSC_SUPABASE:cfg},sessionStorage:store,URLSearchParams,
 fetch:fetchMock,setTimeout,clearTimeout,AbortController,Date,console};
vm.runInNewContext(authScript,context,{filename:'auth-supabase.js',timeout:3000});
const auth=context.window.LamaAcademyAuth;
async function checkCallbacks(fragment,query,confirmed){
 let status={textContent:''},changed=null,seen=[],n=0;
 const script=[...confirmHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)?.[1];
 assert.ok(script,'Confirmation callback inline script missing');
 const location={pathname:'/education-academy/confirm.html',hash:fragment,search:query};
 const runtime={window:{LAMA_PPSC_SUPABASE:cfg},location,history:{replaceState(...args){changed=args}},
 document:{getElementById(id){assert.equal(id,'status');return status}},URLSearchParams,setTimeout,clearTimeout,AbortController,
 fetch:async(url,opts)=>{
  seen.push({url,opts});
  return {ok:true,json:async()=>({id:'qa-user',email_confirmed_at:confirmed?'2026-11-22T11:00:00Z':null})};
 },console};
 await vm.runInNewContext(script,runtime,{filename:'confirm.html',timeout:4000});
 if(fragment||query)assert.ok(changed,'Sensitive callback URL not removed');
 if(fragment.includes('access_token=')){
  assert.equal(seen.length,1,'Account confirmation must be checked with Supabase');
  assert.equal(seen[0].url,cfg.url+'/auth/v1/user');
  assert.ok(seen[0].opts.headers.Authorization.startsWith('Bearer '));
  assert.equal(status.textContent.startsWith('Email verified successfully!'),confirmed);
 }else assert.equal(seen.length,0,'No verification request without a token');
 assert.ok(!status.textContent.includes('test-access-token'),'Never echo confirmation credentials');
 return status.textContent;
}
(async()=>{
 assert.ok(authScript.includes('resend?redirect_to='),'Resend must specify confirmation URL');
 assert.ok(authScript.includes('signup?redirect_to='),'Signup must specify confirmation URL');
 assert.ok(authScript.includes('recover?redirect_to='),'Recovery must specify password reset URL');
 await auth.signUp({email:'candidate@example.org',password:'test-password-is-long',fullName:'Demo Candidate'});
 await auth.resendSignupEmail('candidate@example.org');
 await auth.resetPassword('candidate@example.org');
 assert.equal(calls.length,3);
 for(const [i,action,expected] of [
  [0,'signup',publicURL+'confirm.html'],
  [1,'resend',publicURL+'confirm.html'],
  [2,'recover',publicURL+'reset-password.html']
 ]){
  const target=new URL(calls[i].url);
  assert.ok(target.pathname.endsWith('/auth/v1/'+action),'Unexpected endpoint '+target.pathname);
  assert.equal(target.searchParams.get('redirect_to'),expected,'Wrong candidate redirect '+action);
  assert.ok(!calls[i].url.includes('localhost'),'Public auth emails must never direct to localhost');
 }
 assert.ok(confirmHtml.indexOf('src="./supabase-config.js"')<confirmHtml.indexOf("(async()=>"),'Config must load before callback');
 assert.ok(confirmHtml.includes('href="./index.html#account"'),'Confirmation must link to a working login route');
 assert.ok(confirmHtml.includes('name="referrer" content="no-referrer"'),'Do not forward confirmation URL as referrer');
 assert.ok(confirmHtml.includes('history.replaceState'),'Clear access tokens and errors from browser URL');
 assert.ok(confirmHtml.includes('email_confirmed_at'),'Check confirmed status at Supabase; do not guess from URL type');
 await checkCallbacks('#access_token=test-access-token&type=signup','',true);
 await checkCallbacks('#access_token=test-access-token&type=signup','',false);
 const error=await checkCallbacks('#error_description=Expired+link&error_code=otp_expired','',false);
 assert.ok(error.includes('request a new confirmation'),'Expiry must direct user to resend');
 const missing=await checkCallbacks('','',false);
 assert.ok(missing.includes('Try signing in'),'No token should produce practical guidance');
 const ui=read('candidate-account-ui.js');
 assert.ok(ui.includes('Resend Confirmation'),'Recovery guidance should be visible to candidates');
 console.log('PPSC email confirmation PASS: signup/resend use public confirmation URL, reset uses academy, confirmed and invalid callbacks handled, sensitive fragments cleared.');
})().catch(e=>{console.error(e);process.exitCode=1});
