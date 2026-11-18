/* Run: node coding-academy/tests/reference.test.cjs
 * Original lesson data, semantic HTML controls, offline contract and local-only UX.
 */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,".."),read=file=>fs.readFileSync(path.join(root,file),"utf8");
const js=read("reference-data.js"),app=read("reference-app.js"),html=read("reference.html");
new Function(js);new Function(app);
const context={window:{}};vm.runInNewContext(js,context);
const db=context.window.LAMA_REFERENCE_DATA;
const symbols=Array.from(db.symbols),inputs=Array.from(db.inputs);
assert.equal(symbols.length,30,"The user requested exactly thirty programming symbols.");
assert.equal(inputs.length,22,"The supplied HTML inputs infographic shows 22 types.");
assert.equal(new Set(symbols.map(x=>x.id)).size,30);
assert.equal(new Set(inputs.map(x=>x.id)).size,22);
assert.deepEqual(inputs.map(x=>x.type),[
 "text","password","email","number","tel","url","search","date","time",
 "datetime-local","month","week","color","range","checkbox","radio",
 "file","hidden","button","submit","reset","image"
]);
for(const sym of symbols){
 assert.ok(sym.token.length>=1);
 assert.ok(sym.name.length>2&&sym.meaning.length>24,sym.id+" requires clear beginner instructions");
 assert.ok(sym.example.length>=5&&sym.language.length>=3&&sym.tip.length>=15);
 assert.ok([1,2,3].includes(sym.level));
}
assert.equal(symbols.filter(x=>x.level===1).length,10);
assert.equal(symbols.filter(x=>x.level===2).length,10);
assert.equal(symbols.filter(x=>x.level===3).length,10);
for(const item of inputs){
 assert.ok(item.name&&item.meaning.length>=15&&item.tip.length>=15);
 assert.match(item.code,new RegExp('<input type="'+item.type+'"'),"Example must show exact corresponding type.");
}
const symbolsMap=new Map(symbols.map(x=>[x.token,x]));
assert.match(symbolsMap.get("===")?.meaning||"",/type/);
assert.match(symbolsMap.get("++")?.tip||"",/Python/);
assert.match(symbolsMap.get("...")?.meaning||"",/JavaScript/);
const inputsMap=new Map(inputs.map(x=>[x.type,x]));
assert.match(inputsMap.get("hidden").tip,/NOT secret/);
assert.match(inputsMap.get("file").tip,/never uploads/i);
assert.match(inputsMap.get("week").tip,/browser/i);
assert.match(inputsMap.get("password").tip,/does not encrypt/i);
assert.match(html,/id="inputsGrid"/);
assert.match(html,/id="symbolsGrid"/);
assert.match(html,/id="inputSearch"/);
assert.match(html,/id="symbolSearch"/);
assert.match(html,/id="questionArea"/);
assert.match(html,/academy-shell\.js/);
assert.match(app,/addEventListener\("submit",event=>\{/);
assert.match(app,/event\.preventDefault\(\)/);
assert.match(app,/File was selected|A file was selected/);
assert.match(app,/input\.files&&input\.files\.length/);
assert.match(app,/type==="hidden"/);
assert.match(app,/type==="image"/);
assert.doesNotMatch(app,/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|eval)\s*(?:\(|\.)/i);
const sw=read("sw.js");
for(const file of ["reference.html","reference-data.js","reference-app.js"])
 assert.ok(sw.includes("'./"+file+"'"),file+" must be bundled with the offline app.");
console.log("PASS: 30 original programming symbols, 22 HTML input demos, safe no-upload form behavior and offline inclusion.");
