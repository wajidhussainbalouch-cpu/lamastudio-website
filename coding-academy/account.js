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
 const counts=core.counts(snapshot);
 const intent=remote
  ? "Replace the existing cloud backup with this device's "+counts.done+"/"+counts.total+" completed activities? Older cloud-only work may be lost."
  : "Upload this device's learning progress, code drafts and reflections to your private cloud account?";
 if(!confirm(intent))return;
 setBusy(true);
 try{
  const verified=await requireUser();
  const {data,error}=await client.from(config.table)
   .upsert({user_id:verified.id,snapshot},{onConflict:"user_id"})
   .select("updated_at").single();
  if(error)throw error;
  remote={snapshot,updated_at:data.updated_at};
  byId("syncConsent").checked=false;
  describeRemote();
  report("syncStatus","Upload completed. The cloud record was saved for your signed-in account. Future changes on this device are NOT uploaded automatically.","good");
 }catch(e){report("syncStatus","Cloud upload failed: "+String(e.message||e),"error");}
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
changeMode("login");
buttonState();
initialize().catch(e=>report("accountStatus",String(e.message||e),"error"));
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
})();
