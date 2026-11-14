/* Optional LAMA Coding Academy accounts: deliberate, manual-only cloud sync.
 * No service-role key; no learning data transmitted without a signed-in user action.
 */
(function(){
"use strict";
const config=window.LAMA_CODING_CLOUD_CONFIG||{};
const core=window.LAMA_CODING_CLOUD_CORE;
const byId=id=>document.getElementById(id);
const clientVersion="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/+esm";
const readyConfig=Boolean(config.enabled&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.url||"")&&
  /^sb_publishable_[a-zA-Z0-9_-]+$/.test(config.publishableKey||"")&&config.table==="lama_coding_progress");
let client=null,user=null,remote=null,busy=false,mode="login",recovery=false;
function text(id,msg){byId(id).textContent=String(msg);}
function report(target,message,type){
 const el=byId(target);el.className="status"+(type?" "+type:"");el.textContent=String(message);
}
function buttonState(){
 const online=Boolean(client&&user&&!busy&&!recovery);
 byId("upload").disabled=!online||!byId("syncConsent").checked;
 byId("refresh").disabled=!online;
 byId("downloadCloud").disabled=!online||!remote;
 byId("deleteCloud").disabled=!online||!remote;
 byId("authSubmit").disabled=!client||busy;
 byId("signOut").disabled=!client||busy;
 byId("clearLocal").disabled=busy;
 byId("deleteAccount").disabled=!online||config.accountDeletionEnabled!==true||
   byId("deletePhrase").value.trim()!=="DELETE ACCOUNT"||
   byId("deletePassword").value.length<8;
}
function setBusy(value){
 busy=value;buttonState();
}
function describeLocal(){
 try{
  const snapshot=core.read(localStorage),counts=core.counts(snapshot);
  text("localCount",counts.done+" / "+counts.total);
 }catch(e){
  text("localCount","Needs attention");
  report("syncStatus","Local progress could not be read safely: "+String(e.message||e),"error");
 }
}
function describeRemote(){
 if(!remote){text("remoteCount","No cloud copy");text("remoteTime","No saved cloud progress was found for this learner.");return;}
 try{
  const c=core.counts(core.validate(remote.snapshot));
  text("remoteCount",c.done+" / "+c.total);
  const stamp=new Date(remote.updated_at);
  text("remoteTime","Last cloud update: "+(Number.isFinite(stamp.valueOf())?stamp.toLocaleString():"Date unavailable"));
 }catch(e){
  text("remoteCount","Invalid backup");
  text("remoteTime","The cloud record could not pass validation. It has not been applied to this device.");
  report("syncStatus","A cloud backup was found but failed validation: "+String(e.message||e),"error");
 }
}
function renderSession(){
 byId("signedOut").hidden=Boolean(user)||recovery;
 byId("signedIn").hidden=!user||recovery;
 byId("recovery").hidden=!recovery;
 byId("accountDeleteArea").hidden=!(client&&user&&!recovery&&config.accountDeletionEnabled===true);
 text("accountEmail",user?.email||"Signed-in learner");
 if(!user){remote=null;byId("syncConsent").checked=false;}
 describeRemote();describeLocal();buttonState();
}
function changeMode(next){
 if(!["login","signup","reset"].includes(next)||busy)return;
 mode=next;
 for(const tab of document.querySelectorAll("[data-mode]")){
  tab.setAttribute("aria-pressed",String(tab.dataset.mode===mode));
 }
 byId("passwordRow").hidden=mode==="reset";
 byId("confirmRow").hidden=mode!=="signup";
 byId("consentRow").hidden=mode!=="signup";
 byId("password").required=mode!=="reset";
 byId("confirmPassword").required=mode==="signup";
 byId("password").autocomplete=mode==="signup"?"new-password":"current-password";
 text("authSubmit",mode==="signup"?"Create learner account":mode==="reset"?"Send password reset link":"Sign in");
}
async function requireUser(){
 if(!client)throw Error("Cloud service is not configured.");
 const {data,error}=await client.auth.getUser();
 if(error||!data?.user?.id)throw Error("Your session has expired. Sign in again.");
 if(user&&user.id!==data.user.id)throw Error("Account changed. Refresh and try again.");
 return data.user;
}
async function getRemote(){
 const current=await requireUser();
 const {data,error}=await client.from(config.table).select("snapshot,updated_at")
   .eq("user_id",current.id).maybeSingle();
 if(error)throw error;
 return data||null;
}
async function refreshRemote(){
 if(!client||!user)return;
 setBusy(true);
 try{
  remote=await getRemote();
  describeRemote();
  report("syncStatus",remote?"Your private cloud copy was checked. No local progress has been changed.":"No cloud copy yet. You can choose to upload from this device.");
 }catch(e){
  remote=null;describeRemote();
  report("syncStatus","Could not check the cloud copy: "+String(e.message||e),"error");
 }finally{setBusy(false);}
}
async function refreshSession(){
 if(!client)return;
 try{
  const {data,error}=await client.auth.getUser();
  user=error?null:data.user||null;
 }catch(e){user=null;}
 renderSession();
 if(user&&!recovery)await refreshRemote();
}
async function registerOrLogin(event){
 event.preventDefault();
 if(!client||busy)return;
 const email=byId("email").value.trim().toLowerCase();
 const password=byId("password").value;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254){
  report("accountStatus","Enter a valid email address.","error");return;
 }
 if(mode!=="reset"&&(password.length<8||password.length>128)){
  report("accountStatus","Use a password between 8 and 128 characters.","error");return;
 }
 if(mode==="signup"){
  if(password!==byId("confirmPassword").value){report("accountStatus","The passwords do not match.","error");return;}
  if(!byId("signupConsent").checked){report("accountStatus","Confirm the account and cloud-privacy notice first.","error");return;}
 }
 setBusy(true);
 try{
  if(mode==="reset"){
   const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:new URL("./account.html",location.href).href});
   if(error)throw error;
   report("accountStatus","If this email has an account, a password-reset link will be sent. Check your inbox and spam folder.","good");
  }else if(mode==="signup"){
   const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:new URL("./account.html",location.href).href}});
   if(error)throw error;
   if(data.session){
    report("accountStatus","Account created and signed in. Your local progress has NOT been uploaded.","good");
   }else{
    report("accountStatus","If registration was accepted, check your email to confirm your account. No progress was uploaded.","good");
   }
  }else{
   const {error}=await client.auth.signInWithPassword({email,password});
   if(error)throw error;
   report("accountStatus","Signed in. Your local progress remains private until you choose Upload.","good");
  }
 }catch(e){report("accountStatus","Account action failed: "+String(e.message||e),"error");}
 finally{setBusy(false);byId("password").value="";byId("confirmPassword").value="";}
}
async function updatePassword(event){
 event.preventDefault();
 if(!client||!recovery||busy)return;
 const first=byId("newPassword").value,second=byId("newConfirm").value;
 if(first.length<8||first.length>128||first!==second){
  report("accountStatus","Enter matching new passwords of 8–128 characters.","error");return;
 }
 setBusy(true);
 try{
  const {error}=await client.auth.updateUser({password:first});
  if(error)throw error;
  recovery=false;
  byId("newPassword").value="";byId("newConfirm").value="";
  report("accountStatus","Password updated. Your learning data was not changed.","good");
  await refreshSession();
 }catch(e){report("accountStatus","Password update failed: "+String(e.message||e),"error");}
 finally{setBusy(false);}
}
async function upload(){
 if(!user||busy||!byId("syncConsent").checked)return;
 let snapshot;
 try{snapshot=core.read(localStorage);}
 catch(e){report("syncStatus","Upload cancelled: "+String(e.message||e),"error");return;}
 setBusy(true);
 try{
  const verified=await requireUser();
  // Check cloud state before asking to overwrite. Do not silently replace
  // changes uploaded from another device since this page last refreshed.
  const latest=await getRemote();
  if((remote?.updated_at||null)!==(latest?.updated_at||null)){
   remote=latest;describeRemote();
   throw Error("The cloud backup changed on another device. Refresh and review it before uploading.");
  }
  const counts=core.counts(snapshot);
  const intent=latest
   ? "Replace the cloud copy with this device's "+counts.done+"/"+counts.total+" completed activities? Cloud-only work will be lost. Consider restoring/download backup first."
   : "Upload this device's learning progress, code drafts and reflections to your private cloud account?";
  if(!confirm(intent)){report("syncStatus","Upload cancelled; neither device's progress was changed.");return;}
  let result;
  if(latest){
   // Optimistic concurrency: the server changes updated_at on every update.
   // If a concurrent upload landed after our check, zero rows will be updated.
   result=await client.from(config.table)
    .update({snapshot})
    .eq("user_id",verified.id)
    .eq("updated_at",latest.updated_at)
    .select("updated_at").maybeSingle();
   if(!result.error&&!result.data)throw Error("Cloud backup changed during this upload. Refresh before retrying.");
  }else{
   // Insert-only first upload: a competing insert fails on primary-key conflict.
   result=await client.from(config.table)
    .insert({user_id:verified.id,snapshot})
    .select("updated_at").single();
  }
  if(result.error)throw result.error;
  remote={snapshot,updated_at:result.data.updated_at};
  byId("syncConsent").checked=false;describeRemote();
  report("syncStatus","Upload completed. Your private cloud copy is saved; future changes are NOT uploaded automatically.","good");
 }catch(e){report("syncStatus","Cloud upload was not completed: "+String(e.message||e),"error");}
 finally{setBusy(false);}
}
async function restore(){
 if(!user||busy)return;
 setBusy(true);
 try{
  const latest=await getRemote();
  if(!latest)throw Error("No cloud copy is available for this account.");
  const remoteSnapshot=core.validate(latest.snapshot);
  const before=core.counts(core.read(localStorage)),after=core.counts(remoteSnapshot);
  const message="Replace this device's "+before.done+"/"+before.total+" activities and current code drafts with the cloud copy ("+after.done+"/"+after.total+")?\n\nDownload a local backup first. This cannot be undone without a backup.";
  if(!confirm(message)){report("syncStatus","Restore cancelled; your local work is unchanged.");return;}
  core.apply(localStorage,remoteSnapshot);
  remote=latest;describeLocal();describeRemote();
  report("syncStatus","Cloud progress restored to this device. Reopen any lesson page to load the restored drafts.","good");
 }catch(e){report("syncStatus","Restore failed: "+String(e.message||e),"error");}
 finally{setBusy(false);}
}
async function deleteCopy(){
 if(!user||busy)return;
 if(!confirm("Delete this account's cloud progress copy? This does not delete local lessons or your sign-in account."))return;
 setBusy(true);
 try{
  const verified=await requireUser();
  const {error}=await client.from(config.table).delete().eq("user_id",verified.id);
  if(error)throw error;
  remote=null;describeRemote();
  report("syncStatus","Cloud progress copy deleted. This device's lessons and code drafts remain available.","good");
 }catch(e){report("syncStatus","Cloud deletion failed: "+String(e.message||e),"error");}
 finally{setBusy(false);}
}
// Device-local deletion is independent of cloud progress and Auth.
function eraseLocalLearning(){
 const parts=core?.parts||[];
 // The 150-question practice bank is a fifth device-local learner store.
 // It is intentionally excluded from the still-disabled cloud snapshot,
 // but MUST be included when someone explicitly erases local learning data.
 const keys=[...parts.map(part=>part.key),"lama-coding-questions-v1"];
 const previous=keys.map(key=>({key,value:localStorage.getItem(key)}));
 try{
  for(const item of previous)localStorage.removeItem(item.key);
 }catch(error){
  let reverted=true;
  for(const item of previous){
   try{
    if(item.value===null)localStorage.removeItem(item.key);
    else localStorage.setItem(item.key,item.value);
   }catch(e){reverted=false;}
  }
  throw Error(reverted?"Unable to erase data. No change was kept.":"Some local data could not be restored. Please use your downloaded backup.");
 }
 describeLocal();
}
async function deleteAccount(event){
 event.preventDefault();
 if(!client||!user||busy||config.accountDeletionEnabled!==true)return;
 if(byId("deletePhrase").value.trim()!=="DELETE ACCOUNT"||
    byId("deletePassword").value.length<8){
  report("eraseStatus","Type DELETE ACCOUNT and enter your current password.","error");
  return;
 }
 const localErase=byId("clearAfterDelete").checked;
 if(!confirm("Permanently delete your learner account and its cloud progress? This cannot be undone. Your device learning data will "+(localErase?"also be erased.":"remain on this device.")))return;
 setBusy(true);
 const password=byId("deletePassword").value;
 byId("deletePassword").value="";
 try{
  // This function is deployed separately with its own protected server-side
  // secret and user/password verification. No administrative key is in the app.
  const {data,error}=await client.functions.invoke("coding-account-delete",{
   method:"DELETE",
   body:{confirmation:"DELETE ACCOUNT",password}
  });
  if(error)throw error;
  if(!data||data.deleted!==true)throw Error("Deletion was not confirmed by the server.");
  try{await client.auth.signOut({scope:"local"});}catch(e){}
  user=null;remote=null;recovery=false;
  if(localErase){
   try{eraseLocalLearning();}
   catch(e){report("eraseStatus","Your account was deleted, but local learning data could not be fully erased: "+String(e.message||e),"error");renderSession();return;}
  }
  byId("deletePhrase").value="";
  byId("clearAfterDelete").checked=false;
  renderSession();
  report("eraseStatus","Your account and linked cloud progress have been deleted. "+(localErase?"This browser's academy progress was also erased.":"Progress on this device was kept."),"good");
  report("accountStatus","The account was deleted. You may continue using the academy without signing in.","good");
 }catch(e){
  report("eraseStatus","Account deletion was NOT confirmed. Your account may still exist. "+String(e.message||e),"error");
 }finally{setBusy(false);}
}
function clearLocal(){
 if(busy)return;
 if(!confirm("Delete all five learning records (four course modules and 150-question scores) from THIS browser? This does not remove your cloud progress or account. Download a backup first."))return;
 try{
  eraseLocalLearning();
  report("eraseStatus","Device learning data erased. This action does not delete your cloud copy or authentication account.","good");
 }catch(e){
  report("eraseStatus","Local deletion failed: "+String(e.message||e),"error");
 }
}
async function logout(){
 if(!client||busy)return;
 setBusy(true);
 try{
  const {error}=await client.auth.signOut({scope:"local"});
  if(error)throw error;
  user=null;remote=null;recovery=false;
  report("accountStatus","Signed out from this browser. Local lesson progress is preserved.","good");
  renderSession();
 }catch(e){report("accountStatus","Sign-out failed: "+String(e.message||e),"error");}
 finally{setBusy(false);}
}
async function initialize(){
 describeLocal();
 if(!core){text("configStatus","Local progress support is unavailable. Reload the page.");return;}
 if(!readyConfig){
  text("configStatus","Learner accounts are not activated yet. All learning and local backups work without signing in.");
  report("accountStatus","Account registration and cloud sync will be enabled only after a dedicated, security-reviewed backend is configured.");
  byId("authSubmit").disabled=true;
  return;
 }
 text("configStatus","Connecting to the optional learner account service…");
 try{
  const {createClient}=await import(clientVersion);
  client=createClient(config.url,config.publishableKey,{
   auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},
   global:{headers:{"X-Client-Info":"lama-coding-academy"}}
  });
  // Do not call getUser asynchronously inside the auth callback; avoid auth lock deadlocks.
  client.auth.onAuthStateChange((event)=>{
   if(event==="PASSWORD_RECOVERY"){
    recovery=true;renderSession();report("accountStatus","Password recovery verified. Choose a new password.");return;
   }
   if(event==="SIGNED_IN"||event==="SIGNED_OUT"||event==="USER_UPDATED"||event==="INITIAL_SESSION"){
    setTimeout(()=>{refreshSession().catch(()=>{});},0);
   }
  });
  text("configStatus","Account service is enabled. Learning remains available without signing in.");
  await refreshSession();
 }catch(e){
  client=null;user=null;
  text("configStatus","Account service could not load. Learning and local backups remain available.");
  report("accountStatus","Could not initialize accounts. Check your network connection and the dedicated backend setup. "+String(e.message||e),"error");
 }
 buttonState();
}
document.querySelectorAll("[data-mode]").forEach(tab=>{
 tab.addEventListener("click",()=>changeMode(tab.dataset.mode));
});
function togglePassword(inputId,buttonId){
 const input=byId(inputId);
 input.type=input.type==="password"?"text":"password";
 text(buttonId,input.type==="password"?"Show":"Hide");
}
byId("showPassword").addEventListener("click",()=>togglePassword("password","showPassword"));
byId("showConfirm").addEventListener("click",()=>togglePassword("confirmPassword","showConfirm"));
byId("authForm").addEventListener("submit",registerOrLogin);
byId("recoveryForm").addEventListener("submit",updatePassword);
byId("signOut").addEventListener("click",logout);
byId("syncConsent").addEventListener("change",buttonState);
byId("upload").addEventListener("click",upload);
byId("refresh").addEventListener("click",refreshRemote);
byId("downloadCloud").addEventListener("click",restore);
byId("deleteCloud").addEventListener("click",deleteCopy);
byId("clearLocal").addEventListener("click",clearLocal);
byId("deletePhrase").addEventListener("input",buttonState);
byId("deletePassword").addEventListener("input",buttonState);
byId("accountDeleteForm").addEventListener("submit",deleteAccount);
changeMode("login");
buttonState();
initialize().catch(e=>report("accountStatus",String(e.message||e),"error"));
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
})();
