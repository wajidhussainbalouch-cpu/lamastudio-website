/* Run: node examination-system/test-syllabus-scheduler.js */
const assert=require("node:assert/strict");
const s=require("./syllabus-scheduler.js");
const chapters=[{id:"ch1",title:"Numbers",lessons:[{id:"l1",title:"Counting",periods:2},{id:"l2",title:"Place value",periods:2}]}];
function plan(off,division="monthly"){return s.buildPlan({calendar:{startDate:"2027-03-01",durationMonths:6,weeklyOffDays:off,holidays:[{date:"2027-03-03",name:"School holiday"}]},chapters,division,periodsPerDay:1,revisionDays:1,assessmentDays:1});}
const government=plan([0,6]);const privateSchool=plan([0]);
assert.equal(government.scheduled.filter(x=>x.lessonId).length,4);
assert.equal(privateSchool.scheduled.filter(x=>x.lessonId).length,4);
assert(privateSchool.metadata.teachingDays>government.metadata.teachingDays);
assert(!government.scheduled.some(x=>x.date==="2027-03-03"));
assert(!government.scheduled.some(x=>[0,6].includes(new Date(x.date+"T12:00:00Z").getUTCDay())));
assert.equal(s.teacherDiary(government,"2027-03-01")[0].title,"Counting");
assert.equal(plan([0,6],"three-terms").periods.length,3);
assert.equal(plan([0,6],"quarterly").periods.length,4);
assert.equal(plan([0,6],"two-terms").periods.length,2);
assert.equal(s.periods({startDate:"2027-12-01",endDate:"2028-02-29",mode:"monthly"}).length,3);
assert.equal(s.workingDates({startDate:"2027-03-01",durationMonths:1,weeklyOffDays:[0]}).days.length,27);
assert.throws(()=>s.buildPlan({calendar:{startDate:"2027-03-01",durationMonths:1,weeklyOffDays:[0,1,2,3,4,5,6]},chapters}),/Insufficient teaching days/);
assert.throws(()=>s.periods({startDate:"2027-03-01",endDate:"2027-04-30",mode:"custom",terms:[{id:"a",name:"A",startDate:"2027-03-01",endDate:"2027-04-01"},{id:"b",name:"B",startDate:"2027-04-01",endDate:"2027-04-30"}]}),/Overlapping/);
console.log("Syllabus scheduler tests passed");
