/* LAMA School Suite: shared, school-scoped curriculum in the existing Resources sheet.
 * Teachers can READ this record; only school administrators can change it.
 * No independent database, public storage, or duplicate student records.
 */
(function(root){
 'use strict';
 const CATEGORY='school-curriculum',TITLE='LAMA School Class Subjects';
 const clean=v=>String(v??'').trim(), key=v=>clean(v).toLowerCase().replace(/^(?:class|grade|standard|std)[\s._-]*/,'').replace(/^0+(?=\d)/,'').replace(/\s+/g,'');
 function subjects(value){
  let list=Array.isArray(value)?value:String(value??'').split(/[,;\n]/);
  const out=[],seen=new Set();
  for(const item of list){
   const v=clean(item);
   if(!v)continue;
   if(v.length>70)throw Error('A subject name is longer than 70 characters.');
   const k=v.toLowerCase().replace(/\s+/g,' ');
   if(!seen.has(k)){seen.add(k);out.push(v)}
  }
  if(out.length>30)throw Error('Choose up to 30 subjects per class.');
  return out;
 }
 function normalizedAliases(selectedSubjects,raw){
  const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const output=Object.create(null);
  for(const subject of selectedSubjects){
   const matching=Object.entries(source).find(([k])=>clean(k).toLowerCase()===subject.toLowerCase());
   if(!matching)continue;
   const list=matching[1];
   if(!Array.isArray(list)||list.length>12)throw Error('Invalid subject rename history for '+subject+'.');
   const seen=new Set(),values=[];
   for(const x of list){
    if(typeof x!=='string'||!clean(x)||clean(x).length>70)throw Error('Invalid renamed subject.');
    const norm=clean(x).toLowerCase();
    if(norm!==subject.toLowerCase()&&!seen.has(norm)){seen.add(norm);values.push(clean(x))}
   }
   if(values.length)output[subject]=values;
  }
  return output;
 }
 function documentFor(classes,schoolId){
  if(!Array.isArray(classes)||classes.length>60)throw Error('Choose up to 60 classes.');
  const seen=new Set(),data=[];
  for(const c of classes){
   if(!c||!c.enabled)continue;
   const name=clean(c.name);
   if(!name||name.length>80||seen.has(key(name)))throw Error('Invalid or repeated class '+name);
   seen.add(key(name));
   const classSubjects=subjects(c.subjects);
   const aliases=normalizedAliases(classSubjects,c.aliases);
   const item={name,subjects:classSubjects};
   if(Object.keys(aliases).length)item.aliases=aliases;
   data.push(item);
  }
  const doc={version:1,schoolId:clean(schoolId),classes:data};
  if(!doc.schoolId)throw Error('School session missing.');
  if(JSON.stringify(doc).length>28000)throw Error('Curriculum is too large to save safely.');
  return doc;
 }
 function matchingRecord(rows){
  if(!Array.isArray(rows))throw Error('Curriculum resource list unavailable.');
  const r=rows.filter(x=>clean(x.category).toLowerCase()===CATEGORY&&clean(x.title)===TITLE);
  if(r.length>1)throw Error('Multiple curriculum records found. Administrator must resolve duplicates before editing.');
  return r[0]||null;
 }
 function read(rows,schoolId){
  const record=matchingRecord(rows);
  if(!record)return {record:null,doc:null};
  let doc;try{doc=JSON.parse(String(record.description||''))}catch(_){throw Error('Saved curriculum cannot be parsed. No overwrite attempted.')}
  if(!doc||doc.version!==1||!Array.isArray(doc.classes)||clean(doc.schoolId)!==clean(schoolId))throw Error('Saved curriculum does not match this school or version.');
  if(doc.classes.length>60)throw Error('Saved curriculum has too many classes.');
  for(const c of doc.classes){if(!c||typeof c.name!=='string'||!Array.isArray(c.subjects))throw Error('Invalid saved class subjects.');normalizedAliases(subjects(c.subjects),c.aliases)}
  return {record,doc};
 }
 function forClass(doc,className){
  if(!doc||!Array.isArray(doc.classes))return [];
  return subjects(doc.classes.find(c=>key(c.name)===key(className))?.subjects||[]);
 }
 function aliasesForClass(doc,className){
  if(!doc||!Array.isArray(doc.classes))return {};
  const c=doc.classes.find(item=>key(item.name)===key(className));
  if(!c)return {};
  return normalizedAliases(subjects(c.subjects),c.aliases);
 }
 root.LamaSchoolCurriculum={CATEGORY,TITLE,key,subjects,documentFor,matchingRecord,read,forClass,aliasesForClass};
})(window);
