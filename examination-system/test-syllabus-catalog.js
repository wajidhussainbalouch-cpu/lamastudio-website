const assert=require("node:assert/strict");
const c=require("./syllabus-catalog.js");
const sample={curriculumId:"punjab-2027",classId:"1",subjectId:"math",sourceVersion:"v1",reviewStatus:"verified",chapters:[{id:"unit1",title:"Numbers",lessons:[{id:"u1l1",title:"Counting",periods:2}]}]};
assert.equal(c.normalizeCatalog(sample).chapters[0].lessons[0].periods,2);
assert.equal(c.manualChecklist(sample,["u1l1"]).chapters[0].lessons[0].completed,true);
assert.throws(()=>c.normalizeCatalog({...sample,reviewStatus:"draft"}),/textbook-verified/);
assert.throws(()=>c.manualChecklist(sample,["missing"]),/Unknown lesson/);
assert.throws(()=>c.normalizeCatalog({...sample,chapters:[...sample.chapters,...sample.chapters]}),/duplicate chapter/);
console.log("Syllabus catalog tests passed");
