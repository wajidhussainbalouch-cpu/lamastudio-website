'use strict';
/** Pure append-only approval audit event builder; persistence and identity are server responsibilities. */
const crypto=require('node:crypto');
const stable=x=>Array.isArray(x)?'['+x.map(stable).join(',')+']':x&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}':JSON.stringify(x);
const hash=x=>crypto.createHash('sha256').update(stable(x)).digest('hex');
function appendApprovalEvent({events,event,expectedSequence}){
 if(!Array.isArray(events)||!event||!Number.isSafeInteger(expectedSequence)||expectedSequence<0)throw Error('Invalid audit inputs');
 if(events.length!==expectedSequence)throw Error('Audit sequence conflict');
 if(!verifyApprovalLedger(events))throw Error('Invalid existing audit chain');
 const required=['schoolId','classId','subjectId','sessionId','snapshotId','actorId','action','at'];
 for(const k of required)if(typeof event[k]!=='string'||!event[k].trim())throw Error('Missing audit field '+k);
 if(!['submitted','approved','rejected','published'].includes(event.action))throw Error('Invalid audit action');
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(event.at)||!Number.isFinite(Date.parse(event.at)))throw Error('Invalid timestamp');
 if(!/^sha256:[a-f0-9]{64}$/.test(event.snapshotId))throw Error('Invalid snapshot ID');
 const scope=['schoolId','classId','subjectId','sessionId'];
 for(const e of events)if(scope.some(k=>e.payload[k]!==event[k]))throw Error('Audit scope mismatch');
 const prior=events.at(-1);
 const priorAction=prior?.payload.action;
 if(event.action==='approved'&&priorAction!=='submitted')throw Error('Approval requires submission');
 if(event.action==='published'&&priorAction!=='approved')throw Error('Publication requires approval');
 if(event.action==='rejected'&&priorAction!=='submitted')throw Error('Rejection requires submission');
 if(prior&&prior.payload.snapshotId!==event.snapshotId)throw Error('Snapshot changed within audit chain');
 if(prior&&event.at<prior.payload.at)throw Error('Audit timestamp regression');
 if(priorAction==='published'||priorAction==='rejected')throw Error('Closed audit chain');
 if(prior&&event.action==='submitted')throw Error('Submission already recorded');
 if(!prior&&event.action!=='submitted')throw Error('First audit event must be submitted');
 const payload=Object.fromEntries(required.map(k=>[k,event[k]]));
 const item={sequence:expectedSequence+1,previousHash:prior?.hash||null,payload};
 item.hash=hash(item);
 return [...events,item];
}
function verifyApprovalLedger(events){
 if(!Array.isArray(events))return false;
 let prev=null,prior=null;
 const required=['schoolId','classId','subjectId','sessionId','snapshotId','actorId','action','at'];
 for(let i=0;i<events.length;i++){
  const e=events[i];
  if(!e||e.sequence!==i+1||e.previousHash!==prev||e.hash!==hash({sequence:e.sequence,previousHash:e.previousHash,payload:e.payload}))return false;
  const p=e.payload;
  if(!p||required.some(k=>typeof p[k]!=='string'||!p[k].trim()))return false;
  if(!['submitted','approved','rejected','published'].includes(p.action)||!/^sha256:[a-f0-9]{64}$/.test(p.snapshotId))return false;
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(p.at)||!Number.isFinite(Date.parse(p.at)))return false;
  if(i===0&&p.action!=='submitted')return false;
  if(prior){
   if(['schoolId','classId','subjectId','sessionId','snapshotId'].some(k=>p[k]!==prior[k]))return false;
   if(p.at<prior.at)return false;
   if(prior.action==='published'||prior.action==='rejected')return false;
   if(p.action==='approved'&&prior.action!=='submitted')return false;
   if(p.action==='published'&&prior.action!=='approved')return false;
   if(p.action==='rejected'&&prior.action!=='submitted')return false;
   if(p.action==='submitted')return false;
  }
  prior=p;
  prev=e.hash;
 }
 return true;
}
module.exports={appendApprovalEvent,verifyApprovalLedger};
