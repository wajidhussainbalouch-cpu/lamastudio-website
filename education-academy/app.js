'use strict';
const questions=[
 {q:'Who developed the theory of cognitive development?',options:['B. F. Skinner','Jean Piaget','Ivan Pavlov','John Watson'],answer:1,why:'Piaget described stages of cognitive development.'},
 {q:'Which assessment is used during instruction to improve learning?',options:['Summative','Formative','Final examination','Certification'],answer:1,why:'Formative assessment gives feedback during learning.'},
 {q:'Which leadership style encourages shared decision-making?',options:['Autocratic','Authoritarian','Democratic','Coercive'],answer:2,why:'Democratic leadership involves participants in decisions.'}
];
const $=id=>document.getElementById(id);
const safeRead=()=>{try{return JSON.parse(localStorage.getItem('lama_ppsc_plan_v1')||'{}')}catch{return {}}};
const saved=safeRead();['examDate','hours','post'].forEach(id=>{if(saved[id])$(id).value=saved[id]});
function updatePlan(){const value=$('examDate').value;if(!value){$('plan').textContent='Choose your target exam date to generate a schedule.';return}const date=new Date(value+'T12:00:00');const now=new Date();const days=Math.ceil((date-now)/86400000);if(!Number.isFinite(days)||days<1){$('plan').textContent='Please choose a future examination date.';return}const hours=Number($('hours').value);const concept=Math.floor(days*.5),practice=Math.floor(days*.3),mock=days-concept-practice;$('plan').textContent=days+' days • '+(days*hours)+' available study hours. Concept study: '+concept+' days; practice/revision: '+practice+' days; final mock tests: '+mock+' days. This is a suggested plan, not an official schedule.'}
['examDate','hours','post'].forEach(id=>$(id).addEventListener('change',updatePlan));
$('savePlan').addEventListener('click',()=>{try{localStorage.setItem('lama_ppsc_plan_v1',JSON.stringify(Object.fromEntries(['examDate','hours','post'].map(id=>[id,$(id).value]))));$('plan').textContent+=' Saved locally.'}catch{$('plan').textContent+=' Device storage unavailable.'}});
const root=$('questions');questions.forEach((item,i)=>{const field=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent=(i+1)+'. '+item.q;field.append(legend);item.options.forEach((option,j)=>{const label=document.createElement('label');label.className='option';const radio=document.createElement('input');radio.type='radio';radio.name='q'+i;radio.value=String(j);label.append(radio,document.createTextNode(' '+String.fromCharCode(65+j)+'. '+option));field.append(label)});root.append(field)});
$('submit').addEventListener('click',()=>{let score=0;const lines=questions.map((item,i)=>{const chosen=document.querySelector('input[name="q'+i+'"]:checked');const correct=chosen&&Number(chosen.value)===item.answer;if(correct)score++;return 'Q'+(i+1)+': '+(correct?'Correct':'Incorrect / unanswered')+'. Answer: '+item.options[item.answer]+'. '+item.why});$('feedback').textContent='Score: '+score+'/'+questions.length+'\n'+lines.join('\n')});
$('print').addEventListener('click',()=>window.print());updatePlan();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
