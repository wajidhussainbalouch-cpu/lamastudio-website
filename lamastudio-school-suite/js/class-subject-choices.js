/* LAMA School Suite — administrator-facing subject choices.
 * Suggestions are optional, NEVER auto-saved or auto-selected.
 * Only the school administrator's explicitly pressed choices are persisted.
 */
(function(root){
 'use strict';
 const catalog=[
  'English','Urdu','Mathematics','Islamiat','Nazra Quran','General Knowledge','Computer',
  'Science','Social Studies (SST)','Arabic','Geography','History','Pakistan Studies',
  'Physics','Chemistry','Biology','Computer Science','Quran Translation','Tajweed',
  'Drawing / Art','Physical Education','Music','Environmental Studies','Ethics',
  'Punjabi','Sindhi','Economics','Civics'
 ];
 const clean=x=>String(x??'').trim(), norm=x=>clean(x).toLowerCase().replace(/\s+/g,' ');
 const key=x=>norm(x).replace(/^(class|grade|standard|std)[\s._-]*/,'').replace(/^0+(?=\d)/,'');
 const core={
  early:['English','Urdu','Mathematics','Islamiat','General Knowledge','Nazra Quran','Computer','Drawing / Art','Physical Education'],
  lower:['English','Urdu','Mathematics','Islamiat','General Knowledge','Nazra Quran','Science','Social Studies (SST)','Computer'],
  primary:['English','Urdu','Mathematics','Islamiat','Science','Social Studies (SST)','General Knowledge','Computer','Nazra Quran'],
  middle:['English','Urdu','Mathematics','Science','Islamiat','Arabic','Geography','History','Computer','Social Studies (SST)','Nazra Quran'],
  secondary:['English','Urdu','Mathematics','Islamiat','Physics','Chemistry','Biology','Computer Science','Pakistan Studies','Quran Translation'],
  higher:['English','Urdu','Mathematics','Physics','Chemistry','Biology','Computer Science','Pakistan Studies','Economics','Civics']
 };
 function suggestions(className){
  const k=key(className);
  if(['ece','playgroup','nursery','prep','kg','kindergarten','montessori'].includes(k))return [...core.early];
  const n=/^\d+$/.test(k)?Number(k):NaN;
  if(n>=1&&n<=3)return [...core.lower];
  if(n>=4&&n<=5)return [...core.primary];
  if(n>=6&&n<=8)return [...core.middle];
  if(n>=9&&n<=10)return [...core.secondary];
  if(n>=11&&n<=12)return [...core.higher];
  return [...core.early];
 }
 function categories(className,selected=[]){
  const primary=suggestions(className);
  const preferred=new Set(primary.map(norm));
  const chosen=new Set((selected||[]).map(norm));
  const extraSelected=(selected||[]).filter(s=>!catalog.some(x=>norm(x)===norm(s))&&!preferred.has(norm(s)));
  const other=catalog.filter(x=>!preferred.has(norm(x)));
  return {
   recommended:primary,
   more:[...other,...extraSelected.filter(s=>!other.some(x=>norm(x)===norm(s)))],
   selectedCount:chosen.size
  };
 }
 function toggle(selected,name){
  const current=Array.isArray(selected)?selected:[],match=norm(name);
  if(!match)throw Error('Choose a subject.');
  const found=current.some(x=>norm(x)===match);
  const next=found?current.filter(x=>norm(x)!==match):[...current,clean(name)];
  if(next.length>30)throw Error('Select up to 30 subjects per class.');
  return next;
 }
 root.LamaClassSubjectChoices={catalog,suggestions,categories,toggle,norm};
})(window);