/* Read-only adapter over School Settings. Never creates a parallel curriculum. */
(function(root){
'use strict';
const clean=v=>String(v??'').trim(), key=v=>root.LamaSchoolCurriculum.key(v);
function decode(profile,resources,schoolId){
 if(!profile||String(profile.schoolId)!==String(schoolId))throw Error('School profile mismatch.');
 const raw=profile.offeredClassesJson;
 if(raw===undefined||raw===null||raw==='')throw Error('No offered classes saved in School Settings.');
 let classes;try{classes=Array.isArray(raw)?raw:JSON.parse(raw)}catch(_){throw Error('Saved classes cannot be parsed.')}
 if(!Array.isArray(classes))throw Error('Invalid offered classes.');
 const {doc}=root.LamaSchoolCurriculum.read(resources,schoolId);
 const seen=new Set(),out=[];
 for(const c of classes){const name=clean(typeof c==='string'?c:c?.name);if(!name||seen.has(key(name)))throw Error('Invalid or duplicate configured class.');seen.add(key(name));out.push({name,sections:Array.isArray(c?.sections)?c.sections.map(clean).filter(Boolean):[],subjects:root.LamaSchoolCurriculum.forClass(doc,name),aliases:root.LamaSchoolCurriculum.aliasesForClass(doc,name)})}
 return {schoolId:String(schoolId),classes:out,curriculumSaved:!!doc};
}
async function load(){
 const me=LamaAPI.getSession('school');if(!me?.schoolId)throw Error('School sign-in required.');
 const [profile,resources]=await Promise.all([LamaAPI.getVerifiedSchoolConfig(),LamaAPI.list('resources')]);
 return decode(profile,resources,me.schoolId);
}
function names(config){return (config?.classes||[]).map(c=>c.name)}
function forClass(config,name){return (config?.classes||[]).find(c=>key(c.name)===key(name))||null}
function subjects(config,name){return forClass(config,name)?.subjects||[]}
function matches(config,name,subject){const c=forClass(config,name),n=clean(subject).toLowerCase();return !!c&&c.subjects.some(s=>s.toLowerCase()===n||(c.aliases[s]||[]).some(a=>a.toLowerCase()===n))}
function union(config,legacy=[]){const out=names(config);for(const v of legacy){const s=clean(v);if(s&&!out.includes(s))out.push(s)}return out}
function list(select,values,placeholder,previous=''){select.replaceChildren(new Option(placeholder,''));for(const v of values)select.add(new Option(v,v));if(values.includes(previous))select.value=previous}
root.LamaAcademicConfig={decode,load,names,forClass,subjects,matches,union,list};
})(window);