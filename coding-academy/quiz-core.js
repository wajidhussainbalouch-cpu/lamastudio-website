/* LAMA original question practice: pure, browser-independent learning helpers.
 * No code execution. No third-party requests, profile data or login required.
 */
(function(root){
"use strict";
const KEY="lama-coding-questions-v1",LIMIT=400000,SET_SIZE=10;
function safeNumber(n){return Number.isInteger(n)&&n>=0&&n<=10000?n:0;}
function createState(){return {stats:{},rounds:{},history:[],selection:{track:"mixed",level:1}};}
function validateState(value,catalog){
 const fresh=createState();
 if(!value||typeof value!=="object"||Array.isArray(value))return fresh;
 const idSet=new Set(catalog.items.map(q=>q.id));
 if(value.stats&&typeof value.stats==="object"&&!Array.isArray(value.stats)){
  for(const [id,item] of Object.entries(value.stats).slice(0,200)){
   if(!idSet.has(id)||!item||typeof item!=="object")continue;
   const attempts=safeNumber(item.attempts),correct=Math.min(attempts,safeNumber(item.correct));
   fresh.stats[id]={attempts,correct,lastCorrect:typeof item.lastCorrect==="boolean"?item.lastCorrect:(attempts>0&&attempts===correct)};
  }
 }
 if(value.rounds&&typeof value.rounds==="object"&&!Array.isArray(value.rounds)){
  for(const [k,v] of Object.entries(value.rounds).slice(0,40)){
   if(/^(mixed|html|css|javascript|python|sql)-[123]$/.test(k))fresh.rounds[k]=safeNumber(v);
  }
 }
 if(value.selection&&typeof value.selection==="object"){
  const validTracks=new Set(["mixed",...catalog.tracks.map(x=>x.id)]);
  if(validTracks.has(value.selection.track))fresh.selection.track=value.selection.track;
  if([1,2,3].includes(value.selection.level))fresh.selection.level=value.selection.level;
 }
 if(Array.isArray(value.history)){
  fresh.history=value.history.filter(h=>h&&typeof h==="object"&&Number.isInteger(h.score)&&h.score>=0&&h.score<=SET_SIZE
    &&typeof h.track==="string"&&Number.isInteger(h.level)&&[1,2,3].includes(h.level))
   .slice(-20).map(h=>({track:String(h.track).slice(0,20),level:h.level,score:h.score}));
 }
 return fresh;
}
function load(storage,catalog){
 try{
  const raw=storage.getItem(KEY);
  if(!raw||raw.length>LIMIT)return createState();
  return validateState(JSON.parse(raw),catalog);
 }catch(e){return createState();}
}
function save(storage,state){
 try{storage.setItem(KEY,JSON.stringify(state));return true;}catch(e){return false;}
}
function available(catalog,track,level){
 if(!["mixed",...catalog.tracks.map(t=>t.id)].includes(track)||![1,2,3].includes(level))return [];
 return catalog.items.filter(q=>q.level===level&&(track==="mixed"||q.track===track));
}
function pick(catalog,state,track,level,review=false){
 let pool=available(catalog,track,level);
 const k=track+"-"+level,round=safeNumber(state.rounds[k]||0);
 const failures=q=>{const s=state.stats[q.id];return s&&s.attempts>0&&s.lastCorrect!==true?1:0;};
 const attempts=q=>state.stats[q.id]?.attempts||0;
 // Real review: missed items first. When there are fewer than ten,
 // fill from the normal pool to keep each mini-session a useful ten.
 const missed=review?pool.filter(q=>failures(q)>0):[];
 function cyclicIndex(item){let n=0;for(const ch of item.id)n=(n*33+ch.charCodeAt(0))%997;return (n+round*17)%997;}
 const order=(a,b)=>{
  const aSeen=attempts(a),bSeen=attempts(b);
  return aSeen-bSeen || failures(b)-failures(a) || cyclicIndex(a)-cyclicIndex(b) || a.id.localeCompare(b.id);
 };
 const priority=missed.sort((a,b)=>failures(b)-failures(a)||order(a,b));
 if(track!=="mixed"){
  const chosen=priority.slice(0,SET_SIZE),taken=new Set(chosen.map(x=>x.id));
  for(const q of pool.filter(x=>!taken.has(x.id)).sort(order)){
   if(chosen.length>=SET_SIZE)break;
   chosen.push(q);
  }
  return chosen;
 }
 // A mixed ten-question round should teach *all five* subjects, not
 // accidentally group ten HTML or SQL questions because of ID sort order.
 const languages=catalog.tracks.map(t=>t.id);
 const chosen=[],taken=new Set();
 function fillRoundRobin(remaining){
  const buckets=new Map(languages.map(id=>[id,remaining.filter(q=>q.track===id).sort(order)]));
  while(chosen.length<SET_SIZE){
   let added=0;
   for(const id of languages){
    const bucket=buckets.get(id);
    while(bucket.length&&taken.has(bucket[0].id))bucket.shift();
    if(!bucket.length)continue;
    const q=bucket.shift();
    chosen.push(q);taken.add(q.id);added++;
    if(chosen.length===SET_SIZE)break;
   }
   if(!added)break;
  }
 }
 if(review)fillRoundRobin(priority);
 if(chosen.length<SET_SIZE)fillRoundRobin(pool);
 return chosen;
}
function check(question,choice){
 if(question.mode==="build"){
  if(!Array.isArray(choice))return false;
  return choice.length===question.answer.length&&choice.every((x,i)=>x===question.answer[i]);
 }
 return Number.isInteger(choice)&&choice===question.answer;
}
function tokenOrder(question,session=0){
 // Deterministic, session-varied Fisher-Yates shuffle. Each tile keeps its
 // original data-token index so answer checking is unchanged.
 if(question.mode!=="build")return [];
 let seed=2166136261;
 for(const ch of question.id+":"+String(session))seed=Math.imul(seed^ch.charCodeAt(0),16777619)>>>0;
 const order=Array.from({length:question.parts.length},(_,i)=>i);
 for(let i=order.length-1;i>0;i--){
   seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;seed>>>=0;
   const j=seed%(i+1),tmp=order[i];order[i]=order[j];order[j]=tmp;
 }
 if(question.answer.length>1&&question.answer.every((index,i)=>order[i]===index)){
   const tmp=order[0];order[0]=order[1];order[1]=tmp;
 }
 return order;
}
function solution(question){
 if(question.mode==="build")return question.answer.map(i=>question.parts[i]).join(" ");
 return question.options[question.answer];
}
function record(state,question,isCorrect){
 const old=state.stats[question.id]||{attempts:0,correct:0};
 old.attempts=Math.min(10000,old.attempts+1);
 old.lastCorrect=Boolean(isCorrect);
 if(isCorrect)old.correct=Math.min(old.attempts,old.correct+1);
 state.stats[question.id]=old;
}
function totals(catalog,state){
 let answered=0,correct=0,missed=0;
 for(const q of catalog.items){
  const item=state.stats[q.id];
  if(item){
   answered+=item.attempts;
   correct+=item.correct;
   if(item.attempts>0&&item.lastCorrect!==true)missed++;
  }
 }
 return {answered,correct,missed,learned:Object.keys(state.stats).filter(x=>state.stats[x]?.correct>0).length};
}
root.LAMA_QUESTION_CORE=Object.freeze({KEY,createState,validateState,load,save,available,pick,check,tokenOrder,solution,record,totals,SET_SIZE});
})(typeof window!=="undefined"?window:globalThis);
