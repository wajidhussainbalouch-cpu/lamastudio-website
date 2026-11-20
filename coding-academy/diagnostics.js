/* LAMA Coding Academy device checks.
 * Does not send saved lessons, browser identifiers or account information.
 * Pyodide is downloaded ONLY after the learner clicks Test Python.
 */
(function(){
"use strict";
const byId=id=>document.getElementById(id);
const core=window.LAMA_CODING_CLOUD_CORE;
const checks=[
  {id:"secure",name:"Secure browser context",run:async()=>{
    return window.isSecureContext===true?good("Secure HTTPS or trusted local context."):warn("Open the academy on HTTPS (or localhost) for PWA features.");
  }},
  {id:"storage",name:"Save progress on this device",run:async()=>{
    const key="lama-coding-diagnostic-probe-v1",value="local-test-ok";
    try{
      localStorage.setItem(key,value);
      const correct=localStorage.getItem(key)===value;
      localStorage.removeItem(key);
      return correct?good("Browser storage can save, read and delete a small test value."):fail("A saved value could not be read correctly.");
    }catch(e){
      try{localStorage.removeItem(key);}catch(ignored){}
      return fail("Browser storage is unavailable; lesson progress may not persist.");
    }
  }},
  {id:"progress",name:"Existing learning progress",run:async()=>{
    if(!core||typeof core.read!=="function")return fail("Academy progress validator was not loaded.");
    try{
      const snapshot=core.read(localStorage),summary=core.counts(snapshot);
      return summary.total===62?good("All four saved learning modules can be read in the current format."):fail("Progress catalog is not the expected 62 activities.");
    }catch(e){return fail("One or more local learning stores could not be validated. Export a backup before editing them.");}
  }},
  {id:"workers",name:"Web Workers and WebAssembly",run:async()=>{
    return typeof Worker==="function"&&typeof WebAssembly==="object"?
      good("Worker and WebAssembly APIs exist; run the optional Python test for actual verification."):
      warn("This browser lacks Web Workers or WebAssembly. Real Python may be unavailable.");
  }},
  {id:"file",name:"Local backup downloads",run:async()=>{
    return typeof Blob==="function"&&typeof URL?.createObjectURL==="function"&&
      typeof document.createElement==="function"?
      good("This browser provides file and download APIs. Test an actual backup export separately."):
      warn("File download APIs may be restricted. Try another browser for backup exports.");
  }},
  {id:"serviceworker",name:"PWA service worker",run:async()=>{
    if(!("serviceWorker" in navigator))return warn("This browser does not support service workers.");
    try{
      const r=await navigator.serviceWorker.getRegistration("./");
      return r&&r.active?good("An active academy service worker is registered."):
        warn("An academy service worker is not active yet. Open the app online and reload after installation.");
    }catch(e){return warn("Could not read the service worker registration.");}
  }},
  {id:"cache",name:"Essential offline pages",run:async()=>{
    if(!("caches" in window))return warn("CacheStorage is not available.");
    try{
      const required=["index.html","practice.html","studio.html","python.html","progress.html","privacy.html","diagnostics.html"];
      const missing=[];
      for(const filename of required){
        const url=new URL(filename,new URL("./",location.href)).href;
        const cached=await caches.match(url);
        if(!cached||!cached.ok)missing.push(filename);
      }
      return missing.length===0?good("Seven essential academy pages are available in local cache."):
        warn("Not all essential pages are cached yet. Connect online and revisit after service-worker installation.");
    }catch(e){return warn("Could not inspect offline page cache.");}
  }},
  {id:"connection",name:"Internet connection indication",run:async()=>{
    return navigator.onLine===false?warn("The browser reports offline mode; Python's first download may not work."):
      good("The browser reports connectivity (this does not guarantee the CDN is reachable).");
  }}
];
function good(message){return {status:"pass",message};}
function warn(message){return {status:"warn",message};}
function fail(message){return {status:"fail",message};}
const storedResults=new Map();
const labels={pass:"Ready",warn:"Not ready",fail:"Failed"};
let pythonWorker=null,pythonTimer=null,pythonRequest=0,pythonBusy=false;
function showResults(){
  const mount=byId("checks");
  mount.textContent="";
  for(const entry of checks){
    const result=storedResults.get(entry.id)||{status:"warn",message:"Not checked."};
    const row=document.createElement("div");row.className="check";
    const badge=document.createElement("span");badge.className="state "+result.status;
    badge.textContent=labels[result.status]||"Unknown";
    const body=document.createElement("div");body.className="checkbody";
    const name=document.createElement("strong");name.textContent=entry.name;
    const detail=document.createElement("p");detail.textContent=result.message;
    body.appendChild(name);body.appendChild(detail);
    row.appendChild(badge);row.appendChild(body);mount.appendChild(row);
  }
}
async function runChecks(){
  byId("rerun").disabled=true;
  storedResults.clear();
  for(const entry of checks){
    let result;
    try{result=await entry.run();}catch(e){result=fail("This check encountered an unexpected browser error.");}
    storedResults.set(entry.id,result);
    showResults();
  }
  byId("rerun").disabled=false;
}
function downloadResults(){
  const anonymous={
    report:"LAMA Coding Academy capability check",
    version:1,
    checks:checks.map(c=>({check:c.id,status:storedResults.get(c.id)?.status||"not-checked"})),
    pythonStatus:byId("pythonStatus").dataset.verdict||"not-tested"
  };
  try{
    const blob=new Blob([JSON.stringify(anonymous,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download="lama-coding-device-check.json";
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
  }catch(e){byId("pythonStatus").textContent="Could not download the report in this browser.";}
}
function writePython(message,verdict){
  const node=byId("pythonStatus");
  node.textContent=message;
  node.dataset.verdict=verdict||"running";
}
function endPython(message,verdict){
  if(pythonTimer!==null){clearTimeout(pythonTimer);pythonTimer=null;}
  if(pythonWorker){pythonWorker.terminate();pythonWorker=null;}
  pythonBusy=false;
  byId("testPython").disabled=false;
  byId("cancelPython").disabled=true;
  writePython(message,verdict);
}
function startTimeout(ms,message){
  if(pythonTimer!==null)clearTimeout(pythonTimer);
  pythonTimer=setTimeout(()=>endPython(message,"failed"),ms);
}
function testPython(){
  if(pythonBusy)return;
  if(typeof Worker!=="function"||typeof WebAssembly!=="object"){
    writePython("This browser does not support the worker/WebAssembly features required for real Python.","unsupported");
    return;
  }
  pythonBusy=true;pythonRequest++;
  byId("testPython").disabled=true;
  byId("cancelPython").disabled=false;
  writePython("Starting real Python runtime. The first online download may be large. No saved code is being read.","running");
  const id=pythonRequest;
  let worker;
  try{worker=new Worker("./python-runner.mjs",{type:"module"});}
  catch(e){
    endPython("Unable to create a Python module worker. Try an updated browser.","failed");return;
  }
  pythonWorker=worker;
  startTimeout(120000,"Python was unable to initialize within the available time. Check network and device memory.");
  worker.onerror=()=>{
    if(pythonWorker===worker)endPython("The Python worker failed to load. Check network, CDN access and browser support.","failed");
  };
  worker.onmessage=event=>{
    const item=event.data;
    if(pythonWorker!==worker||!item||item.id!==id)return;
    if(item.type==="loading"){writePython("Downloading / preparing the Python WebAssembly interpreter…","running");return;}
    if(item.type==="ready"){
      writePython("Python is loaded. Running a small real-code exercise…","running");
      startTimeout(8000,"Python loaded, but the exercise did not finish within eight seconds.");
      return;
    }
    if(item.type==="error"){
      endPython("Python could not run: "+String(item.message||"Unknown runtime error").slice(0,200),"failed");
      return;
    }
    if(item.type!=="result")return;
    const result=item.result;
    const passed=Boolean(result?.passed===true&&Array.isArray(result.results)&&
      result.results.length===1&&result.results[0].pass===true&&
      String(result.stdout||"").includes("Python says 5"));
    endPython(passed?
      "PASS: The real Python interpreter loaded, ran a function, printed output and passed its behavior test.":
      "Python returned a result, but its output or behavior test was not correct. Review runtime compatibility.",
      passed?"passed":"failed");
  };
  worker.postMessage({
    id,
    action:"run",
    code:"def add(a,b):\n    return a+b\n\nprint('Python says',add(2,3))",
    tests:[{label:"Math function works",expression:"add(2,3) == 5"}]
  });
}
byId("rerun").addEventListener("click",runChecks);
byId("export").addEventListener("click",downloadResults);
byId("testPython").addEventListener("click",testPython);
byId("cancelPython").addEventListener("click",()=>{
  if(pythonBusy)endPython("Python test stopped by the learner. No progress has been changed.","stopped");
});
runChecks();
if("serviceWorker" in navigator){
 window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
})();
