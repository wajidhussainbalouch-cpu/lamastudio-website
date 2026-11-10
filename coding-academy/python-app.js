/* LAMA Coding Academy Python Lab.
 * Author-written practice code runs in a Pyodide module worker, not on the main UI thread.
 * This is local teaching code, NOT a security boundary or proctored assessment.
 */
(function(){
'use strict';
const lessons=Array.isArray(window.LAMA_PYTHON_MISSIONS)?window.LAMA_PYTHON_MISSIONS:[];
const storageKey="lama-python-executable-v1";
const byId=id=>document.getElementById(id);
const safe=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaultState=()=>({selected:lessons[0]?.id||"",drafts:{},answers:{},passed:{}});
function readState(){
  try{
    const r=JSON.parse(localStorage.getItem(storageKey)||"null");
    if(!r||typeof r!=="object")return defaultState();
    return {
      selected:lessons.some(l=>l.id===r.selected)?r.selected:defaultState().selected,
      drafts:r.drafts&&typeof r.drafts==="object"?r.drafts:{},
      answers:r.answers&&typeof r.answers==="object"?r.answers:{},
      passed:r.passed&&typeof r.passed==="object"?r.passed:{}
    };
  }catch(e){return defaultState();}
}
let state=readState(),worker=null,active=null,deadline=null,requestId=0,testApprovedCode=null;
function save(){
  try{localStorage.setItem(storageKey,JSON.stringify(state));}
  catch(error){feedback("Browser storage is not available. Export code regularly.",false);}
}
function current(){return lessons.find(l=>l.id===state.selected)||lessons[0];}
function index(){return Math.max(0,lessons.findIndex(l=>l.id===state.selected));}
function total(){return lessons.filter(l=>state.passed[l.id]).length;}
function setStatus(s){byId("runtimeStatus").textContent=s;}
function feedback(s,positive){
  const el=byId("feedback");el.className="feedback"+(positive===true?" good":positive===false?" bad":"");el.textContent=s;
}
function updateProgress(){
  byId("totalPassed").textContent=total()+" / "+lessons.length;
  byId("progressBar").style.width=(lessons.length?Math.round(100*total()/lessons.length):0)+"%";
}
function setBusy(isBusy){
  byId("run").disabled=isBusy;
  byId("stop").disabled=!isBusy;
  byId("restore").disabled=isBusy;
  byId("complete").disabled=isBusy;
}
function testList(items){
  const root=byId("testResults");root.textContent="";
  if(!Array.isArray(items)||!items.length){root.textContent="No test results available.";return;}
  const list=document.createElement("ul");list.style.paddingLeft="20px";
  for(const t of items){
    const row=document.createElement("li");
    row.textContent=(t.pass?"✓ ":"✗ ")+String(t.label||"Test")+(t.details?" — "+String(t.details).slice(0,250):"");
    row.style.margin="9px 0";row.style.color=t.pass?"#a6f5d4":"#ffd5c8";list.appendChild(row);
  }
  root.appendChild(list);
}
function render(){
  if(!lessons.length){document.querySelector("main").textContent="Python lessons are not available.";return;}
  const l=current(),pos=index();
  byId("missionMenu").innerHTML=lessons.map((m,i)=>'<button type="button" class="'+(m.id===l.id?"active ":"")+(state.passed[m.id]?"pass":"")+'" data-mission="'+safe(m.id)+'"><small>'+(i+1)+'. '+safe(m.topic)+' · '+safe(m.minutes)+' min</small><b>'+safe(m.title)+(state.passed[m.id]?" ✓":"")+'</b></button>').join("");
  byId("missionTopic").textContent=l.topic+" · "+l.difficulty;
  byId("missionTitle").textContent=l.title;
  byId("concept").textContent=l.concept;
  byId("missionTask").textContent=l.task;
  byId("purpose").textContent=l.purpose;
  byId("hint").textContent=l.hint;
  byId("editor").value=typeof state.drafts[l.id]==="string"?state.drafts[l.id]:l.starter;
  byId("question").textContent=l.quiz.question;
  byId("options").innerHTML=l.quiz.options.map((o,i)=>'<label class="choice"><input type="radio" name="answer" value="'+i+'" '+(state.answers[l.id]===i?'checked':'')+'> <span>'+safe(o)+'</span></label>').join("");
  byId("previous").disabled=pos===0;
  byId("next").disabled=pos===lessons.length-1;
  byId("stdout").textContent="Click Run Python to start.";
  byId("testResults").textContent="No tests run yet.";
  setStatus("Not started");
  testApprovedCode=null;
  setBusy(false);
  feedback(state.passed[l.id]?"Mission previously completed. Re-run if you change the code.":"Change the starter code, run it, and answer the concept question.",undefined);
  updateProgress();
}
function cleanupWorker(){
  if(worker){worker.terminate();worker=null;}
}
function clearTimer(){if(deadline!==null){clearTimeout(deadline);deadline=null;}}
function abortRun(message){
  clearTimer();cleanupWorker();active=null;testApprovedCode=null;setBusy(false);
  setStatus("Stopped");
  if(message)feedback(message,false);
}
function startTimer(ms,message){
  clearTimer();
  deadline=setTimeout(()=>abortRun(message),ms);
}
function receive(w,payload){
  if(worker!==w||!active||!payload||payload.id!==active.id)return;
  if(payload.type==="loading"){
    setStatus("Loading Python runtime…");return;
  }
  if(payload.type==="ready"){
    setStatus("Running Python tests…");
    startTimer(8000,"Python took too long to finish. The worker was stopped. Check for loops that never end.");
    return;
  }
  if(payload.type==="error"){
    abortRun("Python could not run: "+String(payload.message||"Unknown error")+". If the runtime failed to load, check your internet connection and retry.");
    return;
  }
  if(payload.type!=="result")return;
  const original=active;
  clearTimer();active=null;setBusy(false);setStatus("Finished");
  const result=payload.result||{};
  byId("stdout").textContent=String(result.stdout||"").slice(0,4000)+(result.stderr?"\nStderr:\n"+String(result.stderr).slice(0,1000):"")||(result.error?"No program output.":"(No printed output; function return values are tested.)");
  if(result.error){
    byId("testResults").textContent=String(result.error).slice(0,2000);
    feedback("Python reported an error. Read the traceback, fix your code and run it again.",false);
    testApprovedCode=null;return;
  }
  testList(result.results);
  const valid=Array.isArray(result.results)&&result.results.length===original.tests.length&&result.results.every((t,i)=>t&&t.pass===true&&t.label===original.tests[i].label);
  if(valid&&result.passed===true){
    testApprovedCode=original.code;
    feedback("All three Python behavior tests passed! Answer the concept question and press Check & Complete Mission.",true);
  }else{
    testApprovedCode=null;
    feedback("One or more Python behavior tests failed. Use the feedback and hint, then try again.",false);
  }
}
function makeWorker(){
  if(worker)return worker;
  const w=new Worker("./python-runner.mjs",{type:"module"});
  w.onmessage=event=>receive(w,event.data);
  w.onerror=event=>{
    if(worker===w){
      abortRun("Python runtime failed to load. Check network access and browser WebAssembly support, then try again.");
    }
    if(event.preventDefault)event.preventDefault();
  };
  worker=w;return w;
}
function run(){
  if(active||!lessons.length)return;
  const l=current(),code=byId("editor").value;
  if(code.length>8000){feedback("Keep this beginner code under 8,000 characters.",false);return;}
  state.drafts[l.id]=code;save();
  testApprovedCode=null;
  byId("stdout").textContent="Preparing Python…";
  byId("testResults").textContent="Waiting for results.";
  let w;
  try{w=makeWorker();}
  catch(e){feedback("This browser cannot start a module worker: "+String(e.message||e),false);return;}
  const id=++requestId;
  active={id,missionId:l.id,code,tests:l.tests};
  setBusy(true);setStatus("Starting…");
  feedback("First use may download a large Python runtime. A network connection is required.",undefined);
  startTimer(120000,"Python did not initialize in time. Check internet access and browser memory, then try again.");
  try{w.postMessage({id,action:"run",code,tests:l.tests});}
  catch(e){abortRun("Could not send code to the Python runtime: "+String(e.message||e));}
}
function complete(){
  if(active){feedback("Finish or stop the current Python run first.",false);return;}
  const l=current(),code=byId("editor").value;
  if(testApprovedCode===null||testApprovedCode!==code){
    feedback("Run your latest code and pass all behavior tests before completing the mission.",false);
    return;
  }
  if(state.answers[l.id]!==l.quiz.answer){
    feedback("The concept answer is not correct yet. Review the explanation and choose again.",false);
    return;
  }
  state.passed[l.id]={at:new Date().toISOString()};save();
  feedback("Mission passed! Your code passed all three behavior tests and you answered the concept question correctly. Continue to the next problem.",true);
  updateProgress();
  const btn=byId("missionMenu").querySelector('[data-mission="'+l.id+'"]');
  if(btn){btn.classList.add("pass");const name=btn.querySelector("b");if(name&&!name.textContent.endsWith(" ✓"))name.textContent+=" ✓";}
}
function choose(id){
  if(!lessons.some(l=>l.id===id))return;
  if(active)abortRun("");
  state.selected=id;save();render();window.scrollTo({top:0,behavior:"auto"});
}
function download(){
  const code=byId("editor").value,blob=new Blob([code],{type:"text/x-python;charset=utf-8"});
  const link=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=link;a.download=current().id+".py";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(link),1200);
}
byId("missionMenu").addEventListener("click",event=>{
  const b=event.target.closest("[data-mission]");if(b)choose(b.dataset.mission);
});
byId("editor").addEventListener("input",()=>{
  const l=current(),code=byId("editor").value;
  state.drafts[l.id]=code;
  if(state.passed[l.id])delete state.passed[l.id];
  testApprovedCode=null;save();updateProgress();
});
byId("options").addEventListener("change",event=>{
  if(event.target.name==="answer"){
    state.answers[current().id]=Number(event.target.value);save();
  }
});
byId("run").addEventListener("click",run);
byId("stop").addEventListener("click",()=>abortRun("Python execution was stopped. You can run your program again."));
byId("complete").addEventListener("click",complete);
byId("download").addEventListener("click",download);
byId("restore").addEventListener("click",()=>{
  if(!confirm("Replace your current Python code with the starter?"))return;
  const l=current();
  state.drafts[l.id]=l.starter;delete state.passed[l.id];save();render();
});
byId("previous").addEventListener("click",()=>{if(index()>0)choose(lessons[index()-1].id);});
byId("next").addEventListener("click",()=>{if(index()<lessons.length-1)choose(lessons[index()+1].id);});
if(!lessons.length){byId("missionMenu").textContent="Lessons could not be loaded.";}else{render();}
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
})();
