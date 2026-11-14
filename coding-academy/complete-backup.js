/* LAMA Coding Academy complete, local-only portable backup.
 * All four existing course modules + independent 150-question practice scores.
 * This does not touch account/session data or other LAMA applications.
 */
(function(root){
"use strict";
const FORMAT="lama-coding-academy-complete-v1",VERSION=1,MAX_BYTES=1100000;
const COURSE_FORMAT="lama-coding-academy-backup-v1";
const QUIZ_KEY="lama-coding-questions-v1";
const knownKeys=["format","version","createdAt","modules","questionBackup"];
function isPlain(x){return x!==null&&typeof x==="object"&&!Array.isArray(x);}
function checkExact(x,keys,label){
 if(!isPlain(x))throw Error(label+" must be an object.");
 const actual=Object.keys(x);
 if(actual.length!==keys.length||actual.some(k=>!keys.includes(k)))
  throw Error("Unsupported fields in "+label+".");
}
function textBytes(str){
 if(typeof TextEncoder!=="undefined")return new TextEncoder().encode(str).length;
 return unescape(encodeURIComponent(str)).length;
}
function create(modules,questionBackupText){
 if(!isPlain(modules))throw Error("Missing validated lesson modules.");
 const questions=JSON.parse(questionBackupText);
 const bundle={format:FORMAT,version:VERSION,createdAt:new Date().toISOString(),
   modules,questionBackup:questions};
 const text=JSON.stringify(bundle,null,2);
 if(textBytes(text)>MAX_BYTES)throw Error("Complete backup exceeds the 1.1 MB size limit.");
 return text;
}
function parse(raw,validateLessons,questionBackup,catalog){
 checkExact(raw,knownKeys,"complete backup");
 if(raw.format!==FORMAT||raw.version!==VERSION)
   throw Error("Wrong complete-backup version. Use a LAMA Coding Academy complete backup.");
 if(typeof raw.createdAt!=="string"||raw.createdAt.length>40||
   !Number.isFinite(Date.parse(raw.createdAt)))
   throw Error("Complete backup has an invalid date.");
 const course=validateLessons({format:COURSE_FORMAT,modules:raw.modules});
 if(!questionBackup||!catalog)throw Error("The question bank backup module is unavailable.");
 // Reuse strict, versioned question backup parsing including the bank version.
 const questions=questionBackup.importData(JSON.stringify(raw.questionBackup),catalog);
 return {modules:course,questions:questions.state,createdAt:raw.createdAt};
}
function parseText(text,validateLessons,questionBackup,catalog){
 if(typeof text!=="string"||textBytes(text)>MAX_BYTES)
   throw Error("Complete backup is larger than 1.1 MB.");
 let data;try{data=JSON.parse(text);}catch(e){throw Error("Backup is not valid JSON.");}
 return parse(data,validateLessons,questionBackup,catalog);
}
function restore(storage,parts,data){
 if(!Array.isArray(parts)||parts.length!==4||!data||!isPlain(data.modules)||
    !isPlain(data.questions))throw Error("Incomplete, unvalidated restoration request.");
 // Serialize everything before starting a write. The caller must parse and
 // validate using parseText(), and confirm with the learner first.
 const writes=parts.map(p=>({
  key:p.storage,value:data.modules[p.key]===null?null:JSON.stringify(data.modules[p.key])
 }));
 writes.push({key:QUIZ_KEY,value:JSON.stringify(data.questions)});
 const previous=writes.map(w=>({key:w.key,value:storage.getItem(w.key)}));
 try{
  for(const w of writes){
   if(w.value===null)storage.removeItem(w.key);
   else storage.setItem(w.key,w.value);
  }
 }catch(error){
  let failed=false;
  for(const entry of previous){
   try{
    if(entry.value===null)storage.removeItem(entry.key);
    else storage.setItem(entry.key,entry.value);
   }catch(e){failed=true;}
  }
  throw Error(failed
   ?"Restore failed. Some records could not be rolled back; recover from your original backup."
   :"Restore failed; the five previous records were returned to their prior values.");
 }
}
root.LAMA_COMPLETE_BACKUP=Object.freeze({FORMAT,MAX_BYTES,QUIZ_KEY,create,parse,parseText,restore,textBytes});
})(typeof window!=="undefined"?window:globalThis);
