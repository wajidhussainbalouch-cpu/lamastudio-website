
'use strict';
const $=id=>document.getElementById(id);
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const normalize=v=>String(v??'').toLowerCase().trim().replace(/[^a-z0-9]/g,'');
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const empty=v=>v==null||String(v).trim()===''||String(v).trim().toLowerCase()==='null';
const sid=s=>String(s.id??s._id??'');
const enroll=s=>clean(s.enrlNo??s.enrollmentNo??s.enrollment??'');
const fieldDefs={
enrlNo:['enrlno','enrollmentno','enrollmentnumber','admissionid','studentid','rollnumber','enrollno','enrollment'],
name:['studentname','nameofstudent','fullname','name','student'],
class:['class','grade','studentclass'],
section:['section','sec'],
gender:['gender','sex','fm'],
dob:['dob','dateofbirth','birthdate'],
fatherGuardian:['fatherguardian','fathername','fathersname','guardianname','parentname','father'],
fatherCnic:['fathercnic','parentcnic','guardiancnic'],
cnic:['formb','bform','studentcnic','bayform'],
contact:['contactnumber','parentcontact','mobile','phonenumber','phone','contact'],
whatsapp:['whatsapp','whatsappnumber'],
address:['homeaddress','postaladdress','address','residence'],
religion:['religion'],caste:['caste','tribe'],profession:['profession','occupation','fatheroccupation'],
academicSession:['academicsession','session'],admissionDate:['admissiondate','admdate','dateofadmission'],
admissionNo:['admissionnumber','admissionno'],bloodGroup:['bloodgroup'],guardianRelation:['guardianrelation','relation'],
guardianCell:['guardiancontact','guardianphone'],emergencyContact:['emergencycontact'],
previousSchool:['previousschool'],heightCm:['heightcm'],weightKg:['weightkg'],allergies:['allergies'],
medicalNotes:['medicalnotes'],remarks:['admissionremarks','remarks','comments','notes']
};
const fieldLabels=Object.fromEntries(Object.keys(fieldDefs).map(k=>[k,k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())]));
const ignored=new Set(['historicalResults','marks','result','testMarks','interviewMarks','grade','password','portalLoginId','id','_id']);
let mode='excel',files=[],students=[],rows=[],mapping={},preview=[],busy=false;
const STUDENT_IMPORT_READ_ONLY = true;
const personKey=v=>normalize(String(v||'').replace(/^\s*\(f\)\s*/i,'').replace(/\b(muhammad|mohammad|muhamad|muhammed|muhamnmad|muhammand)\b/ig,'muhammad').replace(/\b(ghulam|gulam|ghulsm)\b/ig,'ghulam').replace(/\b(bakhsh|bukhsh|box)\b/ig,'bakhsh'));
function classKey(v){let n=normalize(v);if(['nursery','preprimary','katchi','kg'].includes(n))return 'katchi';if(['ecce','ece','earlychildhood'].includes(n))return 'ecce';return n.replace(/^class/,'')}
function fileClass(name){const n=String(name||'').toLowerCase();const m=n.match(/class[\s_-]*(ecce|ece|katchi|nursery|\d+)/i);return m?classKey(m[1]):''}

function status(t){$('status').textContent=t}
function setBusy(v){busy=v;$('analyze').disabled=v;$('apply').disabled=STUDENT_IMPORT_READ_ONLY||v||!preview.some(x=>x.reason==='New student')}
function setMode(v){
 mode=v;
 document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===v));
 // One simple file picker accepts every supported format. Keep advanced options optional.
 $('imagePurpose').parentElement.classList.remove('hidden');
 $('maxPages').parentElement.classList.remove('hidden');
 $('headerRow').parentElement.classList.remove('hidden');
 $('files').accept='.xlsx,.xls,.xlsm,.csv,.docx,.doc,.pdf,.png,.jpg,.jpeg,.webp';
 $('acceptHint').textContent='Excel, CSV, Word, PDF, JPG, PNG or WebP — automatically detected';
 files=[];$('files').value='';$('selectedFiles').textContent='No file selected yet.';clearPreview();
}
function clearPreview(){rows=[];preview=[];mapping={};$('mapping').textContent='';$('preview').innerHTML='<div style="padding:20px" class="muted tiny">No preview yet.</div>';$('stats').textContent='No preview yet';$('apply').disabled=true;$('progressBar').style.width='0';$('confirmReview').checked=false}
function setFiles(list){files=Array.from(list||[]);$('selectedFiles').innerHTML=files.length?'<strong>✓ '+files.length+' file(s) selected</strong><div>'+files.map(f=>'<span class="badge">'+escapeHTML(f.name)+' ('+Math.ceil(f.size/1024)+' KB)</span>').join(' ')+'</div><div class="muted tiny">Now tap Check Student Records to read and preview this file.</div>':'No file selected yet.';if(files.length)status('File selected: '+files.map(f=>f.name).join(', ')+'. Tap Check Student Records.');}
function detect(header){const n=normalize(header);if(!n)return'';for(const [key,aliases] of Object.entries(fieldDefs))if(aliases.some(a=>n===a))return key;for(const [key,aliases] of Object.entries(fieldDefs))if(aliases.some(a=>n.includes(a)&&a.length>=5))return key;return''}
function parseTable(table){if(!table.length)return[];let header=table[0].map(clean);let count=0;for(const h of header)if(detect(h))count++;if(count<2)return[];return table.slice(1).filter(r=>r.some(x=>!empty(x))).map(r=>Object.fromEntries(header.map((h,i)=>[h,clean(r[i])]).filter(([h])=>h)))}
function parseLabelLines(text){const records=[],blocks=text.split(/\n\s*\n|(?=Enrollment\s*(?:No|Number|ID)\s*[:#])/i);for(const block of blocks){const item={};for(const line of block.split(/\n/)){const m=line.match(/^\s*([^:：]{2,42})\s*[:：]\s*(.{1,160})\s*$/);if(m)item[clean(m[1])]=clean(m[2])}if(Object.keys(item).length>=2)records.push(item)}return records}
function parseLinesAsTable(text){const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);const delimiters=['\t','|',','];for(const delim of delimiters){const matrix=lines.filter(x=>x.includes(delim)).map(x=>x.split(delim).map(clean));if(matrix.length>1){const parsed=parseTable(matrix);if(parsed.length)return parsed}}return[]}
function docxTables(html){const doc=new DOMParser().parseFromString(html,'text/html');const results=[];for(const table of doc.querySelectorAll('table')){const matrix=[...table.querySelectorAll('tr')].map(tr=>[...tr.querySelectorAll('th,td')].map(td=>clean(td.textContent)));const parsed=parseTable(matrix);if(parsed.length)results.push(...parsed);else for(const row of matrix){if(row.length===2&&detect(row[0])){const obj={};for(const r of matrix)if(r.length===2)obj[r[0]]=r[1];if(Object.keys(obj).length>=2){results.push(obj);break}}}}return results}
async function readExcel(f){if(typeof XLSX==='undefined')throw Error('Excel library not available. Connect to internet.');const wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:false});let output=[];for(const sheetName of wb.SheetNames){const table=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,defval:'',raw:false});const start=Math.max(0,Number($('headerRow').value||1)-1);output.push(...parseTable(table.slice(start)))}return output}
async function readWord(f){if(f.name.toLowerCase().endsWith('.doc'))throw Error('Binary .doc is not supported directly. Save it as DOCX first.');if(typeof mammoth==='undefined')throw Error('Word reader not loaded.');const buf=await f.arrayBuffer();const html=await mammoth.convertToHtml({arrayBuffer:buf});const text=await mammoth.extractRawText({arrayBuffer:buf});const parsed=docxTables(html.value);return parsed.length?parsed:parseLinesAsTable(text.value).concat(parseLabelLines(text.value))}
async function ocrCanvas(canvas){if(typeof Tesseract==='undefined')throw Error('OCR engine not loaded. Internet connection required.');const res=await Tesseract.recognize(canvas,'eng');return res.data.text||''}

/**
 * Read the fixed-column EMIS student report by PDF text coordinates, not by
 * concatenating words. A wrapped student name remains part of its numbered row.
 * Refuse partial / inconsistent extraction rather than inventing student data.
 */
function parseEmisPositionedTable(items,pageWidth){
 const cells=items.filter(t=>t&&typeof t.str==='string'&&t.str.trim()&&Array.isArray(t.transform))
   .map(t=>({x:t.transform[4],y:t.transform[5],text:clean(t.str)}));
  const header=cells.filter(t=>/^(ENRL(?:\s*#)?|FORM-B|FATHER(?:\s*\/\s*GUARDIAN)?|CLASS)$/i.test(t.text));
 if(!header.some(t=>/ENRL/i.test(t.text))||!header.some(t=>/FORM-B/i.test(t.text)))return null;
 // Column starts are percentages of the official EMIS report's page width.
 // Validate row numbers and mandatory fields below to reject other layouts.
 const starts=[.030,.078,.138,.318,.354,.447,.485,.574,.779,.894].map(n=>n*pageWidth);
 const rows=[];
 const numbered=cells.filter(t=>t.x>=starts[0]-5&&t.x<starts[1]-5&&/^\d{1,4}$/.test(t.text))
   .sort((a,b)=>b.y-a.y);
 for(let k=0;k<numbered.length;k++){
  const current=numbered[k],next=numbered[k+1];
  const group=cells.filter(t=>t.y<=current.y+2.5&&(next?t.y>next.y+2.5:true)&&t.y<current.y+30);
  const cols=starts.map((left,j)=>group.filter(t=>t.x>=left-3&&t.x<(starts[j+1]??pageWidth+5)-3&&!(j===0&&t===current))
    .sort((a,b)=>b.y-a.y||a.x-b.x).map(t=>t.text).join(' ').trim());
  const serial=Number(current.text);
  if(!cols[2]||!cols[4]||!cols[9]||!/^(ECE|ECCE|NURSERY|KG|KATCHI|PREP|(?:CLASS\s*)?(?:[1-9]|1[0-2]))$/i.test(cols[9]))throw Error('PDF row '+serial+' could not be read reliably (student name, date or class missing). No records saved. Please provide this PDF for layout review.');
  rows.push({__serial:serial,'ENRL #':cols[1],NAME:cols[2],'F / M':cols[3],DOB:cols[4],'ADM. DATE':cols[6],'FATHER / GUARDIAN':cols[7],'FORM-B':cols[8],CLASS:cols[9]});
 }
 if(!rows.length)throw Error('EMIS table headings were found but no numbered student rows were read.');
 return rows;
}

async function readPDF(f){
 if(typeof pdfjsLib==='undefined')throw Error('PDF reader not loaded.');
 pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 const doc=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;
 const limit=Math.min(doc.numPages,Math.min(50,Math.max(1,Number($('maxPages').value)||50)));
 if(limit<doc.numPages)throw Error('Only '+limit+' of '+doc.numPages+' pages selected. Increase the page limit before analyzing to avoid missing students.');
 const all=[];let reportMode=null;
 for(let i=1;i<=limit;i++){
  status('Reading PDF page '+i+' / '+limit+'…');
  const page=await doc.getPage(i),tc=await page.getTextContent();
  const text=tc.items.map(it=>it.str+(it.hasEOL?'\\n':' ')).join('');
  const positioned=parseEmisPositionedTable(tc.items,page.view[2]-page.view[0]);
  let parsed=[];
  if(positioned!==null){reportMode='emis';parsed=positioned;}
  else {
   if(reportMode==='emis')throw Error('EMIS report layout was not recognized on page '+i+'. No records saved.');
   parsed=parseLinesAsTable(text).concat(parseLabelLines(text));
   if(!parsed.length&&text.replace(/\\s/g,'').length<40){
    status('Page '+i+' / '+limit+': scanning image with OCR…');
    const viewport=page.getViewport({scale:1.7}),canvas=document.createElement('canvas');
    canvas.width=viewport.width;canvas.height=viewport.height;
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    const ocr=await ocrCanvas(canvas);
    parsed=parseLinesAsTable(ocr).concat(parseLabelLines(ocr));
   }
  }
  if(!parsed.length)throw Error('No reliable student rows found on page '+i+'. Import stopped without saving.');
  all.push(...parsed);
  $('progressBar').style.width=Math.round(i/limit*100)+'%';
  status('Page '+i+' / '+limit+' checked · '+all.length+' student rows recognized');
  await new Promise(resolve=>setTimeout(resolve,0));
 }
 if(reportMode==='emis'){
  const serials=all.map(r=>r.__serial),unique=new Set(serials);
  if(unique.size!==serials.length||serials[0]!==1||serials.some((n,i)=>n!==i+1))
   throw Error('Student row numbering is incomplete or repeated. Expected consecutive rows from 1; found '+serials.length+'. No data saved.');
 }
 if(!all.length)throw Error('No student records recognized. Nothing was saved.');
 return all;
}
async function readImage(f){if($('imagePurpose').value==='photos'){const id=f.name.replace(/\.[^.]+$/,'').trim();const data=await imageData(f);return [{__photo:id,__data:data}]}const text=await ocrCanvas(f);return parseLinesAsTable(text).concat(parseLabelLines(text))}
function imageData(f){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const c=document.createElement('canvas');const scale=Math.min(1,800/Math.max(im.width,im.height));c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.72))};im.src=reader.result};reader.readAsDataURL(f)})}
function deriveMapping(){const keys=[...new Set(rows.flatMap(Object.keys))].filter(k=>!k.startsWith('__'));mapping=Object.fromEntries(keys.map(k=>[k,detect(k)]));$('mapping').innerHTML=keys.map((k,i)=>'<label>'+escapeHTML(k)+'<select class="field" data-map="'+i+'"><option value="">Skip column</option>'+Object.keys(fieldDefs).map(f=>'<option value="'+f+'" '+(mapping[k]===f?'selected':'')+'>'+escapeHTML(fieldLabels[f])+'</option>').join('')+'</select></label>').join('');$('mapping').querySelectorAll('select').forEach((sel,i)=>sel.onchange=()=>{mapping[keys[i]]=sel.value;makePreview()})}
function rowFields(r){if(r.__photo)return{enrlNo:r.__photo,photo:r.__data};const out={};for(const [k,v] of Object.entries(r)){const dest=mapping[k];if(dest&&!ignored.has(dest)&&!empty(v)&&empty(out[dest]))out[dest]=clean(v)}return out}
function makePreview(){
 const byId=new Map(),byForm=new Map(),byPerson=new Map(),sourceId=new Map(),sourceForm=new Map();
 const put=(m,k,s)=>{if(!k)return;const a=m.get(k)||[];a.push(s);m.set(k,a)};
 for(const s of students){put(byId,normalize(enroll(s)),s);const form=normalize(s.cnic||s.formB||s.bForm||'');if(form&&form!=='0')put(byForm,form,s);const n=personKey(s.name),f=personKey(s.fatherGuardian||s.fatherName||s.father||'');if(n&&f)put(byPerson,n+'|'+f,s)}
 preview=rows.map((r,i)=>{
  const values=rowFields(r),id=normalize(values.enrlNo),form=normalize(values.cnic),n=personKey(values.name),f=personKey(values.fatherGuardian);
  const cls=classKey(values.class||r.__sourceClass||'');let matches=[],method='';
  if(id&&byId.has(id)){matches=byId.get(id);method='Enrollment number'}
  else if(form&&form!=='0'&&byForm.has(form)){matches=byForm.get(form);method='Form-B'}
  else if(n&&f&&byPerson.has(n+'|'+f)){matches=byPerson.get(n+'|'+f);method='Student + father'}
  let reason='New student';
  if(matches.length===1)reason='Already enrolled — skip';
  else if(matches.length>1)reason='Ambiguous existing match — review';
  else if(!values.name||!cls||cls==='0')reason='Missing name or valid class — review';
  else if(!id&&!(document.getElementById('includeNoEnrollment')?.checked&&f&&values.dob))reason='Missing enrollment — review';
  else if(id&&sourceId.has(id))reason='Duplicate enrollment in source — review';
  else if(form&&form!=='0'&&sourceForm.has(form))reason='Duplicate Form-B in source — review';
  if(id)sourceId.set(id,i);if(form&&form!=='0')sourceForm.set(form,i);
  return{index:i+1,values,target:matches.length===1?matches[0]:null,patch:{},reason,method,sourceClass:cls};
 });renderPreview();
}
const importDisplayFields=['enrlNo','name','fatherGuardian','gender','dob','admissionDate','cnic','class','section','contact','address'];
function previewColumns(){
 const present=importDisplayFields.filter(k=>preview.some(x=>!empty(x.values[k])));
 const mandatory=['enrlNo','name','fatherGuardian','class'];
 const additional=Object.keys(fieldDefs).filter(k=>!mandatory.includes(k)&&!present.includes(k)&&preview.some(x=>!empty(x.values[k])));
 return [...new Set([...mandatory,...present,...additional])];
}
function renderPreview(){
 const fresh=preview.filter(x=>x.reason==='New student'),existing=preview.filter(x=>x.reason==='Already enrolled — skip'),review=preview.filter(x=>x.reason!=='New student'&&x.reason!=='Already enrolled — skip');
 $('stats').textContent=preview.length+' source rows · '+fresh.length+' new · '+existing.length+' already enrolled · '+review.length+' review';
 const columns=previewColumns();
 const headers=['#',...columns.map(k=>fieldLabels[k]||k),'Decision'];
 $('preview').innerHTML='<div class="muted tiny" style="padding:8px">Swipe left or right to see all fields. Blank cells mean the source did not provide a recognized value.</div><table style="min-width:1050px"><thead><tr>'+headers.map(label=>'<th>'+escapeHTML(label)+'</th>').join('')+'</tr></thead><tbody>'+preview.slice(0,700).map(x=>'<tr><td>'+x.index+'</td>'+columns.map(k=>'<td>'+escapeHTML(x.values[k]||((k==='class'&&x.sourceClass)||'—'))+'</td>').join('')+'<td class="'+(x.reason==='New student'?'good':x.reason.startsWith('Already')?'muted':'warn')+'">'+escapeHTML(x.reason)+'</td></tr>').join('')+'</tbody></table>';
 $('apply').disabled=STUDENT_IMPORT_READ_ONLY||busy||!fresh.length;
}
async function analyze(){if(!files.length){status('Choose one or more files first.');return}setBusy(true);clearPreview();try{if(typeof LamaAPI==='undefined')throw Error('LamaAPI not found.');if(LamaAPI.requireLogin&&!LamaAPI.requireLogin('school','login.html'))return;const loaded=await LamaAPI.list('students');students=Array.isArray(loaded)?loaded:Array.isArray(loaded?.records)?loaded.records:Array.isArray(loaded?.data)?loaded.data:[];rows=[];for(let i=0;i<files.length;i++){const f=files[i];status('Processing '+(i+1)+' / '+files.length+': '+f.name);const ext=f.name.split('.').pop().toLowerCase();let part;if(['xlsx','xls','xlsm','csv'].includes(ext))part=await readExcel(f);else if(['docx','doc'].includes(ext))part=await readWord(f);else if(ext==='pdf')part=await readPDF(f);else if(['png','jpg','jpeg','webp'].includes(ext))part=await readImage(f);else throw Error('Unsupported format: '+ext);const sourceClass=fileClass(f.name);part.forEach(r=>{r.__sourceClass=sourceClass});rows.push(...part)}if(!rows.length)throw Error('No student records were recognized. Check the file layout; no changes were made.');deriveMapping();makePreview();status('Analysis complete: '+rows.length+' rows found. Review the table: new students may be added, existing students will be skipped, and uncertain rows need manual review. Nothing has been saved.');$('progressBar').style.width='100%';$('loadCount').textContent=students.length+' existing students loaded.'}catch(e){status('Could not finish analysis: '+e.message+'. No students were added. Try a digital-text PDF or Excel/CSV if the PDF layout is not recognized.')}finally{busy=false;$('analyze').disabled=false;$('apply').disabled=STUDENT_IMPORT_READ_ONLY||!preview.some(x=>x.reason==='New student')}}
async function apply(){
 if(STUDENT_IMPORT_READ_ONLY){status('Preview-only release: saving student records is disabled until validation is complete. No changes were made.');return;}

 const todo=preview.filter(x=>x.reason==='New student');if(!todo.length)return;
 if(!$('confirmReview').checked)return status('Review the preview and confirm first.');
 if(!confirm('Create '+todo.length+' NEW student records? Existing enrolled students will be skipped. Make sure you have backed up the school sheet.'))return;
 setBusy(true);let done=0,skipped=0,failed=0;
 try{
  const live=await LamaAPI.list('students');const current=Array.isArray(live)?live:live?.records||[];
  const usedId=new Set(current.map(s=>normalize(enroll(s))).filter(Boolean));
  const usedForm=new Set(current.map(s=>normalize(s.cnic||s.formB||s.bForm||'')).filter(x=>x&&x!=='0'));
  const usedPerson=new Set(current.map(s=>personKey(s.name)+'|'+personKey(s.fatherGuardian||s.fatherName||s.father||'')));
  for(let i=0;i<todo.length;i++){
   const v=todo[i].values,id=normalize(v.enrlNo),form=normalize(v.cnic),person=personKey(v.name)+'|'+personKey(v.fatherGuardian);
   if((id&&usedId.has(id))||(form&&form!=='0'&&usedForm.has(form))||(v.fatherGuardian&&usedPerson.has(person))){skipped++;continue}
   const record={...v,class:v.class||todo[i].sourceClass};
   // Missing fields stay empty; do not invent enrollment, Form-B, contact, dates, or credentials.
   delete record.photo;
   try{const result=await LamaAPI.add('students',record);if(result===false||result?.success===false)throw Error(result?.message||'API rejected record');done++;if(id)usedId.add(id);if(form&&form!=='0')usedForm.add(form);usedPerson.add(person)}
   catch(e){failed++;status('Save error at source row '+todo[i].index+': '+e.message)}
   $('progressBar').style.width=Math.round((i+1)/todo.length*100)+'%';$('saveCount').textContent=(i+1)+' / '+todo.length;
  }
  status('Finished: '+done+' new students added, '+skipped+' duplicates skipped, '+failed+' failed. Reload and verify the student register.');
  $('confirmReview').checked=false;$('apply').disabled=true;
 }catch(e){status('Import stopped: '+e.message)}finally{busy=false;$('analyze').disabled=false;$('apply').disabled=true}
}
function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function downloadReport(){
 if(!preview.length)return status('Analyze files first.');
 const columns=[...new Set([...Object.keys(fieldDefs),...preview.flatMap(x=>Object.keys(x.values))])].filter(k=>preview.some(x=>!empty(x.values[k])));
 const headings=['Row',...columns.map(k=>fieldLabels[k]||k),'Match Method','Matched Student','Decision'];
 const lines=[headings,...preview.map(x=>[x.index,...columns.map(k=>x.values[k]||''),x.method,x.target?.name||'',x.reason])];
 const blob=new Blob(['\\ufeff'+lines.map(r=>r.map(csvCell).join(',')).join('\\r\\n')],{type:'text/csv;charset=utf-8'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='student-import-full-review.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);
}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
document.querySelectorAll('[data-kind-file]').forEach(input=>{
 input.addEventListener('change',()=>{
  setFiles(input.files);
  $('files').value='';
  // Keep the native all-format picker available as a fallback.
 });
});
$('files').onchange=e=>setFiles(e.target.files);
$('drop').onclick=e=>{if(e.target!==$('files'))$('files').click()};
$('drop').ondragover=e=>{e.preventDefault();$('drop').classList.add('drag')};
$('drop').ondragleave=()=> $('drop').classList.remove('drag');
$('drop').ondrop=e=>{e.preventDefault();$('drop').classList.remove('drag');setFiles(e.dataTransfer.files)};
$('analyze').onclick=analyze;$('apply').onclick=apply;$('clear').onclick=clearPreview;$('downloadReport').onclick=downloadReport;
$('includeNoEnrollment').onchange=()=>{if(rows.length)makePreview()};
(async()=>{try{if(typeof LamaAPI!=='undefined'){const school=await LamaAPI.getActiveSchool();$('schoolName').textContent=(school?.name||'School')+' · add new students safely'}}catch(e){status('School name unavailable: '+e.message)}})();
setMode('auto');
