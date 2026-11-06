/* Candidate account controls: hidden until approved public config is enabled. */
'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const auth=window.LamaAcademyAuth;
 const byId=id=>document.getElementById(id);
 const status=byId('candidateAccountMessage');
 const setStatus=message=>{status.textContent=message;};
 const signup=byId('candidateSignUp'),signin=byId('candidateSignIn'),reset=byId('candidateReset');
 const tabs=byId('accountTabs');
 function showTab(which){if(!tabs)return;signup.hidden=which!=='signup';signin.hidden=which!=='signin';reset.hidden=which!=='reset';tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.accountTab===which)));}
 if(tabs){tabs.addEventListener('click',e=>{const b=e.target.closest('button[data-account-tab]');if(b)showTab(b.dataset.accountTab)});showTab('signup')}

 const formData=form=>Object.fromEntries(new FormData(form).entries());
 document.querySelectorAll('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{const input=button.parentElement.querySelector('input');const visible=input.type==='password';input.type=visible?'text':'password';button.textContent=visible?'Hide':'Show';button.setAttribute('aria-pressed',String(visible));button.setAttribute('aria-label',visible?'Hide password':'Show password')}));
 const refresh=()=>{
  const state=auth&&auth.state();
  const enabled=Boolean(state&&state.configured);
  byId('accountForms').hidden=!enabled||state.authenticated;
  byId('candidateSignedIn').hidden=!enabled||!state.authenticated;
  byId('accountAvailability').textContent=enabled?'Candidate accounts are available. Please verify your email before signing in.':'Secure registration is not enabled yet. Free practice remains available without an account.';
  byId('candidateIdentity').textContent=state&&state.user?'Signed in as '+state.user.email:'';
 };
 async function handle(formId,action,success){
  const form=byId(formId);
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(!auth||!auth.state().configured)return;
   const button=form.querySelector('button[type=submit]');
   button.disabled=true;setStatus('Please wait…');
   try{await action(formData(form));form.reset();setStatus(success);refresh();}
   catch(error){setStatus(error&&error.message||'Request failed. Please try again.')}
   finally{button.disabled=false;}
  });
 }
 handle('candidateSignUp',async data=>{
  const result=await auth.signUp(data);
  if(!result.created)throw Error('Registration could not be confirmed.');
 },'Registration requested. Check your email for a verification link, then sign in.');
 handle('candidateSignIn',async data=>{
  await auth.signIn(data);
  try{
   const profiles=await auth.profile();
   if(!profiles.length){
    const details=auth.state().user;
    const meta=details&&details.user_metadata||{};
    const fullName=String(meta.full_name||'').trim();
    if(fullName.length>=2&&fullName.length<=120)await auth.createProfile({displayName:fullName,occupation:String(meta.occupation||'').slice(0,120),gender:meta.gender,phone:meta.phone,address:meta.address,photoUrl:meta.photo_url});
   }
  }catch(e){/* Sign-in remains valid if profile read is temporarily unavailable. */}
 },'Signed in successfully. Your cloud practice history is available below.');
 handle('candidateReset',data=>auth.resetPassword(data.email),'If this email is registered, password recovery instructions will be sent.');
 byId('candidateSignOut').addEventListener('click',async()=>{
  try{await auth.signOut();byId('candidateCloudData').textContent='';setStatus('Signed out.');}
  catch(e){setStatus('Sign-out request failed; local session was cleared.')}
  refresh();
 });
 byId('candidateLoadHistory').addEventListener('click',async()=>{
  try{
   const records=await auth.practiceHistory();
   const area=byId('candidateCloudData');area.replaceChildren();
   const heading=document.createElement('p');heading.textContent='Cloud practice attempts: '+records.length;area.append(heading);
   const list=document.createElement('ul');
   records.forEach(item=>{const li=document.createElement('li');li.textContent=item.paper_id+' · '+item.correct_answers+'/'+item.total_questions+' · '+new Date(item.completed_at).toLocaleDateString();list.append(li)});
   area.append(list);
  }catch(e){setStatus(e.message||'Unable to load history.')}
 });
 byId('candidateLoadSubscription').addEventListener('click',async()=>{
  try{
   const items=await auth.subscriptions();
   const active=items.find(x=>x.status==='active'&&x.expires_at&&new Date(x.expires_at)>new Date());
   setStatus(active?'Active membership expires '+new Date(active.expires_at).toLocaleDateString():'No active membership. Payment activation is not available yet.');
  }catch(e){setStatus(e.message||'Unable to check membership.')}
 });
 refresh();
 if(auth&&auth.restoreSession)auth.restoreSession().then(()=>{refresh();if(auth.state().authenticated)setStatus('Welcome back. Your account is signed in.')}).catch(()=>refresh());
});
