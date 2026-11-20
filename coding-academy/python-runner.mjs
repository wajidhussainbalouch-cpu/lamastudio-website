/* LAMA Coding Academy — real Python 3 WebAssembly worker.
 * Pyodide 314.0.7 is pinned (not a floating /latest/ URL).
 * Worker isolation prevents ordinary loops from freezing the UI, but it is NOT a security sandbox.
 * No account tokens, user data or secrets are sent into this worker.
 */
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs";

const PYODIDE_ROOT="https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
let runtimePromise=null;
function getRuntime(){
  if(!runtimePromise){
    runtimePromise=Promise.all([
      loadPyodide({indexURL:PYODIDE_ROOT}),
      fetch(new URL("./python-harness.py",import.meta.url),{credentials:"omit"}).then(resp=>{
        if(!resp.ok)throw new Error("Could not load the local Python test harness.");
        return resp.text();
      })
    ]);
  }
  return runtimePromise;
}
self.addEventListener("message",async event=>{
  const input=event.data||{};
  const id=input.id;
  if(!Number.isSafeInteger(id)||id<1)return;
  if(input.action!=="run"||typeof input.code!=="string"||input.code.length>8000||
     !Array.isArray(input.tests)||input.tests.length<1||input.tests.length>5||
     input.tests.some(t=>!t||typeof t.label!=="string"||typeof t.expression!=="string"||t.label.length>100||t.expression.length>500)){
    self.postMessage({id,type:"error",message:"Invalid or oversized Python practice request."});
    return;
  }
  try{
    self.postMessage({id,type:"loading"});
    const [pyodide,harness]=await getRuntime();
    self.postMessage({id,type:"ready"});
    // The harness sees a JSON string, not a JavaScript object with application state.
    const payload=JSON.stringify({code:input.code,tests:input.tests});
    pyodide.globals.set("_lama_payload",payload);
    let result;
    try{
      result=JSON.parse(pyodide.runPython(harness));
    }finally{
      pyodide.globals.delete("_lama_payload");
    }
    self.postMessage({id,type:"result",result});
  }catch(error){
    self.postMessage({id,type:"error",message:String(error&&error.message||error).slice(0,400)});
    // A load failure will be retried only by terminating and recreating this worker.
  }
});
