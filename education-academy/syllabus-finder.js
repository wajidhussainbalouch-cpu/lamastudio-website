'use strict';
/* Curated academy guidance; never claim suggested topics are an official case syllabus. */
(()=>{
 const $=id=>document.getElementById(id);
 const select=$('syllabusPost'),query=$('syllabusQuery'),button=$('syllabusFind'),out=$('syllabusResult'),official=$('syllabusOfficialSearch');
 if(!select||!query||!button||!out)return;
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
 const templates=[
  {match:/headmaster|headmistress|education officer|school leader|principal/i,topics:['Educational leadership and school administration','Educational psychology and child development','Curriculum design, pedagogy and lesson planning','Assessment, evaluation and school improvement','Education policy, school management and professional ethics','English comprehension, reasoning and general ability']},
  {match:/lecturer|subject specialist|teacher|instructor/i,topics:['Core academic subject knowledge','Teaching methodology and classroom management','Educational psychology and inclusive education','Assessment and curriculum planning','Research basics and academic communication','English comprehension and general ability']},
  {match:/information officer|public relation|media|communication/i,topics:['Mass communication theories and media studies','Public relations, reporting and professional writing','Digital media, media law and ethics','Current affairs and Pakistan affairs','English communication and comprehension','Research methods and basic information technology']},
  {match:/water|irrigation|agricultur/i,topics:['Water management, irrigation and conservation','Agricultural sciences and environmental management','Field measurements, basic quantitative reasoning','Relevant Punjab sector regulations and institutions','Applied technical problem-solving','English, current affairs and general ability']},
  {match:/registrar|cooperative/i,topics:['Cooperative principles and governance','Relevant Punjab cooperative laws and procedures','Administration, record-keeping and financial controls','Basic accounting and quantitative reasoning','Public administration and ethics','English and general knowledge']},
  {match:/account|audit|finance|econom/i,topics:['Financial accounting and reporting','Auditing and internal controls','Public finance, budgeting and economics','Quantitative aptitude and data interpretation','Relevant public-sector regulations','English and general ability']},
  {match:/computer|software|programmer|information technology|it officer/i,topics:['Programming fundamentals and data structures','Databases, SQL and information systems','Computer networks and cyber security','Operating systems and software engineering','Logical reasoning and quantitative aptitude','English and professional communication']},
  {match:/legal|law|prosecut|inspector/i,topics:['Constitutional and administrative law','Relevant substantive and procedural laws','Legal reasoning and statutory interpretation','Evidence, ethics and public administration','English comprehension and legal writing','General knowledge and current affairs']}
 ];
 const generic=['Job-specific professional knowledge and responsibilities','Relevant Punjab and federal laws, policies and regulations','English comprehension and communication','Quantitative and analytical reasoning','Pakistan affairs, current affairs and general knowledge','Applied problem-solving and professional ethics'];
 const catalog=window.LamaAcademyJobCatalog;
 if(!catalog){out.textContent='Job catalog did not load. Please refresh.';return}
 catalog.populate(select,{allowEmpty:true,emptyLabel:'Choose a preparation job',preferUrl:true});
 function render(){
  const typed=clean(query.value);
  const available=catalog.options();
  const matched=typed?available.find(j=>(j.caseNo&&j.caseNo.toLowerCase()===typed.toLowerCase())||j.label.toLowerCase()===typed.toLowerCase()):null;
  const chosen=matched||(!typed?catalog.resolve(select.value):null);
  const role=chosen?chosen.label:typed;
  out.replaceChildren();
  if(!role){out.textContent='Select a job to see a suggested preparation outline.';return}
  const source=templates.find(t=>t.match.test(role));
  const fromCatalog=chosen&&chosen.subjects.length?chosen.subjects:null;
  const topics=fromCatalog||source&&source.topics||generic;
  const h=document.createElement('h3');h.textContent=role;
  const status=document.createElement('p');status.className='syllabus-status';
  status.textContent='Academy-suggested topics — not an official PPSC syllabus';
  const info=document.createElement('p');
  info.textContent=fromCatalog?
   'These preparation topics are linked to the academy job catalog. Verify every subject and weighting against the official syllabus for your case number.':
   source?'Suggested topics for this kind of post. Verify the exact official PPSC syllabus before relying on this outline.':
   'No verified syllabus is stored for this post. This is general preparation guidance until official case-specific details are reviewed.';
  const list=document.createElement('ul');
  topics.forEach(topic=>{const li=document.createElement('li');li.textContent=topic;list.append(li)});
  const advice=document.createElement('p');advice.textContent='Suggested approach: check the official advertisement, create subject notes, practise topic-wise MCQs, and revise mistakes. No official paper pattern is implied.';
  out.append(h,status,info,list,advice);
  const search='site:ppsc.gop.pk syllabus '+role+(chosen&&chosen.caseNo?' '+chosen.caseNo:'');
  official.href='https://www.google.com/search?q='+encodeURIComponent(search);
  official.textContent='Search official PPSC pages for '+role;
 }
 select.addEventListener('change',()=>{query.value='';render()});
 button.addEventListener('click',render);
 query.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();render()}});
 render();
 window.addEventListener('lama:jobs-updated',()=>{const current=catalog.fromUrl()?.id||select.value;catalog.populate(select,{allowEmpty:true,emptyLabel:'Choose a preparation job',value:current});render()});
})();
