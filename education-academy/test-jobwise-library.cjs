'use strict';
/* Job-wise subject archive, ordered paper listing and accessible side menu:
 * purely local DOM and registry simulation, no external network.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),router=read('academy-router.js'),section=read('section.html'),worker=read('sw.js');
const expectedIds=['library','libraryJob','librarySearch','librarySummary','librarySnapshot','librarySubjectList','libraryPaperList','libraryExport','libraryExportMessage','menuPaperGroup','menuPaperJob','menuPaperItems','paperCoverageDisclosure'];
for(const id of expectedIds)assert.ok(html.includes('id="'+id+'"'),'Missing section/menu element '+id);
for(const path of ['./paper-library.js','./library-ui.js','./academy-router.js'])assert.ok(html.includes('src="'+path+'"'),'Missing script '+path);
assert.ok(html.indexOf('src="./paper-library.js"')<html.indexOf('src="./library-ui.js"'),'Library UI must load after paper registry');
assert.ok(html.indexOf('src="./library-ui.js"')<html.indexOf('src="./academy-router.js"'),'Library UI must load before router');
assert.ok(worker.includes("'./library-ui.js'"),'Offline app must include library code');
assert.ok(router.includes("'library'"),'New library hash route missing');
assert.ok(section.includes("library:'Question Bank Library'"),'Section redirect missing library view');
assert.ok(html.includes('<details id="paperCoverageDisclosure"'),'Subject chips should be optional in Papers view');
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.handlers={};this._value='';this.textContent='';this.href='';this.className='';this.disabled=false;this.hidden=false;this.type='';this.download='';}
 append(...nodes){for(const n of nodes){this.children.push(n);if(this.tagName==='select'&&this.children.length===1)this._value=n.value||'';}}
 replaceChildren(...nodes){this.children=[];this._value='';this.append(...nodes);}
 addEventListener(name,fn){(this.handlers[name]??=[]).push(fn)}
 fire(name){for(const fn of this.handlers[name]||[])fn({target:this,preventDefault(){}})}
 get value(){return this._value}
 set value(v){this._value=String(v)}
}
const ids=['libraryJob','librarySearch','librarySummary','librarySnapshot','librarySubjectList','libraryPaperList','libraryExport','libraryExportMessage','menuPaperJob','menuPaperItems'];
const nodes=new Map(ids.map(id=>[id,new Element(id==='libraryJob'||id==='menuPaperJob'?'select':'div')]));
nodes.get('librarySearch').value='';
const document={getElementById:id=>nodes.get(id)||null,createElement:tag=>new Element(tag),body:new Element('body')};
const location={href:'https://www.lamastudio.pk/education-academy/index.html?job=teaching%3A0#library',search:'?job=teaching%3A0',hash:'#library'};
const history={replaceState(_a,_b,href){location.href=String(href);location.search=new URL(href).search}};
const events={};
const window={addEventListener(name,fn){(events[name]??=[]).push(fn)}};
const localStorage={getItem:()=>null};
function load(file,extra={}){
 vm.runInNewContext(read(file),{window,location,history,localStorage,URL,URLSearchParams,document:undefined,console,...extra},{timeout:4000,filename:file});
}
load('jobs.js');
load('job-catalog-ui.js');
const questions=(id)=>Array.from({length:100},(_,i)=>({id:id+'-'+i,subject:i%2?'Educational Psychology':'Assessment',q:'Original question '+i,options:['A','B','C','D'],answer:0,explanation:'Test data only'}));
const paper=(id,job='teaching')=>({id,title:'Paper '+id,minutes:90,questions:questions(id),jobIds:[job],access:'free',publishStatus:'public',reviewStatus:'approved'});
window.LAMA_PPSC_PAPERS=[paper('HM-2026-P07'),paper('HM-2026-P03'),{...paper('DEMO-01'),access:undefined,publishStatus:undefined},paper('HM-2026-P02')];
load('paper-library.js');
const lib=window.LamaPpscPaperLibrary;
const published=lib.forJob('teaching:0');
assert.deepEqual(published.map(p=>p.id),['DEMO-01','HM-2026-P02','HM-2026-P03','HM-2026-P07'],'Papers should sort numerically, not in source order');
assert.equal(lib.forJob('information-officer').length,0);
assert.equal(lib.coverage('teaching:0').reduce((n,x)=>n+x.count,0),400);
vm.runInNewContext(read('library-ui.js'),{window,document,location,history,localStorage,URL,URLSearchParams,Blob,console},{timeout:4000,filename:'library-ui.js'});
const get=id=>nodes.get(id);
assert.equal(get('libraryPaperList').children.length,4,'Four numbered paper entries in the library');
assert.equal(get('libraryPaperList').children[0].children[0].children[0].textContent,'Paper 1');
assert.equal(get('libraryPaperList').children[3].children[0].children[0].textContent,'Paper 7');
assert.equal(get('menuPaperItems').children.length,5,'Library link plus four numbered side-menu links');
assert.ok(get('menuPaperItems').children[1].href.includes('paper=DEMO-01'),'Side menu first paper should be original Paper 1');
assert.equal(get('librarySubjectList').children.length,2,'Subjects use published MCQ aggregation');
assert.ok(!get('libraryExport').disabled,'CSV download enabled when MCQs exist');
get('librarySearch').value='psychology';get('librarySearch').fire('input');
assert.equal(get('librarySubjectList').children.length,1,'Library subject filter should work');
get('librarySearch').value='';get('libraryJob').value='data-analyst';get('libraryJob').fire('change');
assert.equal(get('libraryPaperList').children.length,1,'Unpublished job should show empty state, not another job paper');
assert.ok(get('libraryPaperList').children[0].textContent.includes('No job-specific examinations'));
assert.equal(get('libraryExport').disabled,true,'No CSV download if no published subjects');
assert.ok(location.search.includes('data-analyst'),'Selected job should be retained in location');
assert.equal(get('menuPaperItems').children.length,2,'Side menu for an unpublished job should show library link and empty state only');
const newJob={id:'future-job',title:'Future Job',post:'Example',category:'Education',subjects:['New Subject']};
window.LAMA_PPSC_JOBS.push(newJob);
for(const fn of events['lama:jobs-updated']||[])fn();
assert.ok(get('libraryJob').children.some(x=>x.value==='future-job'),'New catalog jobs should appear automatically');
window.LAMA_PPSC_PAPERS.push({...paper('FJ-2026-P01','future-job'),title:'Future job paper'});
for(const fn of events['lama:paper-completed']||[])fn();
get('libraryJob').value='future-job';get('libraryJob').fire('change');
assert.equal(get('libraryPaperList').children.length,1,'New registered paper appears automatically without another UI edit');
assert.ok(get('libraryPaperList').children[0].children.at(-1).href.includes('FJ-2026-P01'));
console.log('Job-wise question library: ordering, coverage, search, menu, empty states and new job papers passed.');
