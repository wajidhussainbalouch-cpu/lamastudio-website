/* LAMA PPSC Academy / Supabase Free candidate identity adapter.
 * Inert until a reviewed configuration file sets enabled=true.
 * Public publishable/anon key only; NEVER embed service_role secrets.
 */
'use strict';
window.LamaAcademyAuth=(()=>{
 const settings=window.LAMA_PPSC_SUPABASE||{};
 const configured=Boolean(settings.enabled&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(settings.url||'')&&typeof settings.publishableKey==='string'&&settings.publishableKey.length>20);
 const base=configured?settings.url.replace(/\/$/,''):'';
 const key=configured?settings.publishableKey:'';
 let accessToken=null;
 let currentUser=null;
 const state=()=>({configured,authenticated:Boolean(accessToken&&currentUser),user:currentUser&&{id:currentUser.id,email:currentUser.email}});
 async function request(endpoint,body,token){
  if(!configured)throw Error('Candidate accounts are not enabled.');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch(base+'/auth/v1/'+endpoint,{method:'POST',headers:{'apikey':key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:controller.signal,cache:'no-store'});
   const payload=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(payload.msg||payload.error_description||payload.message||'Authentication request failed');
   return payload;
  }finally{clearTimeout(timeout)}
 }
 async function signUp({email,password,fullName,occupation}){
  if(!configured)throw Error('Registration is not enabled.');
  if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254)throw Error('Enter a valid email address.');
  if(typeof password!=='string'||password.length<12||password.length>128)throw Error('Use a password between 12 and 128 characters.');
  if(typeof fullName!=='string'||fullName.trim().length<2||fullName.trim().length>120)throw Error('Enter your full name.');
  if(occupation&&occupation.length>120)throw Error('Occupation is too long.');
  // Supabase stores passwords securely; do not persist credentials in localStorage.
  const result=await request('signup',{email:email.trim().toLowerCase(),password,data:{full_name:fullName.trim(),occupation:(occupation||'').trim()}});
  return {emailVerificationRequired:!result.access_token,created:Boolean(result.user)};
 }
 async function signIn({email,password}){
  if(!configured)throw Error('Login is not enabled.');
  const result=await request('token?grant_type=password',{email,password});
  if(!result.access_token||!result.user||!result.user.email_confirmed_at)throw Error('Confirm your email before signing in.');
  accessToken=result.access_token;currentUser=result.user;
  return state();
 }
 async function signOut(){if(accessToken){try{await request('logout',{},accessToken)}finally{accessToken=null;currentUser=null}}return state()}
 async function resetPassword(email){if(!configured)throw Error('Password reset is not enabled.');if(!/^\S+@\S+\.\S+$/.test(email))throw Error('Enter a valid email address.');await request('recover',{email});return true}
 return Object.freeze({state,signUp,signIn,signOut,resetPassword});
})();
