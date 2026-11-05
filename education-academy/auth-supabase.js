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
 let refreshToken=null;
 let expiresAt=0;
 const sessionKey='lama_ppsc_candidate_session_v1';
 function persistSession(){try{if(refreshToken&&currentUser)sessionStorage.setItem(sessionKey,JSON.stringify({refreshToken,user:currentUser}));else sessionStorage.removeItem(sessionKey)}catch(e){/* Private browsing may block storage */}}
 try{const cached=JSON.parse(sessionStorage.getItem(sessionKey)||'null');if(cached&&cached.refreshToken&&cached.user){refreshToken=cached.refreshToken;currentUser=cached.user}}catch(e){/* Ignore malformed stored session */}
 const state=()=>({configured,authenticated:Boolean(accessToken&&currentUser&&Date.now()<expiresAt),user:currentUser&&{id:currentUser.id,email:currentUser.email,user_metadata:{full_name:currentUser.user_metadata&&currentUser.user_metadata.full_name||'',occupation:currentUser.user_metadata&&currentUser.user_metadata.occupation||''}}});
 function saveSession(result){if(!result.access_token||!result.user)throw Error('Invalid authentication response.');accessToken=result.access_token;refreshToken=result.refresh_token||null;currentUser=result.user;expiresAt=Date.now()+Math.max(0,Number(result.expires_in||3600)-30)*1000;persistSession();}
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
 async function restoreSession(){if(!configured||!refreshToken)return state();try{await token()}catch(e){/* Expired sessions remain signed out */}return state()}
 async function signIn({email,password}){
  if(!configured)throw Error('Login is not enabled.');
  const result=await request('token?grant_type=password',{email,password});
  if(!result.access_token||!result.user||!result.user.email_confirmed_at)throw Error('Confirm your email before signing in.');
  saveSession(result);
  return state();
 }
 async function signOut(){try{if(accessToken)await request('logout',{},accessToken)}finally{accessToken=null;refreshToken=null;currentUser=null;expiresAt=0;persistSession()}return state()}
 async function token(){
  if(!configured||!currentUser||(!accessToken&&!refreshToken))throw Error('Please sign in first.');
  if(accessToken&&Date.now()<expiresAt)return accessToken;
  if(!refreshToken){await signOut();throw Error('Your session has expired. Please sign in again.');}
  try{const result=await request('token?grant_type=refresh_token',{refresh_token:refreshToken});saveSession(result);return accessToken}
  catch(e){accessToken=null;refreshToken=null;currentUser=null;expiresAt=0;persistSession();throw Error('Session expired. Please sign in again.')}
 }
 async function dataRequest(table,method,payload){
  const bearer=await token();
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch(base+'/rest/v1/'+table,{method,headers:{apikey:key,Authorization:'Bearer '+bearer,'Content-Type':'application/json',Prefer:'return=representation'},...(payload?{body:JSON.stringify(payload)}:{}),signal:controller.signal,cache:'no-store'});
   const result=await response.json().catch(()=>null);
   if(!response.ok)throw Error(result&&result.message||'Unable to load your account data.');
   return result;
  }finally{clearTimeout(timeout)}
 }
 async function profile(){return dataRequest('ppsc_candidates?select=id,display_name,occupation,created_at&limit=1','GET')}
 async function ensureProfile(){
  const existing=await profile();if(existing.length)return existing[0];
  const name=String(currentUser?.user_metadata?.full_name||'').trim();
  if(name.length<2||name.length>120)throw Error('Your profile name is missing. Please contact support to complete your profile.');
  try{const rows=await createProfile({displayName:name,occupation:String(currentUser?.user_metadata?.occupation||'').slice(0,120)});return rows[0]||null}
  catch(error){const again=await profile();if(again.length)return again[0];throw error}
 }
 async function createProfile({displayName,occupation}){
  if(typeof displayName!=='string'||displayName.trim().length<2||displayName.trim().length>120)throw Error('Enter a valid name.');
  const bearer=await token();if(!bearer||!currentUser)throw Error('Sign in first.');
  return dataRequest('ppsc_candidates','POST',{id:currentUser.id,display_name:displayName.trim(),occupation:(occupation||'').trim()});
 }
 async function practiceHistory(){return dataRequest('ppsc_practice_attempts?select=id,job_id,paper_id,total_questions,correct_answers,duration_seconds,completed_at&order=completed_at.desc&limit=100','GET')}
 async function savePracticeAttempt({jobId,paperId,totalQuestions,correctAnswers,durationSeconds}){
  if(!/^[a-zA-Z0-9_-]{2,80}$/.test(jobId)||!/^[a-zA-Z0-9_-]{2,100}$/.test(paperId))throw Error('Invalid paper identifier.');
  if(!Number.isInteger(totalQuestions)||totalQuestions<1||totalQuestions>500||!Number.isInteger(correctAnswers)||correctAnswers<0||correctAnswers>totalQuestions||!Number.isInteger(durationSeconds)||durationSeconds<0||durationSeconds>86400)throw Error('Invalid practice attempt.');
  return dataRequest('ppsc_practice_attempts','POST',{candidate_id:currentUser.id,job_id:jobId,paper_id:paperId,total_questions:totalQuestions,correct_answers:correctAnswers,duration_seconds:durationSeconds});
 }
 async function subscriptions(){return dataRequest('ppsc_subscriptions?select=status,starts_at,expires_at,approved_at&order=created_at.desc&limit=10','GET')}

 async function resetPassword(email){if(!configured)throw Error('Password reset is not enabled.');if(!/^\S+@\S+\.\S+$/.test(email))throw Error('Enter a valid email address.');await request('recover',{email});return true}
 return Object.freeze({state,restoreSession,signUp,signIn,signOut,resetPassword,profile,createProfile,ensureProfile,practiceHistory,savePracticeAttempt,subscriptions});
})();
