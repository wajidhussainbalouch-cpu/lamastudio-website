/* LAMA Coding Academy — industry practice labs. No cloud account, keys or third-party runtimes. */
(function(){
'use strict';
const STORAGE_KEY='lama-coding-practice-v2';
const datasets={
  students:[
    {name:'Amina',class:3,attendance:95},
    {name:'Bilal',class:4,attendance:84},
    {name:'Hira',class:3,attendance:91},
    {name:'Danish',class:5,attendance:78},
    {name:'Sara',class:3,attendance:99},
    {name:'Raza',class:4,attendance:87}
  ],
  inventory:[
    {item:'Notebooks',quantity:25},
    {item:'Pens',quantity:8},
    {item:'Markers',quantity:4},
    {item:'Folders',quantity:17},
    {item:'Erasers',quantity:6}
  ],
  fees:[
    {student:'Amina',amount:600,status:'paid'},
    {student:'Bilal',amount:500,status:'pending'},
    {student:'Hira',amount:700,status:'paid'},
    {student:'Sara',amount:550,status:'paid'}
  ]
};
const tracks={
js:{title:'JavaScript',kind:'executed',lessons:[
  {id:'js-fee',title:'Calculate a monthly fee',context:'School billing systems need repeatable, correct arithmetic.',task:'Write totalFee(monthly, months). Return the monthly fee multiplied by months.',starter:'function totalFee(monthly, months) {\n  // Return the correct total\n}\n',hint:'return monthly * months;',tests:[
    ['Two months', 'totalFee(500, 2) === 1000'],
    ['No months', 'totalFee(600, 0) === 0'],
    ['Different inputs', 'totalFee(350, 3) === 1050']
  ]},
  {id:'js-attendance',title:'Find attendance percentage',context:'School dashboards must handle a class with zero enrollment.',task:'Write attendanceRate(present, total). Return 0 when total is 0; otherwise return the percentage rounded to a whole number.',starter:'function attendanceRate(present, total) {\n  // Handle zero, then use Math.round\n}\n',hint:'if (total === 0) return 0; then Math.round(present / total * 100)',tests:[
    ['All present','attendanceRate(20, 20) === 100'],
    ['Some present','attendanceRate(9, 12) === 75'],
    ['No enrolled students','attendanceRate(0, 0) === 0']
  ]},
  {id:'js-passing',title:'Decide a passing grade',context:'A gradebook uses clear and testable rules.',task:'Write hasPassed(score) to return true for scores 50 or higher, otherwise false.',starter:'function hasPassed(score) {\n  // Make this return a boolean\n}\n',hint:'Use return score >= 50;',tests:[
    ['Just below threshold','hasPassed(49) === false'],
    ['Boundary threshold','hasPassed(50) === true'],
    ['High score','hasPassed(91) === true']
  ]},
  {id:'js-stock',title:'Find low-stock items',context:'Stores and school offices need restocking alerts.',task:'Write lowStock(items), returning an array of item names when quantity is below 10. Preserve the original order.',starter:'function lowStock(items) {\n  // Filter items then map them to names\n}\n',hint:'items.filter(item => item.quantity < 10).map(item => item.name)',tests:[
    ['Select low stock','JSON.stringify(lowStock([{name:"Pens",quantity:4},{name:"Books",quantity:20}])) === JSON.stringify(["Pens"])'],
    ['Empty list','JSON.stringify(lowStock([])) === "[]"'],
    ['Ordering','JSON.stringify(lowStock([{name:"A",quantity:9},{name:"B",quantity:10},{name:"C",quantity:0}])) === JSON.stringify(["A","C"])']
  ]},
  {id:'js-search',title:'Search student names',context:'An attendance app should find names regardless of uppercase/lowercase input.',task:'Write searchStudents(names, keyword) to return matching names, ignoring letter case.',starter:'function searchStudents(names, keyword) {\n  // Try .filter(), .toLowerCase() and .includes()\n}\n',hint:'return names.filter(name => name.toLowerCase().includes(keyword.toLowerCase()));',tests:[
    ['Case insensitive','JSON.stringify(searchStudents(["Amina","Bilal","SARA"],"a")) === JSON.stringify(["Amina","Bilal","SARA"])'],
    ['No matches','JSON.stringify(searchStudents(["Ali","Sara"],"xyz")) === "[]"'],
    ['Partial match','JSON.stringify(searchStudents(["Wajid","Zaid","Hamid"],"id")) === JSON.stringify(["Wajid","Zaid","Hamid"])']
  ]},
  {id:'js-label',title:'Format a student record',context:'Readable records make admin dashboards easier to use.',task:'Write studentLabel(student) that returns Name + " — Class " + className. For example: Amina — Class 3.',starter:'function studentLabel(student) {\n  // Produce a readable label from the object\n}\n',hint:'return student.name + " — Class " + student.className;',tests:[
    ['Class 3','studentLabel({name:"Amina",className:"3"}) === "Amina — Class 3"'],
    ['Nursery','studentLabel({name:"Bilal",className:"Nursery"}) === "Bilal — Class Nursery"'],
    ['No hard-coded name','studentLabel({name:"Sara",className:"4"}) === "Sara — Class 4"']
  ]}
]},
sql:{title:'SQL',kind:'simulator',lessons:[
  {id:'sql-select',title:'Select student columns',context:'A school admin needs a simple list of student names and classes.',task:'Select only name and class from students, preserving row order.',starter:'SELECT name FROM students;',target:'SELECT name, class FROM students;',hint:'SELECT name, class FROM students;',table:'students'},
  {id:'sql-filter',title:'Find Class 3 students',context:'Filter a large school register by class.',task:'Select only the name column for students whose class is 3.',starter:'SELECT name FROM students;',target:'SELECT name FROM students WHERE class = 3;',hint:'WHERE class = 3 filters records.',table:'students'},
  {id:'sql-order',title:'Rank attendance',context:'Administrators often sort reports to review progress.',task:'Select name and attendance, ordered from highest attendance to lowest.',starter:'SELECT name, attendance FROM students;',target:'SELECT name, attendance FROM students ORDER BY attendance DESC;',hint:'ORDER BY attendance DESC sorts high to low.',table:'students'},
  {id:'sql-stock',title:'Identify items to restock',context:'Store inventory needs a list of supplies below the restock threshold.',task:'Select item and quantity where quantity is less than 10.',starter:'SELECT item, quantity FROM inventory;',target:'SELECT item, quantity FROM inventory WHERE quantity < 10;',hint:'WHERE quantity < 10',table:'inventory'},
  {id:'sql-count',title:'Count students in a class',context:'Reports need class totals without listing every student.',task:'Count Class 3 students and name the output column total.',starter:'SELECT COUNT(*) AS total FROM students;',target:'SELECT COUNT(*) AS total FROM students WHERE class = 3;',hint:'SELECT COUNT(*) AS total ...',table:'students'},
  {id:'sql-sum',title:'Calculate paid fees',context:'Finance summaries add only completed payments.',task:'Return the total paid fee amount as a column named total.',starter:"SELECT SUM(amount) AS total FROM fees;",target:"SELECT SUM(amount) AS total FROM fees WHERE status = 'paid';",hint:"Use SUM(amount) AS total with WHERE status = 'paid'.",table:'fees'}
]},
python:{title:'Python',kind:'syntax',lessons:[
  {id:'py-print',title:'Display a welcome message',context:'Programs often start by printing information.',task:'Print exactly: Hello, Developer!',starter:'# Start by printing a message\n',hint:'print("Hello, Developer!")',sample:'Hello, Developer!',checks:[[/\bprint\s*\(\s*["']Hello,\s*Developer!["']\s*\)/,'Use print() with the exact message.']]},
  {id:'py-variable',title:'Store a learner name',context:'Variables let the same program work with changing data.',task:'Set name to "Amina" and print the variable name.',starter:'# Create a name variable and print it\n',hint:'name = "Amina"\nprint(name)',sample:'Amina',checks:[[/\bname\s*=\s*["']Amina["']/,'Assign the name Amina.'],[/\bprint\s*\(\s*name\s*\)/,'Print the name variable.']]},
  {id:'py-function',title:'Define a reusable calculation',context:'Billing, grades and data tools use reusable functions.',task:'Define total(price, qty) and return price * qty.',starter:'def total(price, qty):\n    # Replace this comment with a return statement\n',hint:'    return price * qty',sample:'total(200,3) → 600',checks:[[/def\s+total\s*\(\s*price\s*,\s*qty\s*\)\s*:/,'Define a function with the requested parameters.'],[/^\s+return\s+price\s*\*\s*qty\s*(?:#.*)?$/m,'Return price * qty with indentation.']]},
  {id:'py-condition',title:'Write a passing rule',context:'Conditional statements apply a clear business rule.',task:'Use if score >= 50: to print "Pass" on the next indented line.',starter:'score = 70\n# Add your if statement\n',hint:'if score >= 50:\n    print("Pass")',sample:'Pass',checks:[[/if\s+score\s*>=\s*50\s*:/,'Add the requested if condition.'],[/^\s+print\s*\(\s*["']Pass["']\s*\)/m,'Print Pass on an indented line.']]},
  {id:'py-loop',title:'Loop over a skills list',context:'Programs process lists of students, files and products.',task:'Create skills = ["HTML", "CSS"] and print each skill using for skill in skills:.',starter:'# Build and loop over a list\n',hint:'skills = ["HTML", "CSS"]\nfor skill in skills:\n    print(skill)',sample:'HTML\nCSS',checks:[[/skills\s*=\s*\[\s*["']HTML["']\s*,\s*["']CSS["']\s*\]/,'Create the requested list.'],[/for\s+skill\s+in\s+skills\s*:/,'Add a for loop.'],[/^\s+print\s*\(\s*skill\s*\)/m,'Print each skill with indentation.']]},
  {id:'py-dictionary',title:'Read a student score',context:'Dictionaries organize records by keys.',task:'Create scores = {"Amina": 85} and print scores["Amina"].',starter:'# Create a dictionary and read a key\n',hint:'scores = {"Amina": 85}\nprint(scores["Amina"])',sample:'85',checks:[[/scores\s*=\s*\{\s*["']Amina["']\s*:\s*85\s*\}/,'Create the dictionary.'],[/print\s*\(\s*scores\s*\[\s*["']Amina["']\s*\]\s*\)/,'Print Amina’s score.']]}
]}
};
const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh=()=>({drafts:{},passed:{},track:'js',selected:{js:'js-fee',sql:'sql-select',python:'py-print'}});
function load(){try{
  const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(!x||typeof x!=='object')return fresh();
  return {drafts:x.drafts&&typeof x.drafts==='object'?x.drafts:{},passed:x.passed&&typeof x.passed==='object'?x.passed:{},track:tracks[x.track]?x.track:'js',selected:x.selected&&typeof x.selected==='object'?x.selected:fresh().selected};
}catch(e){return fresh();}}
let state=load(),running=false,runTimeout=null,activeFrame=null,activeToken=null;
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){const el=document.getElementById('result');if(el){el.className='result failure';el.textContent='Browser storage is unavailable. Your drafts may not survive a refresh.';}}}
const lessons=()=>tracks[state.track].lessons;
function selected(){return lessons().find(x=>x.id===state.selected[state.track])||lessons()[0];}
function lessonCount(t){return tracks[t].lessons.filter(l=>state.passed[l.id]===true).length;}
function render(){
  for(const tab of document.querySelectorAll('[data-track]')){
    const active=tab.dataset.track===state.track;
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
  }
  document.getElementById('work').setAttribute('aria-labelledby','tab-'+state.track);
  document.getElementById('stats').innerHTML=Object.keys(tracks).map(k=>'<span>'+safe(tracks[k].title)+': <span class="counter">'+lessonCount(k)+'/'+tracks[k].lessons.length+'</span> completed</span>').join(' · ');
  document.getElementById('challengeMenu').innerHTML=lessons().map((l,i)=>'<button type="button" data-challenge="'+safe(l.id)+'" '+(l.id===selected().id?'aria-current="step"':'')+'><small>Challenge '+(i+1)+'</small><b class="'+(state.passed[l.id]?'passed':'')+'">'+safe(l.title)+'</b></button>').join('');
  const l=selected(),t=tracks[state.track];
  const guidance=t.kind==='executed'
    ? 'Your JavaScript runs in a restricted sandboxed preview with local test inputs. Code tests offer feedback, not a professional security review.'
    : t.kind==='simulator'
    ? 'This SQL lab runs a small read-only SELECT learning simulator over sample data, not a real SQL database. Use a real SQLite or PostgreSQL engine before deploying industry software.'
    : 'This is Python syntax practice only. The code is <strong>not executed</strong>. Passing means recognizable teaching patterns were found, not that the code is valid or produces the shown output.';
  const dbSection=t.kind==='simulator'?'<h3>Available example data: '+safe(l.table)+'</h3>'+table(datasets[l.table]):'';
  document.getElementById('challengeContent').innerHTML=
    '<section class="card"><span class="stage">'+safe(t.title)+' · '+safe(t.kind)+'</span><h2>'+safe(l.title)+'</h2><p>'+safe(l.context)+'</p><p class="task"><b>Your mission:</b> '+safe(l.task)+'</p><details><summary style="cursor:pointer;color:var(--mint)">Need a hint?</summary><pre style="white-space:pre-wrap;color:#c6ead9">'+safe(l.hint)+'</pre></details></section>'+
    '<section class="card"><div class="lab"><div><h3>Your code</h3><label for="codeArea" style="color:var(--muted);display:block;margin-bottom:8px">Edit the example before checking</label><textarea id="codeArea" class="editor" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-label="'+safe(t.title)+' code editor"></textarea></div><div class="demo"><h3>'+(t.kind==='simulator'?'Sample tables':t.kind==='syntax'?'Expected teaching output':'Tests to pass')+'</h3>'+
    (t.kind==='executed'?'<ul>'+l.tests.map(x=>'<li>'+safe(x[0])+'</li>').join('')+'</ul>':t.kind==='syntax'?'<pre>'+safe(l.sample)+'</pre>':dbSection)+
    '</div></div><div class="btns"><button class="btn primary" id="testBtn" type="button">'+(t.kind==='executed'?'▶ Run code & tests':t.kind==='syntax'?'✓ Check Python patterns':'▶ Run SQL query')+'</button><button class="btn" id="downloadBtn" type="button">↓ Download my code</button><button class="btn" id="restoreBtn" type="button">Restore example</button></div><p class="note">'+guidance+'</p><div id="result" role="status" aria-live="polite"></div></section>'+
    '<div class="btns" style="justify-content:space-between"><button class="btn" id="prevBtn" type="button">← Previous</button><button class="btn primary" id="nextBtn" type="button">Next challenge →</button></div>';
  const area=document.getElementById('codeArea');
  area.value=typeof state.drafts[l.id]==='string'?state.drafts[l.id]:l.starter;
  area.addEventListener('input',()=>{state.drafts[l.id]=area.value;save();});
  document.getElementById('testBtn').addEventListener('click',evaluate);
  document.getElementById('downloadBtn').addEventListener('click',download);
  document.getElementById('restoreBtn').addEventListener('click',()=>{
    if(!confirm('Replace your edited code with this challenge’s example?'))return;
    area.value=l.starter;state.drafts[l.id]=area.value;save();show('Example restored. Edit the code to complete the task.',false);
  });
  const idx=lessons().indexOf(l),prev=document.getElementById('prevBtn'),next=document.getElementById('nextBtn');
  prev.disabled=idx===0;next.disabled=idx===lessons().length-1;
  prev.onclick=()=>choose(lessons()[idx-1].id);
  next.onclick=()=>choose(lessons()[idx+1].id);
}
function choose(id){if(running)return;if(!lessons().some(l=>l.id===id))return;state.selected[state.track]=id;save();render();document.getElementById('work').scrollIntoView({behavior:'auto',block:'start'});}
function table(rows){if(!rows.length)return '<p>No records.</p>';const cols=Object.keys(rows[0]);return '<div class="tablewrap"><table><thead><tr>'+cols.map(c=>'<th>'+safe(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+cols.map(c=>'<td>'+safe(r[c]===null?'NULL':r[c])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function show(msg,success,extra=''){const out=document.getElementById('result');if(!out)return;out.className='result '+(success?'success':'failure');out.textContent=msg;if(extra)out.insertAdjacentHTML('beforeend',extra);}
function passed(){state.passed[selected().id]=true;save();const b=document.querySelector('[data-challenge="'+selected().id+'"] b');if(b)b.classList.add('passed');document.getElementById('stats').innerHTML=Object.keys(tracks).map(k=>'<span>'+safe(tracks[k].title)+': <span class="counter">'+lessonCount(k)+'/'+tracks[k].lessons.length+'</span> completed</span>').join(' · ');}
function evaluate(){
  if(running)return;
  const l=selected(),code=document.getElementById('codeArea').value;state.drafts[l.id]=code;save();
  if(code.length>6000){show('Please keep each beginner solution under 6,000 characters.',false);return;}
  if(state.track==='js')runJavaScript(l,code);
  else if(state.track==='sql')runSqlLesson(l,code);
  else checkPython(l,code);
}
function runJavaScript(l,code){
  running=true;document.getElementById('testBtn').disabled=true;
  const token='lca-'+Date.now()+'-'+Math.random().toString(36).slice(2);activeToken=token;
  const scriptTests=l.tests.map(([label,expression])=>
    'try{var ok=Boolean(('+expression+'));results.push({label:'+JSON.stringify(label)+',ok:ok,details:ok?"": "Unexpected result"});}catch(e){results.push({label:'+JSON.stringify(label)+',ok:false,details:String(e&&e.message||e).slice(0,120)});}').join('\n');
  const harness='var results=[];\n'+scriptTests+'\nparent.postMessage({scope:"lama-coding-js-test",token:'+JSON.stringify(token)+',results:results},"*");';
  const policy='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; connect-src \'none\'; img-src data:; form-action \'none\'; base-uri \'none\';">';
  const frame=document.createElement('iframe');
  frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');frame.style.display='none';
  frame.title='Sandboxed practice test';
  activeFrame=frame;
  // Escape HTML script end tags in learner input; malformed learner code still only runs within the isolated sandbox.
  const scrub=code.replace(/<\s*\/\s*script/gi,'<\\/script');
  frame.srcdoc='<!doctype html><html><head>'+policy+'</head><body><script>'+scrub+'<\/script><script>'+harness+'<\/script></body></html>';
  document.body.appendChild(frame);
  runTimeout=setTimeout(()=>finishRun('No test result was received. Check for syntax errors or a long-running loop, then retry.',false),4500);
  show('Running in a restricted frame…',false);
}
function finishRun(message,ok){
  clearTimeout(runTimeout);runTimeout=null;
  if(activeFrame){activeFrame.remove();activeFrame=null;}
  activeToken=null;running=false;
  const btn=document.getElementById('testBtn');if(btn)btn.disabled=false;
  if(message)show(message,ok);
}
window.addEventListener('message',(event)=>{
  if(!activeFrame||event.source!==activeFrame.contentWindow||!event.data||event.data.scope!=='lama-coding-js-test'||event.data.token!==activeToken)return;
  const tests=event.data.results;
  if(!Array.isArray(tests)||tests.length!==selected().tests.length){finishRun('The tests did not return a complete result.',false);return;}
  const all=tests.every(x=>x&&x.ok===true);
  const detail=tests.map(x=>(x.ok?'✓ ':'✗ ')+x.label+(x.details?' — '+x.details:'')).join('\n');
  finishRun((all?'All tests passed!':'Keep improving your solution:')+'\n'+detail,all);
  if(all)passed();
});
function runSqlLesson(l,code){
  let actual,expected;
  try{actual=executeSql(code);expected=executeSql(l.target);}
  catch(err){show('SQL practice error: '+String(err.message||err),false);return;}
  const ok=JSON.stringify(actual)===JSON.stringify(expected);
  show(ok?'Correct result! Your query returned the requested data.':'The query ran, but this result is different from the task. Compare the rows and column names.',ok,'<div style="margin-top:12px"><b>Your result</b>'+table(actual)+'</div>');
  if(ok)passed();
}
function checkPython(l,code){
  const errors=l.checks.filter(c=>!c[0].test(code)).map(c=>c[1]);
  // No claim to parse or execute Python; these are deliberately simple teaching pattern checks.
  if(errors.length){show('Review these syntax goals:\n• '+errors.join('\n• '),false);return;}
  show('Syntax-pattern goals found ✓\nNext: run this code in a real Python interpreter to verify behavior, indentation and edge cases.',true);
  passed();
}
function sqlValue(raw){if(/^'.*'$/.test(raw))return raw.slice(1,-1).replace(/''/g,"'");const n=Number(raw);if(!Number.isFinite(n))throw Error('Use a number or a single-quoted text value.');return n;}
function executeSql(query){
  const source=query.trim().replace(/;\s*$/,'');
  if(source.length>1600)throw Error('Query is too long.');
  if(/[;]|--|\/\*|\*\//.test(source))throw Error('Only one read-only SELECT statement is supported.');
  const q=source.replace(/\s+/g,' ').trim();
  const m=q.match(/^SELECT\s+(.+?)\s+FROM\s+(students|inventory|fees)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i);
  if(!m)throw Error('Use SELECT columns FROM table, optionally with one WHERE, ORDER BY or LIMIT. This is a small teaching subset.');
  const tableName=m[2].toLowerCase(),tableData=datasets[tableName];
  const columns=Object.keys(tableData[0]);
  let rows=tableData.slice();
  if(m[3]){
    const where=m[3].match(/^(\w+)\s*(>=|<=|=|>|<)\s*('(?:[^']|'')*'|-?\d+(?:\.\d+)?)$/i);
    if(!where)throw Error('WHERE supports one comparison, such as class = 3 or status = \'paid\'.');
    const col=where[1].toLowerCase();
    if(!columns.includes(col))throw Error('Unknown WHERE column: '+col);
    const target=sqlValue(where[3]),op=where[2];
    rows=rows.filter(row=>{
      const v=row[col];
      if(typeof v!==typeof target)return false;
      switch(op){case '=':return v===target;case '>':return v>target;case '<':return v<target;case '>=':return v>=target;case '<=':return v<=target;default:return false;}
    });
  }
  if(m[4]){
    const col=m[4].toLowerCase();
    if(!columns.includes(col))throw Error('Unknown ORDER BY column: '+col);
    const descending=String(m[5]||'').toUpperCase()==='DESC';
    rows.sort((a,b)=>{const x=a[col],y=b[col];const cmp=typeof x==='string'?x.localeCompare(y):x-y;return descending?-cmp:cmp;});
  }
  if(m[6]!==undefined){const limit=Number(m[6]);if(limit>100)throw Error('LIMIT must be at most 100 in this lab.');rows=rows.slice(0,limit);}
  const clause=m[1].trim();
  const aggregate=clause.match(/^(COUNT\(\*\)|SUM\((\w+)\)|AVG\((\w+)\))\s+AS\s+(\w+)$/i);
  if(aggregate){
    const kind=aggregate[1].toUpperCase(),column=(aggregate[2]||aggregate[3]||'').toLowerCase(),alias=aggregate[4].toLowerCase();
    if(kind!=='COUNT(*)'&&!columns.includes(column))throw Error('Unknown aggregate column: '+column);
    if(kind!=='COUNT(*)'&&typeof tableData[0][column]!=='number')throw Error('SUM/AVG requires numeric data.');
    let value=kind==='COUNT(*)'?rows.length:rows.reduce((sum,row)=>sum+row[column],0);
    if(kind.startsWith('AVG'))value=rows.length?value/rows.length:null;
    return [{[alias]:value}];
  }
  const selected=clause==='*'?columns:clause.split(',').map(c=>c.trim().toLowerCase());
  if(!selected.length||selected.some(c=>!columns.includes(c)))throw Error('One or more SELECT columns were not found in '+tableName+'.');
  if(new Set(selected).size!==selected.length)throw Error('Select each column only once.');
  return rows.map(row=>Object.fromEntries(selected.map(c=>[c,row[c]])));
}
function download(){
  const l=selected(),content=document.getElementById('codeArea').value,ext=state.track==='js'?'js':state.track==='python'?'py':'sql';
  const blob=new Blob([content],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=l.id+'.'+ext;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
for(const b of document.querySelectorAll('[data-track]')){
  b.addEventListener('click',()=>{
    if(running)return;state.track=b.dataset.track;save();render();
  });
}
document.getElementById('challengeMenu').addEventListener('click',e=>{
  const btn=e.target.closest('[data-challenge]');if(btn)choose(btn.dataset.challenge);
});
render();
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
})();