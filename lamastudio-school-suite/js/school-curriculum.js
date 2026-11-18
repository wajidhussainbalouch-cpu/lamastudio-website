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
 function documentFor(classes,schoolId){
  if(!Array.isArray(classes)||classes.length>60)throw Error('Choose up to 60 classes.');
  const seen=new Set(),data=[];
  for(const c of classes){
   if(!c||!c.enabled)continue;
   const name=clean(c.name);
   if(!name||name.length>80||seen.has(key(name)))throw Error('Invalid or repeated class '+name);
   seen.add(key(name));
   data.push({name,subjects:subjects(c.subjects)});
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
  for(const c of doc.classes){if(!c||typeof c.name!=='string'||!Array.isArray(c.subjects))throw Error('Invalid saved class subjects.');subjects(c.subjects)}
  return {record,doc};
 }
 function forClass(doc,className){
  if(!doc||!Array.isArray(doc.classes))return [];
  return subjects(doc.classes.find(c=>key(c.name)===key(className))?.subjects||[]);
 }
 root.LamaSchoolCurriculum={CATEGORY,TITLE,key,subjects,documentFor,matchingRecord,read,forClass};
})(window);
