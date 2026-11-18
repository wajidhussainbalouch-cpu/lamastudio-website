/* LAMA Coding Academy interactive reference: no external requests, no storage,
 * no JavaScript eval and no form submissions. Pure first-time learner demos.
 */
(function(){
"use strict";
const data=window.LAMA_REFERENCE_DATA;
const el=id=>document.getElementById(id);
if(!data||!el("inputsGrid"))return;
const make=(tag,cls,text)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=String(text);
 return node;
};
function demo(item){
 const box=make("div","demo-box");
 const form=make("form");
 form.autocomplete="off";
 form.noValidate=false;
 form.addEventListener("submit",event=>{
  event.preventDefault();
  status.textContent="Demo submission prevented. No data was sent.";
 });
 const label=make("label",null,"Try it: "+item.name);
 const status=make("div","demo-status","Try the control; nothing is saved.");
 status.setAttribute("role","status");
 const type=item.type,input=document.createElement("input");
 input.type=type;
 input.name="example-"+type;
 input.setAttribute("aria-label","Try "+item.name+" example");
 if(["text","email","search","tel","url"].includes(type))input.placeholder="Sample only";
 if(type==="password"){
  input.autocomplete="off";
  input.placeholder="Do not enter a real password";
 }
 if(type==="number"){input.min="0";input.max="100";input.value="5";}
 if(type==="range"){input.min="0";input.max="100";input.value="40";}
 if(type==="color")input.value="#316afa";
 if(type==="button")input.value="Tap demo";
 if(type==="submit")input.value="Submit demo";
 if(type==="reset")input.value="Reset demo";
 if(type==="image"){
  input.src="./icon.svg";
  input.alt="Submit image demo";
  input.width=55;input.height=55;
 }
 if(type==="file")input.accept=".txt,.png,.jpg,.pdf";
 if(type==="hidden")input.value="not-secret";
 if(type==="checkbox"||type==="radio"){
  const choices=type==="radio"?["Option A","Option B"]:["I understand this example"];
  for(let i=0;i<choices.length;i++){
   const line=make("label","choice");
   const control=i===0?input:document.createElement("input");
   control.type=type;
   control.name=type==="radio"?"answer-"+item.id:"check-"+item.id;
   control.value=choices[i].toLowerCase().replace(/ /g,"-");
   line.append(control,document.createTextNode(choices[i]));
   form.append(line);
  }
 }else if(type==="hidden"){
  form.append(input,make("p","demo-status","This hidden input has no visible control. Its value is not secret."));
 }else{
  form.append(label,input);
 }
 if(type==="reset"){
  const extra=make("input");extra.type="text";extra.value="Change this text, then tap Reset";
  extra.setAttribute("aria-label","Text to reset");
  extra.autocomplete="off";
  form.insertBefore(extra,input);
 }
 if(type==="button")input.addEventListener("click",()=>{status.textContent="Button tapped! No form was submitted.";});
 if(type==="file")input.addEventListener("change",()=>{
  status.textContent=input.files&&input.files.length?"A file was selected. It was NOT read or uploaded.":"No file selected.";
 });
 if(type==="range"||type==="color")input.addEventListener("input",()=>{
  status.textContent="Current demo value: "+input.value;
 });
 if(type==="checkbox"||type==="radio")form.addEventListener("change",()=>{
  status.textContent="Selection changed. This is a local demonstration only.";
 });
 if(type==="reset")form.addEventListener("reset",()=>{
  // Browsers update form fields after the reset event.
  status.textContent="The form's example control was reset.";
 });
 box.append(form,status);
 return box;
}
function renderInputs(){
 const search=el("inputSearch").value.trim().toLowerCase();
 const filtered=data.inputs.filter(item=>
  [item.type,item.name,item.meaning,item.tip].join(" ").toLowerCase().includes(search));
 const grid=el("inputsGrid");
 grid.replaceChildren();
 for(const item of filtered){
  const card=make("article","input-card");
  const head=make("div","card-head"),title=make("h3",null,item.name);
  head.append(title,make("span","card-number",String(data.inputs.indexOf(item)+1)+" / 22"));
  card.append(head,make("p","meaning",item.meaning));
  const code=make("pre","snippet",item.code);
  code.setAttribute("aria-label","Example HTML code");
  card.append(code,demo(item),make("p","tip","TIP: "+item.tip));
  grid.append(card);
 }
 el("inputsCount").textContent=filtered.length+" of 22 types shown";
}
function renderSymbols(){
 const level=el("symbolsLevel").value;
 const search=el("symbolSearch").value.trim().toLowerCase();
 const filtered=data.symbols.filter(item=>
  (level==="all"||String(item.level)===level)&&
  [item.token,item.name,item.meaning,item.language,item.tip].join(" ").toLowerCase().includes(search));
 const grid=el("symbolsGrid");grid.replaceChildren();
 for(const item of filtered){
  const details=make("details","symbol-card");
  const summary=make("summary");
  const token=make("span","symbol",item.token);
  summary.append(token,make("strong",null,item.name));
  const body=make("div","symbol-body");
  body.append(make("p",null,item.meaning),make("span","lang","Used in: "+item.language));
  const code=make("code",null,item.example);
  body.append(code,make("p",null,"Note: "+item.tip));
  details.append(summary,body);grid.append(details);
 }
 el("symbolsCount").textContent=filtered.length+" of 30 symbols shown";
}
const questions=[
 {prompt:"Which HTML type helps enter a date?",choices:["text","date","email"],answer:1,why:"The date type offers a calendar date control in supporting browsers."},
 {prompt:"What should you use for a phone number?",choices:["tel","number","color"],answer:0,why:"Telephone numbers are identifiers, not quantities; tel keeps leading zeroes."},
 {prompt:"Which JavaScript symbol checks both value and type?",choices:["=","==","==="],answer:2,why:"Strict equality uses ===. The single = assigns a value."},
 {prompt:"Which HTML type lets a learner select a document from a device?",choices:["hidden","file","search"],answer:1,why:"A file input selects a file; selection does not upload it automatically."},
 {prompt:"Which symbol groups an HTML element's opening and closing tags?",choices:["< >", "[ ]","{ }"],answer:0,why:"HTML uses angle brackets such as <p> and </p>."},
 {prompt:"What does the JavaScript expression 10 % 3 produce?",choices:["3","1","0"],answer:1,why:"% gives the remainder after division. Ten divided by three leaves a remainder of one."}
];
let index=0,score=0,checked=false;
function renderQuestion(){
 const holder=el("questionArea");holder.replaceChildren();checked=false;
 const question=questions[index];
 holder.append(make("p",null,"Question "+(index+1)+" of "+questions.length),make("h3",null,question.prompt));
 for(let i=0;i<question.choices.length;i++){
  const choice=make("button",null,question.choices[i]);
  choice.type="button";
  choice.addEventListener("click",()=>{
   if(checked)return;
   checked=true;
   const right=i===question.answer;if(right)score++;
   for(const btn of holder.querySelectorAll("button"))btn.disabled=true;
   const res=el("quizResult");
   res.className="result "+(right?"correct":"wrong");
   res.textContent=(right?"Correct! ":"Not quite. Correct answer: "+question.choices[question.answer]+". ")+question.why;
   el("quizNext").hidden=false;
   el("quizNext").textContent=index===questions.length-1?"View result →":"Next question →";
  });
  holder.append(choice);
 }
 el("quizResult").textContent="";
 el("quizNext").hidden=true;el("quizRestart").hidden=true;
}
el("quizNext").addEventListener("click",()=>{
 index++;
 if(index<questions.length)renderQuestion();
 else{
  el("questionArea").replaceChildren(make("h3",null,"Completed: "+score+" / "+questions.length+" correct"));
  el("quizResult").textContent="Keep practising. You can try again without losing lives or paying.";
  el("quizNext").hidden=true;el("quizRestart").hidden=false;
 }
});
el("quizRestart").addEventListener("click",()=>{index=0;score=0;renderQuestion();});
el("inputSearch").addEventListener("input",renderInputs);
el("symbolSearch").addEventListener("input",renderSymbols);
el("symbolsLevel").addEventListener("change",renderSymbols);
renderInputs();renderSymbols();renderQuestion();
})();
