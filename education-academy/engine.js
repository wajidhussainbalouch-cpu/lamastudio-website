'use strict';
(()=>{const paper=window.LAMA_PPSC_PAPERS?.[0];if(!paper)return;const $=id=>document.getElementById(id);const key='lama_ppsc_attempt_'+paper.id;let attempt={answers:{},startedAt:Date.now(),submitted:false};try{const old=JSON.parse(localStorage.getItem(key)||'null');if(old&&typeof old==='object'&&old.answers)attempt=old}catch{}
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(attempt))}catch{}};
const escapeHTML=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const container=$('examQuestions');container.innerHTML=paper.questions.map((q,i)=>'<fieldset class="exam-question"><legend><strong>Q'+(i+1)+'.</strong> '+escapeHTML(q.q)+'</legend><small>'+escapeHTML(q.subject)+'</small>'+q.options.map((o,j)=>'<label class="exam-option"><input type="radio" name="'+q.id+'" value="'+j+'" '+(attempt.answers[q.id]===j?'checked':'')+' '+(attempt.submitted?'disabled':'')+'> '+String.fromCharCode(65+j)+'. '+escapeHTML(o)+'</label>').join('')+'</fieldset>').join('');
container.addEventListener('change',e=>{if(attempt.submitted||e.target.type!=='radio')return;attempt.answers[e.target.name]=Number(e.target.value);persist();updateProgress()});
function updateProgress(){const answered=paper.questions.filter(q=>Number.isInteger(attempt.answers[q.id])).length;$('answeredCount').textContent=answered+' / '+paper.questions.length+' answered';$('examProgress').value=answered}
$('examProgress').max=paper.questions.length;
function finish(){if(attempt.submitted)return;attempt.submitted=true;attempt.submittedAt=Date.now();persist();renderResult();container.querySelectorAll('input').forEach(x=>x.disabled=true);$('submitExam').disabled=true}
function renderResult(){if(!attempt.submitted)return;let correct=0;const details=paper.questions.map((q,i)=>{const a=attempt.answers[q.id];if(a===q.answer)correct++;return '<li>Q'+(i+1)+': '+(a===q.answer?'Correct':'Incorrect or unanswered')+' — '+escapeHTML(q.options[q.answer])+'. '+escapeHTML(q.explanation)+'</li>'}).join('');$('examResult').innerHTML='<h3>Score: '+correct+'/'+paper.questions.length+' ('+Math.round(correct/paper.questions.length*100)+'%)</h3><details><summary>Review explanations</summary><ol>'+details+'</ol></details>'}
function remaining(){return Math.max(0,Math.ceil((paper.minutes*60000-(Date.now()-attempt.startedAt))/1000))}
function tick(){if(attempt.submitted){$('timer').textContent='Completed';return}const n=remaining();$('timer').textContent=Math.floor(n/60)+':'+String(n%60).padStart(2,'0');if(!n)finish()}
$('submitExam').addEventListener('click',()=>{if(confirm('Submit this sample paper? You cannot change answers afterward.'))finish()});
$('restartExam').addEventListener('click',()=>{if(!confirm('Restart and clear this local attempt?'))return;localStorage.removeItem(key);location.reload()});
$('printPaper').addEventListener('click',()=>window.print());
$('examTitle').textContent=paper.title+' • '+paper.questions.length+' MCQs';updateProgress();if(attempt.submitted){renderResult();$('submitExam').disabled=true}tick();setInterval(tick,1000);
})();