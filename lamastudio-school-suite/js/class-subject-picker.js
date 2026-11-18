/* LAMA School Suite — optional mobile subject selections and per-school name editing.
 * Study-group tabs only change suggestions, NEVER select or store subjects themselves.
 */
(function(root){
'use strict';
const groupViews=Object.create(null),expanded=Object.create(null);
const norm=x=>root.LamaClassSubjectChoices.norm(x);
function chosenList(item,i,escape){
 const values=root.LamaSchoolCurriculum.subjects(item.subjects||[]);
 return values.length?values.map((subject,n)=>
  '<div class="selected-subject-row" data-selected-row="'+i+'">'
  +'<div class="selected-subject-label"><span class="selected-tick">✓</span><strong>'+escape(subject)+'</strong></div>'
  +'<div class="selected-subject-actions"><button type="button" class="subject-edit-btn" data-edit-subject="'+i+'" data-selected-index="'+n+'" aria-label="Edit '+escape(subject)+' name">✎ Edit</button>'
  +'<button type="button" class="subject-remove-btn" data-remove-subject="'+i+'" data-selected-index="'+n+'" aria-label="Remove '+escape(subject)+'">×</button></div>'
  +'<div class="subject-rename-panel" data-rename-panel="'+i+'" data-selected-index="'+n+'" hidden>'
  +'<label class="text-xs text-slate-200" for="renameSubject-'+i+'-'+n+'">New name for '+escape(subject)+'</label>'
  +'<div class="subject-rename-actions"><input id="renameSubject-'+i+'-'+n+'" type="text" data-rename-input="'+i+'" data-selected-index="'+n+'" value="'+escape(subject)+'" maxlength="70">'
  +'<button type="button" data-save-rename="'+i+'" data-selected-index="'+n+'">Save name</button>'
  +'<button type="button" data-cancel-rename="'+i+'" data-selected-index="'+n+'">Cancel</button></div>'
  +'<small>Changes this class only. Previous saved homework can still match the old name.</small></div>'
  +'</div>'
 ).join(''):'<p class="text-slate-400 text-xs">No subjects selected yet. Tap a subject below.</p>';
}
function render(classes,escape){
 return classes.map((item,i)=>{
  const selected=root.LamaSchoolCurriculum.subjects(item.subjects||[]);
  const current=new Set(selected.map(norm));
  const availableGroups=root.LamaClassSubjectChoices.groupsFor(item.name);
  const view=groupViews[i]||availableGroups[0]?.id||'';
  const groups=root.LamaClassSubjectChoices.categories(item.name,selected,view);
  // A renamed catalog entry must not appear twice under its former and new names.
  const previousNames=new Set(Object.values(item.aliases||{}).flatMap(a=>Array.isArray(a)?a:[]).map(norm));
  function chip(name){
   const on=current.has(norm(name));
   return '<button type="button" class="subject-pick'+(on?' is-selected':'')+'" data-toggle-subject="'+i+'" data-subject-name="'+escape(name)+'" aria-pressed="'+on+'"><span class="pick-icon" aria-hidden="true">'+(on?'✓':'+')+'</span><span>'+escape(name)+'</span></button>';
  }
  const visible=names=>names.filter(name=>!previousNames.has(norm(name)));
  let content='';
  if(item.enabled){
   content+='<input data-sections-index="'+i+'" value="'+escape((item.sections||[]).join(', '))+'" placeholder="Sections: A, B (optional)" maxlength="500" class="w-full bg-slate-800 border border-white/10 rounded-lg p-2" onchange="classSettings['+i+'].sections=this.value.split(\',\').map(x=>x.trim()).filter(Boolean)">';
   content+='<div class="pt-2 border-t border-white/10 space-y-3">';
   content+='<div class="flex justify-between gap-2 flex-wrap items-center"><span class="text-slate-200 text-xs font-black">Subjects for this class</span><span id="subjectCount-'+i+'" class="class-subjects-summary">'+selected.length+' selected</span></div>';
   content+='<div class="selected-subject-list" id="selectedSubjects-'+i+'">'+chosenList(item,i,escape)+'</div>';
   if(availableGroups.length){
    content+='<div class="stream-picker"><p class="text-slate-300 text-xs font-bold">Study group suggestions (view only)</p><div class="stream-tab-list">'
       +availableGroups.map(g=>'<button type="button" data-view-group="'+i+'" data-group-id="'+escape(g.id)+'" class="stream-tab'+(g.id===view?' active':'')+'" aria-pressed="'+(g.id===view)+'">'+escape(g.name)+'</button>').join('')
       +'</div><small class="text-slate-400">Switching groups changes the suggestions only. Tap each subject to select it; subject combinations must follow your board and academic session.</small></div>';
   }
   content+='<div class="space-y-2"><p class="text-slate-200 text-xs font-black">Tap subjects to select / unselect</p><div class="subject-select-grid">'+visible(groups.recommended).map(chip).join('')+'</div></div>';
   content+='<details class="subject-more" data-more-class="'+i+'"'+(expanded[i]?' open':'')+'><summary>More optional subjects — browse all subjects</summary><div class="subject-select-grid">'+visible(groups.more).map(chip).join('')+'</div></details>';
   content+='<div class="subject-tools"><input id="customSubject-'+i+'" maxlength="70" placeholder="Other subject name" aria-label="Add a subject for '+escape(item.name)+'" class="bg-slate-800 border border-white/20 rounded-lg p-2 text-white"><button type="button" data-add-subject="'+i+'" class="bg-cyan-800 text-white">+ Add &amp; select</button><button type="button" data-clear-subjects="'+i+'" class="bg-slate-700 text-white">Clear selection</button></div>';
   content+='<p class="text-slate-400 text-[11px]">Only green selected subjects are saved. Tap ✎ Edit beside a selected subject to rename it for this school/class.</p></div>';
  }
  return '<div class="bg-slate-950/80 border border-white/10 rounded-xl p-3 space-y-2">'
    +'<label class="flex items-center gap-2"><input type="checkbox" data-class-index="'+i+'" '+(item.enabled?'checked':'')+' onchange="classSettings['+i+'].enabled=this.checked;renderClassSettings()"><span class="font-semibold">'+escape(item.name)+'</span></label>'
    +content+'</div>';
 }).join('');
}
function bind(container,getClasses,rerender,changed,error){
 const byIndex=(b)=>{const i=Number(b.dataset.toggleSubject??b.dataset.addSubject??b.dataset.clearSubjects??b.dataset.viewGroup??b.dataset.editSubject??b.dataset.saveRename??b.dataset.cancelRename??b.dataset.removeSubject);return {i,item:getClasses()[i]}};
 const isSelected=(item,name)=>item.subjects.some(s=>norm(s)===norm(name));
 function updateSelected(i,item){
  const el=container.querySelector('#selectedSubjects-'+i);
  if(el)el.innerHTML=chosenList(item,i,escapeText);
  const count=container.querySelector('#subjectCount-'+i);
  if(count)count.textContent=item.subjects.length+' selected';
  const chips=container.querySelectorAll('[data-toggle-subject="'+i+'"]');
  chips.forEach(chip=>{
   const on=isSelected(item,chip.dataset.subjectName);
   chip.classList.toggle('is-selected',on);
   chip.setAttribute('aria-pressed',String(on));
   const mark=chip.querySelector('.pick-icon');if(mark)mark.textContent=on?'✓':'+';
  });
 }
 let escapeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 container.addEventListener('toggle',event=>{
  const d=event.target;
  if(d&&d.matches?.('details[data-more-class]'))expanded[Number(d.dataset.moreClass)]=d.open;
 },true);
 container.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button||!container.contains(button))return;
  const valid=['toggleSubject','addSubject','clearSubjects','viewGroup','editSubject','saveRename','cancelRename','removeSubject'].some(k=>Object.prototype.hasOwnProperty.call(button.dataset,k));
  if(!valid)return;
  const {i,item}=byIndex(button);
  if(!item?.enabled)return;
  try{
   if(button.hasAttribute('data-view-group')){
    const groups=root.LamaClassSubjectChoices.groupsFor(item.name);
    if(!groups.some(g=>g.id===button.dataset.groupId))throw Error('Invalid study group.');
    groupViews[i]=button.dataset.groupId;
    rerender();
    return; // Switching group does NOT select or save any subjects.
   }
   if(button.hasAttribute('data-toggle-subject')){
    item.subjects=root.LamaClassSubjectChoices.toggle(item.subjects,button.dataset.subjectName);
    if(item.aliases&&!isSelected(item,button.dataset.subjectName))delete item.aliases[button.dataset.subjectName];
    updateSelected(i,item);
   }else if(button.hasAttribute('data-add-subject')){
    const name=container.querySelector('#customSubject-'+i)?.value.trim();
    if(!name)throw Error('Enter a subject name first.');
    if(!isSelected(item,name))item.subjects=root.LamaClassSubjectChoices.toggle(item.subjects,name);
    expanded[i]=true;rerender();
   }else if(button.hasAttribute('data-clear-subjects')){
    if(item.subjects.length&&!confirm('Unselect all subjects in '+item.name+'? This is not saved until you press Save.'))return;
    item.subjects=[];item.aliases={};rerender();
   }else if(button.hasAttribute('data-edit-subject')||button.hasAttribute('data-cancel-rename')){
    const idx=Number(button.dataset.selectedIndex);
    const row=button.closest('[data-selected-row]');
    const panel=row?.querySelector('[data-rename-panel]');
    if(!panel||idx<0||idx>=item.subjects.length)return;
    const editing=button.hasAttribute('data-edit-subject');
    panel.hidden=!editing;
    if(editing){const input=panel.querySelector('input[data-rename-input]');input?.focus();input?.select()}
    return;
   }else if(button.hasAttribute('data-save-rename')){
    const idx=Number(button.dataset.selectedIndex);
    const oldName=item.subjects[idx],panel=button.closest('[data-rename-panel]');
    const value=panel?.querySelector('input[data-rename-input]')?.value.trim();
    if(!oldName)throw Error('Selected subject is unavailable. Reload Settings.');
    root.LamaClassSubjectChoices.rename(item,oldName,value);
    rerender();
   }else if(button.hasAttribute('data-remove-subject')){
    const index=Number(button.dataset.selectedIndex),name=item.subjects[index];
    if(!name)return;
    item.subjects=root.LamaClassSubjectChoices.toggle(item.subjects,name);
    if(item.aliases)delete item.aliases[name];
    updateSelected(i,item);
   }else return;
   changed('Subject selections edited. Press Save & Broadcast to update school and teacher portals.');
  }catch(ex){error(ex.message||'Unable to edit subject.')}
 });
 container.addEventListener('keydown',event=>{
  if(event.key!=='Enter'||!event.target.matches?.('input[data-rename-input]'))return;
  event.preventDefault();
  const panel=event.target.closest('[data-rename-panel]');
  panel?.querySelector('button[data-save-rename]')?.click();
 });
}
root.LamaClassSubjectPicker={render,bind};
})(window);