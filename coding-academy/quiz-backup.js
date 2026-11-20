/* Independent, privacy-conscious question practice backup format.
 * No network, user account, arbitrary JSON evaluation, or other academy modules.
 */
(function(root){
"use strict";
const FORMAT="lama-coding-questions-backup-v1",VERSION=1,MAX_BYTES=200000;
const allowedTracks=new Set(["mixed","html","css","javascript","python","sql"]);
function fail(message){throw new Error(message);}
function plain(value){return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function integer(value,min,max){return Number.isSafeInteger(value)&&value>=min&&value<=max;}
function ensureExactKeys(value,allowed,label){
 for(const key of Object.keys(value))if(!allowed.includes(key))fail("Unexpected "+label+" field: "+key);
}
function strictState(candidate,catalog){
 if(!plain(candidate))fail("Question progress is not a valid object.");
 ensureExactKeys(candidate,["stats","rounds","history","selection"],"progress");
 if(!plain(candidate.stats)||!plain(candidate.rounds)||!Array.isArray(candidate.history)||!plain(candidate.selection))
   fail("Progress must include stats, rounds, history and selection.");
 const validIds=new Set(catalog.items.map(q=>q.id));
 const stats=Object.create(null),entries=Object.entries(candidate.stats);
 if(entries.length>catalog.items.length)fail("The backup has more question records than the question bank.");
 for(const [id,row] of entries){
  if(!validIds.has(id))fail("The backup refers to an unknown question: "+id);
  if(!plain(row))fail("Invalid score entry for "+id);
  ensureExactKeys(row,["attempts","correct","lastCorrect"],"score");
  if(!integer(row.attempts,0,10000)||!integer(row.correct,0,row.attempts))
    fail("Invalid attempt/correct counters for "+id);
  if(row.lastCorrect!==undefined&&typeof row.lastCorrect!=="boolean")
    fail("Invalid last-answer status for "+id);
  stats[id]={attempts:row.attempts,correct:row.correct,
   lastCorrect:row.lastCorrect===undefined
     ?row.attempts>0&&row.attempts===row.correct:row.lastCorrect};
 }
 const rounds=Object.create(null);
 if(Object.keys(candidate.rounds).length>18)fail("Too many practice-round counters.");
 for(const [key,value] of Object.entries(candidate.rounds)){
  if(!/^(mixed|html|css|javascript|python|sql)-[123]$/.test(key)||!integer(value,0,10000))
    fail("Invalid round counter for "+key);
  rounds[key]=value;
 }
 if(candidate.history.length>20)fail("Too many saved round results.");
 const history=candidate.history.map((row,i)=>{
  if(!plain(row))fail("Invalid history entry "+(i+1));
  ensureExactKeys(row,["track","level","score"],"history");
  if(!allowedTracks.has(row.track)||!integer(row.level,1,3)||!integer(row.score,0,10))
    fail("Invalid history values in entry "+(i+1));
  return {track:row.track,level:row.level,score:row.score};
 });
 ensureExactKeys(candidate.selection,["track","level"],"selection");
 if(!allowedTracks.has(candidate.selection.track)||!integer(candidate.selection.level,1,3))
   fail("Invalid chosen language or level.");
 return {stats,rounds,history,
   selection:{track:candidate.selection.track,level:candidate.selection.level}};
}
function textBytes(text){
 return typeof TextEncoder!=="undefined"?new TextEncoder().encode(text).length
   :unescape(encodeURIComponent(text)).length;
}
function exportData(storage,catalog){
 const raw=storage.getItem("lama-coding-questions-v1");
 let local;
 if(raw===null)local={stats:{},rounds:{},history:[],selection:{track:"mixed",level:1}};
 else{
  if(textBytes(raw)>MAX_BYTES)fail("Saved practice data exceeds the 200 KB safety limit.");
  try{local=JSON.parse(raw);}catch(e){fail("Saved question scores are unreadable; exporting them as empty would risk losing your results.");}
 }
 const state=strictState(local,catalog);
 const object={format:FORMAT,version:VERSION,bankVersion:catalog.version,
  createdAt:new Date().toISOString(),state};
 const json=JSON.stringify(object,null,2);
 if(textBytes(json)>MAX_BYTES)fail("This backup would be too large to restore.");
 return json;
}
function importData(json,catalog){
 if(typeof json!=="string"||textBytes(json)>MAX_BYTES)fail("Backup is larger than the 200 KB limit.");
 let data;
 try{data=JSON.parse(json);}catch(e){fail("This is not valid JSON.");}
 if(!plain(data))fail("This is not a question practice backup.");
 ensureExactKeys(data,["format","version","bankVersion","createdAt","state"],"backup");
 if(data.format!==FORMAT||data.version!==VERSION)fail("Wrong backup format or version. Choose a LAMA Question Practice backup.");
 if(data.bankVersion!==catalog.version)fail("This backup was made for a different question-bank version.");
 if(typeof data.createdAt!=="string"||!Number.isFinite(Date.parse(data.createdAt))||data.createdAt.length>40)
   fail("Invalid backup date.");
 return {createdAt:data.createdAt,state:strictState(data.state,catalog)};
}
function restore(storage,state){
 const json=JSON.stringify(state);
 if(textBytes(json)>MAX_BYTES)fail("Restored scores would exceed the storage safety limit.");
 // One localStorage key: one atomic write, no writes to any other project.
 storage.setItem("lama-coding-questions-v1",json);
}
root.LAMA_QUIZ_BACKUP=Object.freeze({FORMAT,MAX_BYTES,strictState,exportData,importData,restore,textBytes});
})(typeof window!=="undefined"?window:globalThis);
