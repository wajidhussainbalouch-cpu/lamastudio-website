'use strict';
/**
 * Draft division generator from verified unit headings. NOT textbook exercise verification.
 * No dates are stored in the division. Review and approve before publishing.
 */
const STRANDS=[
 {key:'reading',name:'Reading and comprehension',difficulty:'moderate',periods:3,weight:3},
 {key:'oral',name:'Oral communication',difficulty:'easy',periods:1,weight:1},
 {key:'language',name:'Vocabulary and language focus',difficulty:'moderate',periods:2,weight:2},
 {key:'grammar',name:'Grammar concepts and practice',difficulty:'difficult',periods:3,weight:3},
 {key:'writing',name:'Guided writing and correction',difficulty:'difficult',periods:3,weight:3}
];
function createDraftDivision(catalog){
 if(!catalog||!Array.isArray(catalog.units)||!Array.isArray(catalog.reviews))throw Error('Invalid catalog');
 const lessons=[], reviews=new Map(catalog.reviews.map(r=>[r.afterUnit,r]));
 for(const unit of catalog.units){
  if(!Number.isSafeInteger(unit.unit)||!unit.title||!Number.isSafeInteger(unit.printedPageStart))throw Error('Invalid unit');
  for(const strand of STRANDS){
   lessons.push({lessonId:'EN5-U'+String(unit.unit).padStart(2,'0')+'-'+strand.key.toUpperCase(),
    unitId:'U'+unit.unit,unitTitle:unit.title,topic:strand.name,
    subtopics:[],sourcePageReference:unit.printedPageStart,learningObjectives:[],
    difficulty:strand.difficulty,weight:strand.weight,estimatedPeriods:strand.periods,
    assessment:'Teacher check for understanding',sourceConfidence:'Unit heading verified; detailed topic and period estimate require teacher review',
    approvalStatus:'draft'});
  }
  if(reviews.has(unit.unit)){
   const r=reviews.get(unit.unit);
   lessons.push({lessonId:'EN5-REVIEW-'+unit.unit,unitId:'REVIEW-'+unit.unit,
    unitTitle:r.title,topic:'Unit review and assessment',subtopics:[],sourcePageReference:r.printedPageStart,
    learningObjectives:[],difficulty:'moderate',weight:2,estimatedPeriods:2,
    assessment:'Review and formative assessment',sourceConfidence:'Review heading verified; exercises require verification',
    approvalStatus:'draft'});
  }
 }
 const ids=lessons.map(x=>x.lessonId);
 if(new Set(ids).size!==ids.length)throw Error('Duplicate lesson ID');
 return {schemaVersion:1,subjectId:catalog.subjectId,classId:catalog.classId,status:'draft',
  source:catalog.source,lessons,notes:'Provisional weights and periods; not an approved or page-exact syllabus division. Dates belong only to the schedule.'};
}
if(typeof module!=='undefined')module.exports={createDraftDivision};
