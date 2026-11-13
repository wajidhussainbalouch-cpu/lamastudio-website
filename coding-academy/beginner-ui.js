/* LAMA beginner learning affordances: on-device only. */
(function(root){
"use strict";
const safe=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ranges=[
 {start:0,end:10,title:"Level 1 · Beginner",description:"Learn words, tags and page basics"},
 {start:10,end:16,title:"Level 2 · Intermediate",description:"CSS and programming logic"},
 {start:16,end:22,title:"Level 3 · Advanced",description:"Forms and mini applications"}
];
let timer=null;
function level(i){return (ranges.find(x=>i>=x.start&&i<x.end)||ranges[ranges.length-1]).title;}
function levels(lessons,progress){
 return '<div class="level-roadmap" aria-label="Three progressive lesson levels">'+ranges.map(r=>{
  const group=lessons.slice(r.start,r.end);
  const done=group.filter(l=>Boolean(progress[l.id])).length;
  const next=lessons.findIndex(l=>!progress[l.id]);
  const active=(next<0?r.start===ranges[ranges.length-1].start:next>=r.start&&next<r.end);
  return '<div class="level-card'+(active?' active':'')+'"><strong>'+safe(r.title)+'</strong><span>'+done+' / '+group.length+' completed</span><span>'+safe(r.description)+'</span></div>';
 }).join('')+'</div>';
}
function glossary(){
 const items=root.LAMA_CODE_COACH?.glossary||[];
 return '<section class="language-101" id="languageGuide"><h2>Before you code: what do these words mean?</h2>'+
 '<p>HTML makes the structure, CSS controls the appearance, and JavaScript adds actions. Python and SQL do other jobs. Tap a word for an example.</p>'+
 '<div class="language-grid">'+items.map((item,i)=>
 '<details'+(i<3?' open':'')+'><summary>'+safe(item.word)+'</summary><p>'+safe(item.simple)+'</p><p class="sample">'+safe(item.example)+'</p></details>'
 ).join('')+'</div></section>';
}
function updateHints(){
 const ed=document.getElementById("editor"),gutter=document.getElementById("lineGutter"),mount=document.getElementById("codeHintSummary");
 if(!ed||!gutter||!mount)return [];
 const issues=root.LAMA_CODE_COACH?root.LAMA_CODE_COACH.analyze(ed.value):[];
 const count=Math.max(1,ed.value.split("\n").length);
 const marked=new Set(issues.map(item=>item.line));
 gutter.innerHTML=Array.from({length:count},(_,i)=>{
  const flagged=marked.has(i+1);
  return '<span class="'+(flagged?'problem':'')+'">'+(i+1)+(flagged?' !':'')+'</span>';
 }).join("");
 gutter.scrollTop=ed.scrollTop;
 mount.innerHTML='<strong>'+(issues.length
 ?issues.length+' coding hint(s) · tap a line to find the problem'
 :'✓ No common typing mistakes detected')+'</strong>'+(issues.length
 ?issues.map(item=>'<button type="button" data-action="jump" data-line="'+item.line+'">Line '+item.line+': '+safe(item.message)+'</button>').join("")
 :'<span class="clean">Run and check your work too. These hints cannot detect every error.</span>');
 return issues;
}
function scheduleHints(){clearTimeout(timer);timer=setTimeout(updateHints,230);}
function jumpToLine(line){
 const ed=document.getElementById("editor");if(!ed)return;
 const parts=ed.value.split("\n"),n=Math.max(1,Math.min(parts.length,Number(line)||1));
 let start=0;
 for(let i=0;i<n-1;i++)start+=parts[i].length+1;
 ed.focus();ed.setSelectionRange(start,start+parts[n-1].length);
 ed.scrollTop=Math.max(0,(n-3)*19.5);
 const gutter=document.getElementById("lineGutter");if(gutter)gutter.scrollTop=ed.scrollTop;
}
root.LAMA_BEGINNER_UI={level,levels,glossary,updateHints,scheduleHints,jumpToLine};
})(typeof window!=="undefined"?window:globalThis);
