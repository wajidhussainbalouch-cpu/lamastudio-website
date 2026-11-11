'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = __dirname;
const client = fs.readFileSync(path.join(root,'ask-lama.js'),'utf8');
const css = fs.readFileSync(path.join(root,'ask-lama.css'),'utf8');
const backend = fs.readFileSync(path.join(root,'api/generate.js'),'utf8');
const home = fs.readFileSync(path.join(root,'index.html'),'utf8');
const faqs = fs.readFileSync(path.join(root,'faqs.html'),'utf8');
const signin = fs.readFileSync(path.join(root,'signin.html'),'utf8');

assert.match(css,/\.asklama-chat-box\s*\{[^}]*background:#f7faff;color:#102338/s);
assert.match(css,/\.asklama-messages\s*\{[^}]*min-height:0/s);
assert.match(css,/\.asklama-compose input\s*\{[^}]*min-width:0/s);
assert.match(css,/@media\(max-width:640px\)/);
assert.match(css,/\.asklama-chat-box\s*\{[^}]*position:fixed;inset:/s);
assert.doesNotMatch(css,/background:\s*var\(--surface/);
assert.match(css,/body\.asklama-open\{overflow:hidden\}/);
for(const html of [home,faqs,signin]) {
  assert.match(html,/<script src="ask-lama\.js\?v=2"><\/script>/);
}
assert.doesNotMatch(client,/script\.google\.com\/macros/);
assert.match(client,/fetch\('\/api\/generate'/);

class ClassList {
  constructor(){this.items=new Set()}
  toggle(name,enabled){if(enabled===undefined)enabled=!this.items.has(name);enabled?this.items.add(name):this.items.delete(name)}
  add(name){this.items.add(name)}
  remove(name){this.items.delete(name)}
  contains(name){return this.items.has(name)}
}
const nodes = new Map(), rootNodes = [];
class MockNode {
  constructor(tag) {
    this.tagName=tag;this.style={};this.classList=new ClassList();
    this.className='';this.textContent='';this.value='';this.disabled=false;
    this.attrs={};this.listeners={};this.children=[];this.scrollTop=0;
    this.scrollHeight=1000;
  }
  set innerHTML(html) {
    this._html=html;
    if(this.className==='asklama-widget-container') {
      for(const m of html.matchAll(/id='([^']+)'/g))nodes.set(m[1],new MockNode('div'));
      nodes.get('askLamaMessages').children=[Object.assign(new MockNode('div'),{
        textContent:"Hello! 👋 I’m AskLama, your LAMA Studio guide. How can I help you today?"
      })];
    }
  }
  get innerHTML(){return this._html||''}
  get firstElementChild(){return this.children[0]}
  appendChild(node){this.children.push(node);return node}
  replaceChildren(){this.children=[]}
  addEventListener(name,callback){this.listeners[name]=callback}
  setAttribute(name,value){this.attrs[name]=value}
  focus(){this.focused=true}
}
const document = {
  head:{appendChild(node){rootNodes.push(node)}},
  body:Object.assign(new MockNode('body'),{appendChild(node){rootNodes.push(node)}}),
  activeElement:Object.assign(new MockNode('button'),{focus(){this.focused=true}}),
  getElementById:id=>nodes.get(id)||null,
  createElement:tag=>new MockNode(tag),
  listeners:{},
  addEventListener(name,fn){this.listeners[name]=fn}
};
const viewport={offsetTop:0,height:850,listeners:{},addEventListener(name,fn){this.listeners[name]=fn}};
const window={matchMedia:()=>({matches:true}),visualViewport:viewport,listeners:{},
  addEventListener(name,fn){this.listeners[name]=fn}};
let fetchCalls=[], responder=async()=>({ok:true,json:async()=>({text:'Hello from AskLama.'})});
const mockFetch=(url,opts)=>{fetchCalls.push({url,opts});return responder(url,opts)};
vm.runInNewContext(client,{document,window,fetch:mockFetch,setTimeout,clearTimeout,AbortController,console});
assert.ok(window.__askLamaUI);
const ui=window.__askLamaUI;
const $=id=>nodes.get(id);
ui.setOpen(true);
assert.equal(ui.isOpen(),true);
assert.equal($('askLamaChatBox').attrs['aria-hidden'],'false');
assert.equal(document.body.classList.contains('asklama-open'),true);
assert.equal($('askLamaChatBox').style.height,'834px');
assert.equal($('askLamaInput').focused,undefined,'mobile opens without keyboard focus');
const input=$('askLamaInput');
async function clientChecks() {
  input.value='Tell me about LAMA School Suite';
  await ui.handleUserMessage({preventDefault(){}});
  assert.equal(fetchCalls.length,1);
  assert.equal(fetchCalls[0].url,'/api/generate');
  assert.equal(JSON.parse(fetchCalls[0].opts.body).prompt,'Tell me about LAMA School Suite');
  assert.equal($('askLamaMessages').children.at(-1).textContent,'Hello from AskLama.');
  assert.equal(ui.isBusy(),false);
  assert.equal($('askLamaSendBtn').disabled,false);
  assert.match($('askLamaStatus').textContent,/Reply received/);

  responder=async()=>({ok:false,json:async()=>({error:'AI service temporarily busy'})});
  input.value='Try again';
  await ui.handleUserMessage({preventDefault(){}});
  assert.match($('askLamaMessages').children.at(-1).textContent,/busy/);
  assert.equal($('askLamaMessages').children.at(-1).classList.contains('error'),true);
  assert.equal($('askLamaSendBtn').disabled,false);

  let release;
  responder=()=>new Promise(resolve=>{release=resolve});
  input.value='Test pending';
  const promise=ui.handleUserMessage({preventDefault(){}});
  assert.equal(ui.isBusy(),true);
  const before=fetchCalls.length;
  await ui.handleUserMessage({preventDefault(){}});
  assert.equal(fetchCalls.length,before,'Repeated taps must not submit twice');
  release({ok:true,json:async()=>({text:'Completed'})});
  await promise;
  assert.equal(ui.isBusy(),false);

  $('askLamaClearBtn').listeners.click();
  assert.equal($('askLamaMessages').children.length,1);
  assert.match($('askLamaStatus').textContent,/cleared/);
  document.listeners.keydown({key:'Escape'});
  assert.equal(ui.isOpen(),false);
  assert.equal($('askLamaChatBox').attrs['aria-hidden'],'true');
}

function makeResponse(){
  return {code:200,data:null,headers:{},
    setHeader(k,v){this.headers[k]=v;return this},
    status(code){this.code=code;return this},
    json(data){this.data=data;return this}
  };
}
async function backendChecks(){
  const serverSource=backend
    .replace('export default async function handler','async function handler')
    .replace('export const __askLamaHelpers =','const __askLamaHelpers =')
    + '\nthis.handler=handler;this.helpers=__askLamaHelpers;';
  let requests=[];
  let serverResponder=async()=>({ok:true,status:200,json:async()=>({
    candidates:[{content:{parts:[{text:'First part '},{text:'Second part'}]}}]})});
  const ctx={process:{env:{GEMINI_API_KEY:'test-only-key'}},fetch:(url,opts)=>{
    requests.push({url,opts});return serverResponder(url,opts)
  },setTimeout,clearTimeout,AbortController,console};
  vm.createContext(ctx);
  vm.runInContext(serverSource,ctx);
  assert.equal(ctx.helpers.extractText({candidates:[{content:{parts:[{text:'Hello'},{text:' world'}]}}]}),'Hello\n world');
  const badMethod=makeResponse();
  await ctx.handler({method:'GET',body:{}},badMethod);
  assert.equal(badMethod.code,405);
  const invalid=makeResponse();
  await ctx.handler({method:'POST',body:{prompt:' '.repeat(3)}},invalid);
  assert.equal(invalid.code,400);
  const valid=makeResponse();
  await ctx.handler({method:'POST',body:{prompt:'What is LAMA Studio?',history:[{role:'user',text:'Hello'},{role:'model',text:'Hi'}]}},valid);
  assert.equal(valid.code,200);
  assert.equal(valid.data.text,'First part \nSecond part');
  assert.equal(requests.length,1);
  assert.match(requests[0].url,/gemini-3\.8-flash/);
  assert.equal(requests[0].opts.headers['x-goog-api-key'],'test-only-key');
  const payload=JSON.parse(requests[0].opts.body);
  assert.equal(payload.contents.length,3);
  assert.equal(payload.contents.at(-1).parts[0].text,'What is LAMA Studio?');

  requests=[];
  let first=true;
  serverResponder=async()=>{
    if(first){first=false;return {ok:false,status:429,json:async()=>({error:{message:'quota'}})}}
    return {ok:true,status:200,json:async()=>({candidates:[{content:{parts:[{text:'Fallback success'}]}}]})}
  };
  const fallback=makeResponse();
  await ctx.handler({method:'POST',body:{prompt:'A question'}},fallback);
  assert.equal(fallback.code,200);
  assert.equal(fallback.data.text,'Fallback success');
  assert.equal(requests.length,2);
  assert.match(requests[1].url,/gemini-3\.5-flash-lite/);

  ctx.process.env.GEMINI_API_KEY='';
  const noKey=makeResponse();
  await ctx.handler({method:'POST',body:{prompt:'Another question'}},noKey);
  assert.equal(noKey.code,503);
  assert.doesNotMatch(JSON.stringify(noKey.data),/test-only-key/);
}
(async()=>{
 await clientChecks();
 await backendChecks();
 console.log('PASS: opaque responsive AskLama; mobile focus, send, error, duplicate blocking, close, server-side Gemini routing, validation and fallbacks.');
})().catch(error=>{console.error(error);process.exitCode=1});
