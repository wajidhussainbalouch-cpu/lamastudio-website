'use strict';
/** Pure draft editor. Never changes submitted, approved or published divisions. */
function reviseDraftLesson({division,lessonId,changes,expectedRevision}){
 if(!division||division.status!=='draft'||!Array.isArray(division.lessons))throw Error('Only draft divisions can be revised');
 if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0||expectedRevision!==(division.revision??0))throw Error('Revision conflict');
 if(!changes||typeof changes!=='object'||Array.isArray(changes))throw Error('Invalid changes');
 const editable=new Set(['topic','subtopics','learningObjectives','difficulty','weight','estimatedPeriods','assessment','sourcePageReference']);
 for(const k of Object.keys(changes))if(!editable.has(k))throw Error('Protected field: '+k);
 if(!Object.keys(changes).length)throw Error('No changes');
 const index=division.lessons.findIndex(l=>l.lessonId===lessonId);
 if(index<0)throw Error('Unknown lesson');
 const current=division.lessons[index],updated={...current,...changes};
 if(typeof updated.topic!=='string'||!updated.topic.trim())throw Error('Topic required');
 if(!['easy','moderate','difficult'].includes(updated.difficulty))throw Error('Invalid difficulty');
 if(!Number.isSafeInteger(updated.weight)||updated.weight<1||updated.weight>5)throw Error('Invalid weight');
 if(!Number.isSafeInteger(updated.estimatedPeriods)||updated.estimatedPeriods<1||updated.estimatedPeriods>30)throw Error('Invalid periods');
 for(const k of ['subtopics','learningObjectives'])if(!Array.isArray(updated[k])||updated[k].some(v=>typeof v!=='string'||!v.trim()))throw Error('Invalid '+k);
 if(!Number.isSafeInteger(updated.sourcePageReference)||updated.sourcePageReference<1)throw Error('Invalid source page');
 const lessons=division.lessons.map((l,i)=>i===index?updated:l);
 return {...division,revision:expectedRevision+1,lessons};
}
if(typeof module!=='undefined')module.exports={reviseDraftLesson};
