/* LAMA School Suite — optional subject suggestions for Pakistani schools.
 * No group or subject is automatically selected. Group tabs only change suggestions.
 * School administrators explicitly tap subjects; only the saved school record changes.
 */
(function(root){
 'use strict';
 const catalog=[
  'English','Urdu','Mathematics','General Mathematics','Islamiat','Nazra Quran',
  'Tarjuma-tul-Quran','Quran Translation','Islamic Studies','Religious Education','General Knowledge',
  'Science','General Science','Social Studies (SST)','Computer','Computer Science',
  'Computer Science & Entrepreneurship','Computer Science & ICT','Computer Studies',
  'Art','Art & Craft','Drawing / Art','Fine Arts','Music','Physical Education','Health & Physical Education',
  'Arabic','Geography','History','History of Islam','Pakistan Studies','Pakistan Culture',
  'Physics','Chemistry','Biology','Statistics','Economics','Civics','Education',
  'Sociology','Psychology','Political Science','Business Studies','Accounting',
  'Principles of Accounting','Principles of Commerce','Principles of Economics',
  'Business Mathematics','Business Statistics','Banking','Commercial Geography',
  'Commerce','Computerized Accounting','Home Economics','Food & Nutrition','Agriculture',
  'Environmental Studies','Ethics','Punjabi','Sindhi','Saraiki','Persian','Tajweed',
  'Information Technology','Technical & Vocational Education','Health Sciences',
  'Applied Arts'
 ];
 const clean=x=>String(x??'').trim(), norm=x=>clean(x).toLowerCase().replace(/\s+/g,' ');
 const key=x=>norm(x).replace(/^(?:class|grade|standard|std)[\s._-]*/,'').replace(/^0+(?=\d)/,'');
 const core={
  early:['English','Urdu','Mathematics','Islamiat','Nazra Quran','General Knowledge','Computer','Music','Art','Art & Craft','Physical Education'],
  lower:['English','Urdu','Mathematics','Islamiat','Science','General Knowledge','Social Studies (SST)','Computer','Nazra Quran','Music','Art','Art & Craft'],
  primary:['English','Urdu','Mathematics','Social Studies (SST)','Science','Islamiat','General Knowledge','Computer','Nazra Quran','Art','Art & Craft','Music'],
  middle:['English','Urdu','Mathematics','Science','Islamiat','Arabic','Geography','History','Computer','Social Studies (SST)','Nazra Quran','Art','Art & Craft','Music']
 };
 // These are browsing templates based on Punjab SSC/HSSC scheme of studies.
 // The selected subjects are always manual, and no board compliance is asserted.
 const SSC=[
  {id:'science-bio',name:'Science — Biology',subjects:['English','Urdu','Mathematics','Islamiat','Pakistan Studies','Tarjuma-tul-Quran','Physics','Chemistry','Biology','Art']},
  {id:'science-computer',name:'Science — Computer',subjects:['English','Urdu','Mathematics','Islamiat','Pakistan Studies','Tarjuma-tul-Quran','Physics','Chemistry','Computer Science & Entrepreneurship','Art']},
  {id:'humanities',name:'Humanities / Arts',subjects:['English','Urdu','General Mathematics','General Science','Islamiat','Pakistan Studies','Tarjuma-tul-Quran','Economics','Education','Civics','Geography','History','Computer Science','Art']},
  {id:'matric-tech',name:'Matric-Tech',subjects:['English','Urdu','Mathematics','Islamiat','Pakistan Studies','Tarjuma-tul-Quran','Physics','Chemistry','Technical & Vocational Education','Computer Science & Entrepreneurship']}
 ];
 const HSSC=[
  {id:'pre-medical',name:'F.Sc Pre-Medical',subjects:['English','Urdu','Islamiat','Pakistan Studies','Biology','Physics','Chemistry','Tarjuma-tul-Quran']},
  {id:'pre-engineering',name:'F.Sc Pre-Engineering',subjects:['English','Urdu','Islamiat','Pakistan Studies','Mathematics','Physics','Chemistry','Tarjuma-tul-Quran']},
  {id:'ics-physics',name:'ICS — Physics',subjects:['English','Urdu','Islamiat','Pakistan Studies','Mathematics','Physics','Computer Science','Tarjuma-tul-Quran']},
  {id:'ics-statistics',name:'ICS — Statistics',subjects:['English','Urdu','Islamiat','Pakistan Studies','Mathematics','Statistics','Computer Science','Tarjuma-tul-Quran']},
  {id:'general-science',name:'General Science',subjects:['English','Urdu','Islamiat','Pakistan Studies','Mathematics','Statistics','Economics','Physics','Computer Science']},
  {id:'i-com',name:'I.Com / Commerce',subjects:['English','Urdu','Islamiat','Pakistan Studies','Principles of Accounting','Principles of Commerce','Principles of Economics','Business Mathematics','Business Statistics','Banking','Commercial Geography','Computerized Accounting']},
  {id:'fa-humanities',name:'F.A / Humanities',subjects:['English','Urdu','Islamiat','Pakistan Studies','Education','Economics','Civics','History','Geography','Sociology','Psychology','Arabic','Persian','Punjabi','Fine Arts','Computer Science']},
  {id:'home-economics',name:'Home Economics',subjects:['English','Urdu','Islamiat','Pakistan Studies','Home Economics','Food & Nutrition','Chemistry','Biology','Fine Arts']},
  {id:'islamic-studies',name:'Islamic Studies',subjects:['English','Urdu','Islamiat','Pakistan Studies','Islamic Studies','Arabic','History of Islam','Quran Translation']},
  {id:'applied-arts',name:'Applied Arts',subjects:['English','Urdu','Islamiat','Pakistan Studies','Applied Arts','Fine Arts','Art & Craft','History']},
  {id:'agriculture-tech',name:'Agriculture / Technical',subjects:['English','Urdu','Islamiat','Pakistan Studies','Agriculture','Biology','Chemistry','Physics','Technical & Vocational Education']}
 ];
 function classNumber(className){
  const k=key(className);
  return /^\d+$/.test(k)?Number(k):null;
 }
 function groupsFor(className){
  const n=classNumber(className);
  return n!==null&&n>=9&&n<=10?SSC.map(g=>({...g,subjects:[...g.subjects]})):
   n!==null&&n>=11&&n<=12?HSSC.map(g=>({...g,subjects:[...g.subjects]})):[];
 }
 function suggestions(className,groupId){
  const k=key(className),n=classNumber(className);
  if(['ece','playgroup','nursery','prep','kg','kindergarten','montessori'].includes(k))return [...core.early];
  if(n!==null&&n>=1&&n<=3)return [...core.lower];
  if(n!==null&&n>=4&&n<=5)return [...core.primary];
  if(n!==null&&n>=6&&n<=8)return [...core.middle];
  const groups=groupsFor(className);
  if(groups.length){const picked=groups.find(g=>g.id===groupId)||groups[0];return [...picked.subjects]}
  return [...core.early];
 }
 function categories(className,selected=[],groupId){
  const primary=suggestions(className,groupId);
  const preferred=new Set(primary.map(norm)),picked=new Set((selected||[]).map(norm));
  const more=catalog.filter(x=>!preferred.has(norm(x)));
  for(const item of selected||[])if(!preferred.has(norm(item))&&!more.some(x=>norm(x)===norm(item)))more.unshift(item);
  return {recommended:primary,more,selectedCount:picked.size,groups:groupsFor(className)};
 }
 function toggle(selected,name){
  const current=Array.isArray(selected)?selected:[],match=norm(name);
  if(!match||clean(name).length>70)throw Error('Choose a valid subject (up to 70 characters).');
  const exists=current.some(x=>norm(x)===match);
  const next=exists?current.filter(x=>norm(x)!==match):[...current,clean(name)];
  if(next.length>30)throw Error('Select up to 30 subjects per class.');
  return next;
 }
 function rename(item,from,to){
  if(!item||!Array.isArray(item.subjects))throw Error('Class subjects not loaded.');
  const oldName=clean(from),nextName=clean(to),oldKey=norm(oldName),newKey=norm(nextName);
  if(!oldKey||!item.subjects.some(x=>norm(x)===oldKey))throw Error('Select this subject before editing its name.');
  if(!newKey||nextName.length>70)throw Error('Enter a subject name of 1–70 characters.');
  if(newKey!==oldKey&&item.subjects.some(x=>norm(x)===newKey))throw Error('This subject is already selected for this class.');
  if(newKey===oldKey){item.subjects=item.subjects.map(s=>norm(s)===oldKey?nextName:s);return nextName}
  const aliases=item.aliases&&typeof item.aliases==='object'&&!Array.isArray(item.aliases)?item.aliases:{};
  const prior=Array.isArray(aliases[oldName])?aliases[oldName]:[];
  const priorNames=[...new Set([...prior,oldName])].filter(x=>norm(x)!==newKey);
  const newMap=Object.create(null);
  for(const [k,v] of Object.entries(aliases))if(norm(k)!==oldKey&&norm(k)!==newKey)newMap[k]=v;
  newMap[nextName]=priorNames.slice(0,12);
  item.subjects=item.subjects.map(s=>norm(s)===oldKey?nextName:s);
  item.aliases=newMap;
  return nextName;
 }
 root.LamaClassSubjectChoices={catalog,suggestions,categories,groupsFor,toggle,rename,norm,classNumber};
})(window);