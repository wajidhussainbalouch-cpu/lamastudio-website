'use strict';
/* Offline attendance: one encrypted school-specific vault per browser profile.
 * No credentials, API responses, or plaintext student records are cached by SW.
 * A verified School Admin session is required to prepare and synchronize.
 */
(()=>{
const $=id=>document.getElementById(id);
// The active role may be lost when the browser closes. Explicit links preserve
// the intended role even if both school and teacher accounts have logged in.
const requestedRole=new URLSearchParams(location.search).get('role');
const active=LamaAPI.getSession();
const session=requestedRole==='teacher'?LamaAPI.getSession('teacher'):
  requestedRole==='school'?LamaAPI.getSession('school'):
  active?.role==='teacher'?active:(LamaAPI.getSession('school')||LamaAPI.getSession('teacher'));
const teacherMode=session?.role==='teacher';
const schoolId=String(session?.schoolId||'');
const accountId=teacherMode?String(session?.teacherId||session?.id||''):'admin';
const vaultId=schoolId+'#'+(teacherMode?'teacher#'+accountId:'school-admin');
const readSnapshot=dates=>teacherMode?LamaAPI.teacherOfflineSnapshot(dates):LamaAPI.offlineAttendanceSnapshot(dates);
function validatedSnapshot(snapshot){
  if(!snapshot||snapshot.schoolId!==schoolId||
    snapshot.role!==(teacherMode?'teacher':'school')||
    !Array.isArray(snapshot.students)||!Array.isArray(snapshot.attendance))
    throw Error('Invalid or cross-school attendance snapshot returned');
  return snapshot;
}
/**
 * The server permits up to 90 explicit dates per request. Batch a longer offline
 * history without dropping drafts. Duplicate 31-day history is deduplicated, and
 * any roster/status changes between batches stop the sync before upload.
 */
async function readPendingSnapshots(dates){
  const unique=[...new Set(dates)].sort();
  if(!unique.length)return validatedSnapshot(await readSnapshot([]));
  let combined=null,rosterFingerprint=null;
  const records=new Map();
  // Match the backend's per-roster download budget (max 30,000 exact-date
  // attendance statuses). Large schools use fewer dates per request.
  const rosterSize=Math.max(1,state.data?.roster?.length||1);
  const dateBatchSize=Math.max(1,Math.min(90,Math.floor(30000/rosterSize)));
  for(let index=0;index<unique.length;index+=dateBatchSize){
    const snapshot=validatedSnapshot(await readSnapshot(unique.slice(index,index+dateBatchSize)));
    const normalized=normalizedStudents(snapshot.students).sort((a,b)=>a.id.localeCompare(b.id));
    const fingerprint=JSON.stringify(normalized);
    if(rosterFingerprint!==null&&rosterFingerprint!==fingerprint)
      throw Error('Student roster changed during offline synchronization. Keep drafts; refresh and try again.');
    if(rosterFingerprint===null){combined=snapshot;rosterFingerprint=fingerprint;}
    for(const row of snapshot.attendance){
      const date=dateValue(row?.date),studentId=String(row?.studentId||'').trim(),
        enrl=String(row?.enrlNo||'').trim(),attendanceStatus=status(row?.status);
      if(!date||!attendanceStatus)continue;
      const key=date+'|'+(studentId?'id:'+studentId:'enrl:'+enrl);
      const prior=records.get(key);
      if(prior&&prior.status!==attendanceStatus)
        throw Error('Attendance changed while loading offline sync history. Keep drafts and retry.');
      records.set(key,{date,studentId,enrlNo:enrl,status:attendanceStatus});
    }
  }
  return {...combined,attendance:[...records.values()]};
}
const sendBulk=(date,records)=>teacherMode?LamaAPI.teacherOfflineBulkAttendance(date,records):LamaAPI.bulkAttendance(date,records);
const state={data:null,key:null,salt:null,busy:false,autoPaused:false,storeVersion:null,staleVault:false};
const schoolAccount=LamaAPI.getSession('school'),teacherAccount=LamaAPI.getSession('teacher');
if(schoolAccount&&teacherAccount){
 const chooser=$('roleSwitch');chooser.hidden=false;
 $('adminOfflineLink').textContent='School Admin: '+String(schoolAccount.name||'School');
 $('teacherOfflineLink').textContent='Class Teacher: '+String(teacherAccount.schoolName||'School');
 const current=teacherMode?$('teacherOfflineLink'):$('adminOfflineLink');
 current.style.background='#0b626d';current.style.color='#fff';
}
const text=(id,message,error=false)=>{const node=$(id);node.textContent=message;node.classList.toggle('error',!!error);};
const status=x=>{const v=String(x||'').toLowerCase();return v==='present'||v==='p'?'Present':v==='absent'||v==='a'?'Absent':v==='leave'||v==='l'?'Leave':'';};
const dateValue=v=>{const m=String(v||'').match(/^(\d{4}-\d{2}-\d{2})/);return m?m[1]:'';};
const keyFor=(date,studentId)=>date+'|'+studentId;
const currentDate=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const validDate=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v;};
function authorizedWriter(){
  if(teacherMode)return !!(schoolId&&accountId&&session?.apiKey);
  try{const a=JSON.parse(sessionStorage.getItem('lama_school_admin_auth')||'null');
    return !!(a&&a.token&&schoolId&&String(a.schoolId)===schoolId);}
  catch(_){return false;}
}
function online(){return navigator.onLine===true;}
function b64(bytes){
  const a=new Uint8Array(bytes);let out='';
  for(let i=0;i<a.length;i+=16384)out+=String.fromCharCode(...a.subarray(i,i+16384));
  return btoa(out);
}
function unb64(value){const s=atob(value);const out=new Uint8Array(s.length);for(let i=0;i<s.length;i++)out[i]=s.charCodeAt(i);return out;}
function database(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('lama-school-offline-v1',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('vaults',{keyPath:'schoolId'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||Error('Could not open local storage'));
  });
}
async function dbRequest(mode,method,arg){
  const db=await database();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('vaults',mode),store=tx.objectStore('vaults');
    const req=method==='get'?store.get(arg):store.put(arg);let result;
    req.onsuccess=()=>{result=req.result;};
    tx.oncomplete=()=>{db.close();resolve(result);};
    tx.onerror=()=>{db.close();reject(tx.error||Error('Local storage failed'));};
    tx.onabort=()=>{db.close();reject(tx.error||Error('Local storage cancelled'));};
  });
}
const readVault=()=>dbRequest('readonly','get',vaultId);
/**
 * IndexedDB compare-and-set in one readwrite transaction. If the same account
 * is opened in two tabs, the second tab cannot overwrite changes saved first.
 */
async function saveVaultCas(record,expectedCiphertext){
  const db=await database();
  return new Promise((resolve,reject)=>{
    let stale=false,finished=false;
    const tx=db.transaction('vaults','readwrite'),store=tx.objectStore('vaults');
    const current=store.get(vaultId);
    current.onsuccess=()=>{
      const actual=current.result?.ciphertext||null;
      if(actual!==expectedCiphertext){stale=true;tx.abort();return;}
      store.put(record);
    };
    tx.oncomplete=()=>{finished=true;db.close();resolve(record.ciphertext);};
    tx.onabort=()=>{
      if(finished)return;
      finished=true;db.close();
      reject(stale?Error('OFFLINE_VAULT_CHANGED: Another tab changed this school register. Lock and unlock to reload it; no newer records were overwritten.'):
        (tx.error||Error('Could not save local school records')));
    };
    tx.onerror=()=>{};
  });
}
async function derive(password,salt){
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function writeVault(){
  if(!state.data||!state.key||!state.salt)throw Error('Offline records are locked');
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const bytes=new TextEncoder().encode(JSON.stringify(state.data));
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},state.key,bytes);
  const record={schoolId:vaultId,version:1,salt:b64(state.salt),iv:b64(iv),
    ciphertext:b64(ciphertext),savedAt:new Date().toISOString()};
  try{state.storeVersion=await saveVaultCas(record,state.storeVersion);}
  catch(error){
    if(String(error.message||'').startsWith('OFFLINE_VAULT_CHANGED:'))state.staleVault=true;
    throw error;
  }
}
function passphrase(){
  const value=$('offlinePass').value;
  if(value.length<12)throw Error('Use an offline device password of at least 12 characters');
  return value;
}
function normalizedStudents(rows){
  if(!Array.isArray(rows))throw Error('Invalid student roster received');
  const ids=new Set();
  if(rows.some(r=>!r||!String(r.id||'').trim()))
    throw Error('Some student records have no unique ID. Repair these online before preparing offline attendance.');
  return rows.map(r=>{
    const id=String(r.id).trim();
    if(!id||ids.has(id))throw Error('Duplicate or invalid student ID');
    ids.add(id);
    return {id,name:String(r.name||'Unnamed student').slice(0,120),enrlNo:String(r.enrlNo||'').trim(),
      className:String(r.class||r.grade||'Unassigned').trim()||'Unassigned',section:String(r.section||'').trim()};
  });
}
function historyIndex(rows,roster){
  if(!Array.isArray(rows))throw Error('Invalid attendance history received');
  const ids=new Set(roster.map(s=>s.id)),enr=new Map();
  roster.forEach(s=>{if(s.enrlNo){if(enr.has(s.enrlNo))enr.set(s.enrlNo,null);else enr.set(s.enrlNo,s.id);}});
  const out={};
  for(const r of rows){
    const date=dateValue(r?.date),v=status(r?.status);
    const sid=String(r?.studentId||'').trim();
    const studentId=ids.has(sid)?sid:(!sid?enr.get(String(r?.enrlNo||'').trim()):null);
    if(!date||!v||!studentId)continue;
    const k=keyFor(date,studentId);
    if(out[k]&&out[k]!==v)throw Error('Conflicting saved attendance rows for '+date);
    out[k]=v;
  }
  return out;
}
function validateVaultData(data){
  if(!data||data.schoolId!==schoolId||data.accountScope!==vaultId||
    !Array.isArray(data.roster)||!Array.isArray(data.drafts)||
    !data.history||typeof data.history!=='object'||Array.isArray(data.history)||
    data.roster.length>5000||data.drafts.length>75000)
    throw Error('Invalid or different-school offline vault');
  const ids=new Set();
  for(const student of data.roster){
    const id=String(student?.id||'');
    if(!id||ids.has(id))throw Error('Offline vault has missing or duplicate student IDs');
    ids.add(id);
  }
  for(const draft of data.drafts){
    if(!ids.has(String(draft?.studentId||''))||!validDate(draft.date)||
      !['Present','Absent','Leave'].includes(draft.status)||
      !['','Present','Absent','Leave'].includes(draft.baseStatus))
      throw Error('Offline vault has invalid pending attendance');
  }
  return data;
}
function sameStudentId(a,b){return String(a.id)===String(b.id)&&String(a.enrlNo||'')===String(b.enrlNo||'');}
function baseline(student,date){return state.data.history[keyFor(date,student.id)]||'';}
function draftFor(student,date){return state.data.drafts.find(d=>d.date===date&&d.studentId===student.id);}
function chosen(student,date){return draftFor(student,date)?.status||baseline(student,date);}
function refreshConnectivity(){text('onlineFlag',online()?'● Internet appears available':'● Offline — data will stay on this phone');}
function render(){
  const unlocked=!!state.data,ready=unlocked&&!state.busy&&!state.staleVault;
  $('prepare').disabled=state.busy||state.staleVault||!online();
  $('unlock').disabled=state.busy;
  $('lock').disabled=!unlocked||state.busy;
  $('backup').disabled=!ready;
  $('bulkPresent').disabled=!ready||!validDate($('attDate').value);
  $('sync').disabled=!ready||!online()||!state.data.drafts.length;
  $('refresh').disabled=!ready||!online()||!!state.data.drafts.length;
  const root=$('students');root.replaceChildren();
  if(!unlocked){$('rosterInfo').textContent='Unlock the school vault or prepare it while online.';$('queueInfo').textContent='Local records are locked.';return;}
  const date=$('attDate').value;
  const klass=$('attClass').value,query=$('attSearch').value.trim().toLowerCase();
  const shown=state.data.roster.filter(s=>(!klass||s.className===klass)&&(!query||(s.name+' '+s.enrlNo).toLowerCase().includes(query)));
  const rows=shown.slice(0,200);
  $('rosterInfo').textContent=rows.length+' shown of '+shown.length+' matching students. Prepared: '+new Date(state.data.preparedAt).toLocaleString()+' (select a class for larger schools).';
  $('queueInfo').textContent=state.data.drafts.length+' attendance changes stored on this device, awaiting server verification.';
  for(const student of rows){
    const row=document.createElement('div');row.className='student';
    const draft=draftFor(student,date);row.dataset.pending=draft?'true':'false';
    const info=document.createElement('div'),name=document.createElement('div'),small=document.createElement('small');
    name.className='name';name.textContent=student.name;
    small.textContent='Class '+student.className+(student.section?' / '+student.section:'')+' • '+(student.enrlNo||student.id)+(draft?' • PENDING SYNC':'');
    info.append(name,small);
    const group=document.createElement('div');group.className='choices';
    for(const choice of ['Present','Absent','Leave']){
      const button=document.createElement('button');button.type='button';button.dataset.value=choice;
      button.dataset.selected=String(chosen(student,date)===choice);button.textContent=choice;button.disabled=!ready;
      button.onclick=()=>setChoice(student,date,choice);group.append(button);
    }
    if(draft){
      const discard=document.createElement('button');discard.type='button';
      discard.textContent='Discard local draft';discard.disabled=!ready;
      discard.style.background='#fff1f2';discard.style.color='#9d1f31';
      discard.onclick=()=>discardLocal(student,date);
      group.append(discard);
    }
    row.append(info,group);root.append(row);
  }
}
function renderClassList(){
  const select=$('attClass'),before=select.value;
  select.replaceChildren(new Option('All classes',''));
  const classes=[...new Set(state.data.roster.map(s=>s.className))].sort();
  classes.forEach(name=>select.add(new Option(name,name)));
  select.value=classes.includes(before)?before:'';
}
async function markVisiblePresent(){
  if(state.busy||state.staleVault||!state.data)return;
  const date=$('attDate').value;
  if(!validDate(date)){text('actionStatus','Choose a valid attendance date.',true);return;}
  const klass=$('attClass').value,query=$('attSearch').value.trim().toLowerCase();
  const visible=state.data.roster.filter(s=>(!klass||s.className===klass)&&
    (!query||(s.name+' '+s.enrlNo).toLowerCase().includes(query)));
  if(visible.length>200){
    text('actionStatus','This view includes more than 200 students. Choose a single class or search before marking.',true);
    return;
  }
  const unmarked=visible.filter(s=>!chosen(s,date));
  if(!unmarked.length){text('actionStatus','All visible students already have an attendance status.');return;}
  if(!confirm('Mark '+unmarked.length+' visible, unmarked students Present for '+date+
    '? Existing Absent, Leave, Present and pending choices will not be changed.'))return;
  state.busy=true;
  const previous=state.data.drafts.slice();
  try{
    for(const student of unmarked){
      const key=keyFor(date,student.id);
      state.data.drafts=state.data.drafts.filter(d=>keyFor(d.date,d.studentId)!==key);
      state.data.drafts.push({id:crypto.randomUUID(),studentId:student.id,date,status:'Present',
        baseStatus:baseline(student,date),savedAt:new Date().toISOString()});
    }
    await writeVault();
    text('actionStatus','✓ '+unmarked.length+' Present marks saved securely on this device. Synchronize when online.');
  }catch(error){
    state.data.drafts=previous;
    text('actionStatus','Bulk local save failed: '+error.message,true);
  }finally{state.busy=false;render();}
}
async function discardLocal(student,date){
  if(state.busy||state.staleVault||!state.data||!draftFor(student,date))return;
  if(!confirm('Discard this unsynchronized attendance change for '+student.name+' on '+date+'? This cannot be undone. The server record will not be changed.'))return;
  state.busy=true;const old=state.data.drafts.slice();
  try{
    state.data.drafts=old.filter(d=>!(d.date===date&&d.studentId===student.id));
    await writeVault();
    text('actionStatus','Local draft discarded. Refresh server records when pending changes reach zero.');
  }catch(error){state.data.drafts=old;text('actionStatus','Could not discard draft: '+error.message,true);}
  finally{state.busy=false;render();}
}
async function setChoice(student,date,value){
  if(state.busy||state.staleVault||!state.data)return;
  if(!validDate(date)){text('actionStatus','Choose a valid attendance date.',true);return;}
  state.busy=true;
  const old=state.data.drafts.slice(),k=keyFor(date,student.id),base=baseline(student,date);
  try{
    state.data.drafts=old.filter(d=>keyFor(d.date,d.studentId)!==k);
    if(value!==base)state.data.drafts.push({id:crypto.randomUUID(),studentId:student.id,date,status:value,baseStatus:base,savedAt:new Date().toISOString()});
    await writeVault();
    text('actionStatus','✓ Encrypted local change saved. Not yet synchronized to the school database.');
  }catch(error){state.data.drafts=old;text('actionStatus','Local save failed: '+error.message,true);}
  finally{state.busy=false;render();}
}
async function prepare(){
  if(state.busy)return;
  state.busy=true;render();
  try{
    if(!online()||!authorizedWriter())throw Error('Internet and an active verified School Admin or Teacher session are required to prepare records.');
    const password=passphrase(),existing=await readVault();
    if(existing&&!state.data)throw Error('This device already has protected school records. Unlock them first.');
    if(state.data?.drafts?.length)throw Error('Synchronize pending attendance before refreshing the offline roster.');
    text('actionStatus','Downloading school roster and attendance…');
    const snapshot=validatedSnapshot(await readSnapshot([]));
    const {students,attendance}=snapshot;
    const roster=normalizedStudents(students),history=historyIndex(attendance,roster);
    if(roster.length>5000)throw Error('Roster exceeds offline device safety limit (5,000).');
    if(!roster.length)throw Error('The server returned an empty student roster. Offline attendance was not prepared.');
    const salt=existing?unb64(existing.salt):crypto.getRandomValues(new Uint8Array(16));
    const key=await derive(password,salt);
    if(existing){
      // Reject accidental overwrite using the wrong passphrase.
      await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(existing.iv)},key,unb64(existing.ciphertext));
    }
    const prior={...state};
    state.storeVersion=existing?.ciphertext||null;
    state.data={schoolId,accountScope:vaultId,roster,history,drafts:[],preparedAt:new Date().toISOString()};
    state.salt=salt;state.key=key;
    try{await writeVault();}catch(error){const stale=state.staleVault;Object.assign(state,prior);if(stale)state.staleVault=true;throw error;}
    $('offlinePass').value='';
    renderClassList();
    if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
    text('status','Ready offline — '+roster.length+' students saved securely. Password required each time the app is reopened.');
    text('actionStatus','✓ Offline records prepared. You may disconnect from the internet.');
  }catch(error){text('actionStatus','Preparation failed: '+error.message,true);}
  finally{state.busy=false;render();}
}
async function unlock(){
  if(state.busy)return;state.busy=true;render();
  try{
    const stored=await readVault();if(!stored)throw Error('No offline records on this device. Prepare while online first.');
    const key=await derive(passphrase(),unb64(stored.salt));
    let data;
    try{const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(stored.iv)},key,unb64(stored.ciphertext));
      data=JSON.parse(new TextDecoder().decode(bytes));}
    catch(_){throw Error('Wrong offline password, or corrupted local records. No changes were made.');}
    validateVaultData(data);
    state.data=data;state.key=key;state.salt=unb64(stored.salt);
    state.storeVersion=stored.ciphertext;state.staleVault=false;
    $('offlinePass').value='';renderClassList();
    text('status','School records unlocked. '+data.drafts.length+' pending changes.');
    text('actionStatus','Offline records are ready. Sync requires internet and an authorized School Admin or Teacher session.');
  }catch(error){text('actionStatus','Unlock failed: '+error.message,true);}
  finally{state.busy=false;render();}
}
async function sync(automatic=false){
  if(state.busy||state.staleVault||!state.data||!state.data.drafts.length||!online()||state.autoPaused&&automatic)return;
  state.busy=true;render();
  try{
    if(!authorizedWriter())throw Error('An active verified School Admin or Teacher login is required before synchronizing.');
    text('actionStatus','Checking cloud records for changes before uploading…');
    const snapshot=await readPendingSnapshots(state.data.drafts.map(d=>d.date));
    const {students,attendance}=snapshot;
    const serverRoster=normalizedStudents(students),serverIds=new Map(serverRoster.map(s=>[s.id,s]));
    const localIds=new Map(state.data.roster.map(s=>[s.id,s]));
    let cloud=historyIndex(attendance,serverRoster);
    let verified=0,conflicts=0,uncertain=0;
    const byDate=new Map();
    for(const draft of state.data.drafts){
      const original=localIds.get(draft.studentId),current=serverIds.get(draft.studentId);
      if(!original||!current||!sameStudentId(original,current)){conflicts++;continue;}
      const serverStatus=cloud[keyFor(draft.date,draft.studentId)]||'';
      if(serverStatus===draft.status){state.data.history[keyFor(draft.date,draft.studentId)]=draft.status;draft.verified=true;verified++;continue;}
      if(serverStatus!==draft.baseStatus){conflicts++;continue;}
      if(!byDate.has(draft.date))byDate.set(draft.date,[]);
      byDate.get(draft.date).push(draft);
    }
    state.data.drafts=state.data.drafts.filter(d=>!d.verified);
    await writeVault(); // Preserves all unverified records before any network write.
    // Backend rejects batches larger than 1,500. Keep each write small for
    // rural/mobile connections. Stop the remaining batches if ANY write cannot
    // be independently verified; never blindly replay a timed-out write.
    for(const [date,drafts] of byDate){
      for(let start=0;start<drafts.length;start+=500){
        const batch=drafts.slice(start,start+500);
        const records=batch.map(d=>{
          const student=serverIds.get(d.studentId);
          return {date,studentId:student.id,enrlNo:student.enrlNo,class:student.className,
            status:d.status,baseStatus:d.baseStatus};
        });
        let responseOk=false,unverifiedBatch=0;
        try{
          const result=await sendBulk(date,records);
          responseOk=Number(result?.saved)===records.length&&
            Number(result?.inserted||0)+Number(result?.updated||0)===records.length;
        }catch(_){/* Uncertain server state: read back, do not blindly retry. */}
        try{
          const latest=validatedSnapshot(await readSnapshot([date]));
          cloud=historyIndex(latest.attendance,serverRoster);
          for(const draft of batch){
            const k=keyFor(draft.date,draft.studentId);
            if(cloud[k]===draft.status){draft.verified=true;state.data.history[k]=draft.status;verified++;}
            else{unverifiedBatch++;}
          }
        }catch(_){unverifiedBatch=batch.length;}
        uncertain+=unverifiedBatch;
        state.data.drafts=state.data.drafts.filter(d=>!d.verified);
        await writeVault();
        if(!responseOk||unverifiedBatch){
          state.autoPaused=true;
          break;
        }
      }
      if(state.autoPaused)break;
    }
    text('actionStatus',verified+' records verified in cloud. '+conflicts+' conflicts, '+uncertain+
      ' unverified. Pending records remain encrypted on this device.'+
      ((conflicts||uncertain)?' Inspect server records before attempting another sync.':''),!!(conflicts||uncertain));
    if(!state.data.drafts.length)text('status','All offline attendance changes synchronized and verified.');
  }catch(error){state.autoPaused=true;text('actionStatus','Sync not confirmed: '+error.message+'. Drafts remain on this device. Do not delete app data.',true);}
  finally{state.busy=false;render();}
}
async function downloadEncryptedBackup(){
  if(state.busy||state.staleVault||!state.data)return;
  state.busy=true;render();
  try{
    const vault=await readVault();
    if(!vault||vault.schoolId!==vaultId)throw Error('No saved encrypted vault found');
    const backup={format:'lama-offline-attendance-backup',version:1,createdAt:new Date().toISOString(),
      schoolId:vaultId,payload:vault};
    const blob=new Blob([JSON.stringify(backup)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='lama-offline-'+schoolId+'-'+
      (teacherMode?'teacher-'+accountId:'school-admin')+'-'+currentDate()+'.json';
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    text('actionStatus','Encrypted backup created. Store the file safely with the separate offline password.');
  }catch(e){text('actionStatus','Backup failed: '+e.message,true);}
  finally{state.busy=false;render();}
}
async function restoreEncryptedBackup(){
  if(state.busy)return;
  const file=$('backupFile').files?.[0];
  if(!file){text('actionStatus','Choose your earlier encrypted backup file.',true);return;}
  if(file.size>5*1024*1024){text('actionStatus','Backup file is too large (maximum 5 MB).',true);return;}
  state.busy=true;render();
  try{
    if(!schoolId||!vaultId.startsWith(schoolId+'#'))
      throw Error('Sign in to the correct school account first');
    if(await readVault())throw Error('This device already has a school vault. Restore is blocked to protect existing or unsynced records.');
    const password=passphrase();
    const fileText=await file.text();if(fileText.length>7*1024*1024)throw Error('Invalid backup size');
    let backup;try{backup=JSON.parse(fileText);}catch(_){throw Error('Not a valid backup JSON file');}
    const payload=backup?.payload;
    if(backup?.format!=='lama-offline-attendance-backup'||backup?.version!==1||
      backup?.schoolId!==vaultId||!payload||payload.version!==1||payload.schoolId!==vaultId)
      throw Error('Backup belongs to a different school, user role or unsupported format');
    if(!['salt','iv','ciphertext'].every(k=>typeof payload[k]==='string'&&
      payload[k].length>0&&payload[k].length<7*1024*1024))
      throw Error('Backup has invalid encryption fields');
    const salt=unb64(payload.salt),iv=unb64(payload.iv),cipher=unb64(payload.ciphertext);
    if(salt.byteLength!==16||iv.byteLength!==12||!cipher.byteLength)
      throw Error('Invalid encrypted backup parameters');
    const key=await derive(password,salt);
    let data;
    try{
      const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,cipher);
      data=JSON.parse(new TextDecoder().decode(bytes));
    }catch(_){throw Error('Incorrect offline password or damaged encrypted backup');}
    validateVaultData(data);
    const stored={schoolId:vaultId,version:1,salt:payload.salt,iv:payload.iv,
      ciphertext:payload.ciphertext,savedAt:new Date().toISOString()};
    // Restore must be compare-and-set too; otherwise a second tab could
    // create a vault after the initial absence check and be overwritten.
    // Remember restored ciphertext as the version for the next local edit.
    const storedVersion=await saveVaultCas(stored,null);
    state.data=data;state.key=key;state.salt=salt;state.autoPaused=true;
    state.storeVersion=storedVersion;state.staleVault=false;
    $('offlinePass').value='';$('backupFile').value='';
    renderClassList();
    text('status','Restored protected school records. '+data.drafts.length+' unsynchronized changes remain.');
    text('actionStatus','✓ Encrypted backup restored. Review drafts, then use Sync Now online to check server conflicts.');
  }catch(e){text('actionStatus','Restore failed: '+e.message,true);}
  finally{state.busy=false;render();}
}
function lock(){
  if(state.busy)return;
  state.key=null;state.salt=null;state.data=null;state.storeVersion=null;state.staleVault=false;
  $('offlinePass').value='';$('students').replaceChildren();
  text('status','Locked. Offline attendance remains encrypted on this device.');
  text('actionStatus','');render();
}
$('attDate').value=currentDate();
if(session?.name||session?.schoolName)$('schoolName').textContent=(session.schoolName||session.name)+' • '+(teacherMode?'Teacher offline register':'School Admin offline register');
$('prepare').onclick=prepare;$('unlock').onclick=unlock;$('lock').onclick=lock;
$('sync').onclick=()=>{state.autoPaused=false;return sync(false);};
$('backup').onclick=downloadEncryptedBackup;
$('restoreBackup').onclick=restoreEncryptedBackup;
$('bulkPresent').onclick=markVisiblePresent;
$('refresh').onclick=prepare;
$('attDate').onchange=render;$('attClass').onchange=render;$('attSearch').oninput=render;
addEventListener('online',()=>{refreshConnectivity();if(state.data&&authorizedWriter())sync(true);render();});
addEventListener('offline',()=>{refreshConnectivity();render();});
refreshConnectivity();
if('serviceWorker' in navigator)navigator.serviceWorker.register('../sw.js',{scope:'../'}).catch(()=>{});
if(!schoolId)text('status','Please sign in as your School Administrator or assigned Teacher on this device before preparing offline attendance.',true);
else if(!isSecureContext||!crypto?.subtle||!('indexedDB'in window))
  text('status','This browser does not support secure offline storage. Use recent Chrome on HTTPS.',true);
else readVault().then(v=>text('status',v?'Existing encrypted school records found. Enter your offline password and Unlock.':'No offline records saved. Sign in as School Admin or Teacher and Prepare while connected.')).catch(e=>text('status',e.message,true));
render();
})();
