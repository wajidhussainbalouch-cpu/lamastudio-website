/* LAMA Coding Academy — offline original question rounds.
 * 10-question sessions, tap-to-build code, explanations and local missed review.
 */
(function(){
"use strict";
const data=window.LAMA_CODING_QUESTIONS,core=window.LAMA_QUESTION_CORE;
const el=id=>document.getElementById(id);
if(!data||!core){el("storageWarning").textContent="The practice question bank did not load. Reopen this page after the app has finished installing.";return;}
let state=core.load(localStorage,data),round=[],number=0,selected=null,pieces=[],submitted=false,score=0,mode="regular";
const track=el("track"),level=el("level");
track.value=state.selection.track;
level.value=String(state.selection.level);
function persist(){if(!core.save(localStorage,state))el("storageWarning").textContent="Your browser could not save question scores. You can still practice, but results may be lost after closing this app.";}
function stats(){
 const t=core.totals(data,state);
 el("answered").textContent=String(t.answered);
 el("learned").textContent=String(t.learned);
 el("missed").textContent=String(t.missed);
}
function current(){return round[number];}
function button(text,cls,action,index){
 const b=document.createElement("button");
 b.type="button";
 b.className=cls;
 b.textContent=text;
 b.dataset[action]=String(index);
 return b;
}
function selectedOption(index){
 if(submitted)return;
 selected=index;
 for(const b of el("options").querySelectorAll("button"))b.classList.toggle("selected",Number(b.dataset.choice)===index);
 el("check").disabled=false;
}
function refreshBuild(){
 const q=current(),holder=el("sequence"),options=el("options");
 holder.replaceChildren();
 if(!pieces.length){
  const note=document.createElement("span");
  note.className="tiny";note.textContent="Your constructed code appears here.";
  holder.append(note);
 }
 for(let j=0;j<pieces.length;j++){
  const b=button(q.parts[pieces[j]],"token chosen","remove",j);
  b.setAttribute("aria-label","Remove "+q.parts[pieces[j]]+" from my code");
  b.disabled=submitted;
  holder.append(b);
 }
 for(const b of options.querySelectorAll("button")){
  b.disabled=submitted||pieces.includes(Number(b.dataset.token));
 }
 el("check").disabled=submitted||pieces.length===0;
}
function renderQuestion(){
 const q=current();if(!q)return;
 selected=null;pieces=[];submitted=false;
 el("counter").textContent="Question "+(number+1)+" / "+round.length;
 el("subject").textContent=data.tracks.find(t=>t.id===q.track)?.label||q.track;
 el("type").textContent=q.mode==="build"?"Tap to build code":q.mode==="predict"?"Predict what happens":"Choose the correct answer";
 el("bar").style.width=String((number/round.length)*100)+"%";
 el("prompt").textContent=q.prompt;
 // A complete code example gives away the solution to a build puzzle.
 // Reveal it only after the learner submits, while keeping prediction examples visible.
 el("example").hidden=!q.example||q.mode==="build";
 el("example").textContent=q.example||"";
 el("feedback").hidden=true;
 el("feedback").replaceChildren();
 el("check").disabled=true;el("check").hidden=false;
 el("next").hidden=true;
 el("options").replaceChildren();
 const building=q.mode==="build";
 el("build").hidden=!building;
 if(building){
  const session=state.rounds[state.selection.track+"-"+state.selection.level]||0;
  for(const i of core.tokenOrder(q,session)){
   const b=button(q.parts[i],"token","token",i);
   b.setAttribute("aria-label","Add code piece "+q.parts[i]);
   el("options").append(b);
  }
  refreshBuild();
 }else{
  for(let i=0;i<q.options.length;i++){
   const b=button(String.fromCharCode(65+i)+". "+q.options[i],"choice","choice",i);
   b.setAttribute("aria-pressed","false");
   el("options").append(b);
  }
 }
 el("prompt").focus({preventScroll:true});
}
function startRound(review){
 const t=track.value,l=Number(level.value),pool=core.available(data,t,l);
 if(!pool.length){el("storageWarning").textContent="No questions are available for this selection.";return;}
 const failed=pool.filter(q=>state.stats[q.id]?.attempts>0&&state.stats[q.id]?.lastCorrect!==true);
 if(review&&!failed.length){
  el("storageWarning").textContent="No mistakes to review for this language and level. Start a new round or choose Mixed subjects.";
  return;
 }
 mode=review?"review":"regular";
 state.selection={track:t,level:l};
 round=core.pick(data,state,t,l,review);
 if(round.length!==core.SET_SIZE){el("storageWarning").textContent="Unable to start a full round. Try another selection.";return;}
 const key=t+"-"+l;
 state.rounds[key]=Math.min(10000,(state.rounds[key]||0)+1);
 number=0;score=0;selected=null;pieces=[];submitted=false;
 persist();
 el("storageWarning").textContent="";
 el("setup").hidden=true;
 el("finish").hidden=true;
 el("play").hidden=false;
 renderQuestion();
 el("play").scrollIntoView({behavior:"instant",block:"start"});
}
function showAnswer(correct){
 const q=current();
 const panel=el("feedback");
 panel.hidden=false;
 panel.className="feedback "+(correct?"good":"bad");
 const heading=document.createElement("strong");
 heading.textContent=correct?"✓ Correct! You understand this idea.":"Not quite — here is how it works.";
 const explain=document.createElement("p");
 explain.textContent=q.why;
 const solution=document.createElement("p");
 const prefix=document.createElement("b");
 prefix.textContent="Correct answer: ";
 const answer=document.createElement("code");
 answer.textContent=core.solution(q);
 solution.append(prefix,answer);
 panel.append(heading,explain,solution);
}
function checkAnswer(){
 if(submitted)return;
 const q=current(),choice=q.mode==="build"?pieces:selected;
 if(q.mode==="build"&&!pieces.length)return;
 if(q.mode!=="build"&&!Number.isInteger(selected))return;
 const correct=core.check(q,choice);
 core.record(state,q,correct);
 if(correct)score++;
 persist();stats();
 submitted=true;
 el("check").disabled=true;el("check").hidden=true;
 el("next").hidden=false;
 el("next").textContent=number===round.length-1?"Show my results →":"Next question →";
 if(q.mode==="build")refreshBuild();
 else for(const b of el("options").querySelectorAll("button")){
  const i=Number(b.dataset.choice);
  b.disabled=true;
  b.setAttribute("aria-pressed",String(i===selected));
  if(i===q.answer)b.classList.add("correct");
  else if(i===selected&&!correct)b.classList.add("incorrect");
 }
 showAnswer(correct);
 if(q.mode==="build"&&q.example){
   el("example").hidden=false;
   el("example").textContent=q.example;
 }
}
function finish(){
 el("play").hidden=true;el("finish").hidden=false;
 el("bar").style.width="100%";
 el("score").textContent=score+" / "+round.length;
 el("closing").textContent=score===round.length?
   "You answered all ten correctly. Try a new topic or an advanced set.":
   "You learned from "+(round.length-score)+" answer(s) that need another look.";
 state.history.push({track:state.selection.track,level:state.selection.level,score});
 state.history=state.history.slice(-20);
 persist();stats();
 el("finish").scrollIntoView({behavior:"instant",block:"start"});
}
el("start").addEventListener("click",()=>startRound(false));
el("review").addEventListener("click",()=>startRound(true));
el("again").addEventListener("click",()=>{
 el("finish").hidden=true;el("setup").hidden=false;
 el("setup").scrollIntoView({behavior:"instant",block:"start"});
});
el("reviewAfter").addEventListener("click",()=>{
 el("finish").hidden=true;el("setup").hidden=false;startRound(true);
});
el("options").addEventListener("click",event=>{
 const b=event.target.closest("button");if(!b||submitted)return;
 if(b.dataset.choice!==undefined){
  selectedOption(Number(b.dataset.choice));
  for(const item of el("options").querySelectorAll("button"))item.setAttribute("aria-pressed",String(item===b));
 }
 if(b.dataset.token!==undefined){
  const i=Number(b.dataset.token);
  if(!pieces.includes(i))pieces.push(i);
  refreshBuild();
 }
});
el("sequence").addEventListener("click",event=>{
 const b=event.target.closest("button[data-remove]");
 if(!b||submitted)return;
 pieces.splice(Number(b.dataset.remove),1);
 refreshBuild();
});
el("clear").addEventListener("click",()=>{if(!submitted){pieces=[];refreshBuild();}});
el("check").addEventListener("click",checkAnswer);
el("next").addEventListener("click",()=>{
 if(!submitted)return;
 if(number+1<round.length){number++;renderQuestion();}
 else finish();
});
for(const sel of [track,level]){
 sel.addEventListener("change",()=>{state.selection={track:track.value,level:Number(level.value)};persist();el("storageWarning").textContent="";});
}
s// Separate, explicit question-score backup flow. Never reads/writes code drafts,
// auth state, school data, or other modules. Do not accept invalid/oversized JSON.
const backup=window.LAMA_QUIZ_BACKUP;
let pendingRestore=null,uploadTicket=0;
const backupStatus=text=>{el("quizBackupStatus").textContent=text;};
function resetPreview(){
 pendingRestore=null;
 el("quizPreviewSection").hidden=true;
 el("quizBackupReview").textContent="";
 el("quizConfirm").disabled=true;
 el("quizBackupFile").value="";
}
function downloadScores(){
 if(!backup)throw Error("The question-score backup module did not load.");
 const json=backup.exportData(localStorage,data);
 const blob=new Blob([json],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;
 link.download="lama-coding-question-scores-"+new Date().toISOString().slice(0,10)+".json";
 document.body.appendChild(link);
 link.click();link.remove();
 // Android's test-build document picker needs enough time to read the blob.
 setTimeout(()=>URL.revokeObjectURL(url),6000);
 backupStatus("Question scores export prepared. Keep the JSON file private and check it was saved before uninstalling an app.");
}
function summaryOf(stateToSummarize){
 const t=core.totals(data,stateToSummarize);
 return t.answered+" checked answers; "+t.learned+" questions answered correctly; "+
 t.missed+" awaiting review; "+stateToSummarize.history.length+" completed rounds";
}
el("quizExport").addEventListener("click",()=>{
 try{downloadScores();}catch(error){
  backupStatus("Export stopped safely: "+String(error.message||error)+". Existing practice scores were unchanged.");
 }
});
el("quizImport").addEventListener("click",()=>{
 resetPreview();
 el("quizBackupFile").click();
});
el("quizBackupFile").addEventListener("change",async()=>{
 const selectedFile=el("quizBackupFile").files?.[0];
 if(!selectedFile)return;
 const ticket=++uploadTicket;
 pendingRestore=null;
 el("quizConfirm").disabled=true;
 el("quizPreviewSection").hidden=true;
 if(!backup){backupStatus("Backup module unavailable. No data changed.");return;}
 if(selectedFile.size>backup.MAX_BYTES){
  backupStatus("Backup rejected: file exceeds the 200 KB question-score limit.");
  return;
 }
 try{
  const content=await selectedFile.text();
  if(ticket!==uploadTicket)return;
  const loaded=backup.importData(content,data);
  pendingRestore=loaded.state;
  el("quizBackupReview").textContent=
   "Current on this phone: "+summaryOf(state)+"\n"+
   "Selected backup: "+summaryOf(loaded.state)+"\n"+
   "Backup date: "+loaded.createdAt+"\n\n"+
   "Only this question-practice module will be replaced.";
  el("quizPreviewSection").hidden=false;
  el("quizConfirm").disabled=false;
  backupStatus("Backup is valid. Check the preview. Your current scores have NOT changed.");
 }catch(error){
  if(ticket!==uploadTicket)return;
  resetPreview();
  backupStatus("Backup rejected without changing scores: "+String(error.message||error));
 }
});
el("quizCancel").addEventListener("click",()=>{
 uploadTicket++;
 resetPreview();backupStatus("Restore cancelled. All existing question scores are unchanged.");
});
el("quizConfirm").addEventListener("click",()=>{
 if(!pendingRestore||!backup)return;
 if(!confirm("Replace ONLY this app's question-practice scores with the selected backup? Export current scores first if you want to keep them."))return;
 try{
  backup.restore(localStorage,pendingRestore);
  state=core.load(localStorage,data);
  track.value=state.selection.track;
  level.value=String(state.selection.level);
  stats();
  round=[];selected=null;pieces=[];submitted=false;number=0;score=0;
  el("play").hidden=true;el("finish").hidden=true;el("setup").hidden=false;
  uploadTicket++;
  resetPreview();
  backupStatus("Question-practice scores restored successfully. Only this module was changed.");
 }catch(error){
  backupStatus("Restore failed. Current scores were kept: "+String(error.message||error));
 }
});
el("quizClear").addEventListener("click",()=>{
 if(!confirm("Clear ONLY this app's question-practice scores? This cannot be undone unless you have a saved question-score backup."))return;
 try{
  localStorage.removeItem(core.KEY);
  state=core.createState();
  track.value=state.selection.track;level.value=String(state.selection.level);
  round=[];selected=null;pieces=[];submitted=false;number=0;score=0;
  el("play").hidden=true;el("finish").hidden=true;el("setup").hidden=false;
  uploadTicket++;resetPreview();stats();
  backupStatus("Only question-practice scores were cleared. All learning lessons and other LAMA data remain untouched.");
 }catch(error){
  backupStatus("Could not clear scores: "+String(error.message||error)+". No other module was changed.");
 }
});
stats();
})();