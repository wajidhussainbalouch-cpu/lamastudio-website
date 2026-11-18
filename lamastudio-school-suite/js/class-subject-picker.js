(function(root){
'use strict';
function norm(x){return root.LamaClassSubjectChoices.norm(x)}
function render(classes,escape){
 return classes.map((item,i)=>{
  const selected=root.LamaSchoolCurriculum.subjects(item.subjects||[]);
  const current=new Set(selected.map(norm));
  const groups=root.LamaClassSubjectChoices.categories(item.name,selected);
  function chip(name){
   const on=current.has(norm(name));
   return '<button type="button" class="subject-pick'+(on?' is-selected':'')+'" data-toggle-subject="'+i+'" data-subject-name="'+escape(name)+'" aria-pressed="'+on+'"><span class="pick-icon" aria-hidden="true">'+(on?'✓':'+')+'</span><span>'+escape(name)+'</span></button>';
  }
  let content='';
  if(item.enabled){
   content+='<input data-sections-index="'+i+'" value="'+escape((item.sections||[]).join(', '))+'" placeholder="Sections: A, B (optional)" maxlength="500" class="w-full bg-slate-800 border border-white/10 rounded-lg p-2" onchange="classSettings['+i+'].sections=this.value.split(\',\').map(x=>x.trim()).filter(Boolean)">';
   content+='<div class="pt-2 border-t border-white/10 space-y-2">';
   content+='<div class="flex justify-between gap-2 flex-wrap items-center"><span class="text-slate-200 text-xs font-black">Tap to select subjects</span><span id="subjectCount-'+i+'" class="class-subjects-summary">'+selected.length+' selected</span></div>';
   content+='<div class="subject-select-grid">'+groups.recommended.map(chip).join('')+'</div>';
   content+='<details class="subject-more" data-more-class="'+i+'"><summary>More subjects — Music, Arabic, SST, Science and others</summary><div class="subject-select-grid">'+groups.more.map(chip).join('')+'</div></details>';
   content+='<div class="subject-tools"><input id="customSubject-'+i+'" maxlength="70" placeholder="Other subject" aria-label="Add subject for '+escape(item.name)+'" class="bg-slate-800 border border-white/20 rounded-lg p-2 text-white"><button type="button" data-add-subject="'+i+'" class="bg-cyan-800 text-white">+ Add &amp; select</button><button type="button" data-clear-subjects="'+i+'" class="bg-slate-700 text-white">Clear selection</button></div>';
   content+='<p class="text-slate-400 text-[11px]">Only green subjects will be saved. Suggested subjects are not selected automatically.</p></div>';
  }
  return '<div class="bg-slate-950/80 border border-white/10 rounded-xl p-3 space-y-2"><label class="flex items-center gap-2"><input type="checkbox" data-class-index="'+i+'" '+(item.enabled?'checked':'')+' onchange="classSettings['+i+'].enabled=this.checked;renderClassSettings()"><span class="font-semibold">'+escape(item.name)+'</span></label>'+content+'</div>';
 }).join('');
}
function bind(container,getClasses,rerender,changed,error){
 container.addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(!button||!container.contains(button))return;
  if(!button.hasAttribute('data-toggle-subject')&&!button.hasAttribute('data-add-subject')&&!button.hasAttribute('data-clear-subjects'))return;
  const i=Number(button.dataset.toggleSubject??button.dataset.addSubject??button.dataset.clearSubjects);
  const item=getClasses()[i];if(!item||!item.enabled)return;
  try{
   if(button.hasAttribute('data-toggle-subject')){
    item.subjects=root.LamaClassSubjectChoices.toggle(item.subjects,button.dataset.subjectName);
    const on=item.subjects.some(s=>norm(s)===norm(button.dataset.subjectName));
    button.classList.toggle('is-selected',on);
    button.setAttribute('aria-pressed',String(on));
    const icon=button.querySelector('.pick-icon');if(icon)icon.textContent=on?'✓':'+';
    const count=container.querySelector('#subjectCount-'+i);if(count)count.textContent=item.subjects.length+' selected';
   }else if(button.hasAttribute('data-add-subject')){
    const name=container.querySelector('#customSubject-'+i)?.value.trim();
    if(!name)throw Error('Enter a subject name first.');
    if(!item.subjects.some(s=>norm(s)===norm(name)))item.subjects=root.LamaClassSubjectChoices.toggle(item.subjects,name);
    rerender();
    const more=container.querySelector('details[data-more-class="'+i+'"]');if(more)more.open=true;
   }else{
    if(item.subjects.length&&!confirm('Clear all subjects for '+item.name+'? This will not be saved until you press Save.'))return;
    item.subjects=[];
    rerender();
   }
   changed('Subject choices changed. Press Save & Broadcast to update school and teacher portals.');
  }catch(ex){error(ex.message||'Unable to change subject.')}
 });
}
root.LamaClassSubjectPicker={render,bind};
})(window);