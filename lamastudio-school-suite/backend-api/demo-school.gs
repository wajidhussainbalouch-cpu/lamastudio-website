/**
 * Private promotional demo school. Copy this file into the EXISTING School Suite
 * Apps Script project beside code.gs. Do not run setup() or create another registry.
 * Editor only: no web/API action is added. Set the temporary Script Property
 * LAMA_DEMO_SETUP_PASSWORD to a unique 16+ character private password, then run
 * lamaCreateDemoSchool. Login details are described below; never show passwords
 * or session keys in recordings. All contact values are intentionally non-dialable.
 * This is a one-time installer; no resets, no updates to any existing school.
 */
function lamaCreateDemoSchool() {
  const props = PropertiesService.getScriptProperties();
  const base = props.getProperty('LAMA_DEMO_SETUP_PASSWORD');
  if (!base || base.length < 16 || base.length > 80 || /\s/.test(base))
    throw Error('Set LAMA_DEMO_SETUP_PASSWORD (16–80 characters, no whitespace).');
  const registry = getRegistrySheet();
  const name = 'LAMA Demo School';
  const email = 'owner@lama-demo.invalid';
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw Error('School registration is busy. Retry.');
  let school, match;
  const now = new Date();
  const iso = now.toISOString();
  const tz = 'Asia/Karachi';
  const day = d => Utilities.formatDate(d,tz,'yyyy-MM-dd');
  const today = day(now);
  const classes = ['PG','Nursery','Prep','Class 1','Class 2','Class 3','Class 4','Class 5'];
  const rates = [1000,1000,1000,1250,1250,1500,1500,1500];
  const setRegistry = (fields) => {
    const current = findSchoolRow(registry,r=>r.schoolId===school.schoolId);
    if (!current || current.obj.adminEmail!==email || current.obj.name!==name ||
        current.obj.sheetId!==match.obj.sheetId) throw Error('Demo school identity mismatch.');
    Object.keys(fields).forEach(k=>{
      const c=current.headers.indexOf(k);
      if(c<0)throw Error('Missing registry field: '+k);
      registry.getRange(current.rowIndex,c+1).setValue(fields[k]);
    });
  };
  try {
    if(findSchoolRow(registry,r=>String(r.adminEmail).toLowerCase()===email || String(r.name).trim().toLowerCase()===name.toLowerCase()))
      throw Error('A demo school already exists. No duplicate or overwrite was performed.');
    school=registerSchool({name,adminEmail:email,password:base+'-owner',type:'Private',level:'Primary',principal:'Ayesha Karim (Demo)',address:'Demo Campus, Pakistan — fictional address',phone:'03XX-0000000'});
    match=findSchoolRow(registry,r=>r.schoolId===school.schoolId);
    if(!match || match.obj.adminEmail!==email)throw Error('Unable to verify newly created demo school.');
    // Keep the new school inaccessible until all fixtures are written and checked.
    setRegistry({status:'Blocked',plan:'Free',subscriptionType:'Free',subscriptionStart:'',subscriptionEnd:'',subscriptionNotes:'Private fictional marketing demo; no billing or real contact details.',privateSub:'Standard Private',feeOptional:false,offeredClassesJson:JSON.stringify(classes.map(name=>({name,sections:['A']}))),feeCategoriesJson:JSON.stringify([{name:'Tuition Fee',enabled:true,cadence:'monthly',rates:classes.map((className,i)=>({className,amount:rates[i]}))}])});
    const ss=SpreadsheetApp.openById(match.obj.sheetId);
    const male=['Ahmed','Hamza','Bilal','Usman','Ali','Hassan','Ibrahim','Yusuf','Abdullah','Saad'];
    const female=['Ayesha','Fatima','Maryam','Zainab','Hira','Amina','Sara','Noor','Hafsa','Iqra'];
    const surnames=['Karim','Raza','Naeem','Farooq','Saeed','Malik','Akram','Latif','Aslam','Khalid','Shah','Iqbal','Amjad','Sadiq','Saleem'];
    const fathers=['Kashif','Tariq','Imran','Adnan','Naveed','Asif','Faisal','Javed','Salman','Rashid','Waseem','Shahid','Noman','Kamal','Arif'];
    const teacherNames=['Sana Raza','Mariam Iqbal','Hina Akram','Farah Saeed','Umar Malik','Adeel Karim','Nadia Aslam','Fahad Latif'];
    const teachers=[],students=[],attendance=[],teacherAttendance=[],fees=[],homework=[],notifications=[],resources=[],tests=[],datesheet=[],staff=[];
    const stamp=(id,fields)=>Object.assign({id,createdAt:iso},fields);
    const adminId=genId('adm');
    const salt=Utilities.getUuid();
    const admin=secureTab(ss,ADMIN_USERS_TAB,ADMIN_USERS_HEADERS);
    admin.appendRow(recordToRow(ADMIN_USERS_HEADERS,{id:adminId,username:'demo.admin',displayName:'Demo Administrator',passwordHash:hashPassword(base+'-admin',salt),salt,status:'Active',version:1,createdAt:iso,updatedAt:iso}));
    const workingDates=[];
    for(let offset=0;workingDates.length<12;offset++){
      const d=new Date(now.getTime()-offset*86400000);
      const key=day(d);
      if(new Date(key+'T12:00:00Z').getUTCDay()!==0)workingDates.push(key);
    }
    const lastWorking=workingDates[0];
    const nextMonthDay=new Date(now.getTime()+3*86400000);
    const nextDate=day(nextMonthDay);
    classes.forEach((cls,c)=>{
      const tid=genId('tch');
      const loginId='demo.teacher'+(c+1);
      const teacher=stamp(tid,{name:teacherNames[c],loginId,passwordHash:hashPassword(base+'-teacher'+(c+1),tid),apiKey:Utilities.getUuid(),subject:'English',assignedClass:cls,assignedSection:'A',contact:'03XX-100000'+(c+1),status:'Active',gender:c<4||c===6?'F':'M',qualification:'B.Ed',designation:'Class Teacher',joiningDate:'2026-04-01',address:'Demo Campus'});
      teachers.push(teacher);
      workingDates.forEach((date,i)=>teacherAttendance.push(stamp(genId('tat'),{teacherId:tid,teacherName:teacher.name,date,status:(c===7&&i===0)?'Absent':'Present',markedBy:'Demo Administrator'})));
      ['English','Urdu','Maths'].forEach((subject,i)=>homework.push(stamp(genId('hw'),{class:cls,section:'A',subject,title:subject+' Practice',description:['Read the lesson and write five sentences.','سبق پڑھیں اور پانچ الفاظ لکھیں۔','Complete exercise questions 1–5.'][i],dueDate:nextDate,assignedBy:teacher.name,teacherId:tid})));
      tests.push(stamp(genId('test'),{class:cls,subject:'English',type:'Class Test',title:'English Class Test (Demo)',date:nextDate,totalMarks:25,topics:'Reading and vocabulary',schoolId:school.schoolId,isPublished:true,published:true,status:'Published'}));
      datesheet.push(stamp(genId('exam'),{class:cls,subject:'English',examTitle:'Monthly Assessment (Demo)',date:nextDate,time:'09:00 AM',invigilator:teacher.name,schoolId:school.schoolId,isPublished:true,published:true,status:'Published'}));
      for(let j=0;j<15;j++){
        const n=c*15+j+1, num=String(n).padStart(3,'0'), gender=n%2?'M':'F';
        const first=(gender==='M'?male:female)[Math.floor((n-1)/2)%10];
        const surname=surnames[(j+c)%surnames.length];
        const father=fathers[(j+2*c)%fathers.length]+' '+surname;
        const id=genId('stu');
        const contact='03XX-0000'+num;
        const student=stamp(id,{enrlNo:'DEMO-'+num,studentCode:'DEMO-'+num,admissionNo:'D-'+num,name:first+' '+surname,gender,dob:(2022-Math.max(0,c-1))+'-05-'+String(j+1).padStart(2,'0'),fatherGuardian:father,guardianName:father,guardianRelation:'Father',contact,whatsapp:contact,guardianCell:contact,address:'Fictional Demo Address '+num,guardianAddress:'Fictional Demo Address '+num,profession:'Private service',class:cls,section:'A',academicSession:today.slice(0,4)+'–'+(Number(today.slice(0,4))+1),admissionDate:today.slice(0,4)+'-04-01',password:base+'-student'+num,apiKey:Utilities.getUuid(),remarks:'Fictional demonstration record'});
        students.push(student);
        workingDates.forEach((date,i)=>attendance.push(stamp(genId('att'),{studentId:id,studentName:student.name,enrlNo:student.enrlNo,class:cls,section:'A',date,status:(n%10===0||((n+i)%19===0))?'Absent':'Present',markedBy:'Demo Administrator'})));
        const status=n%10===0?'Overdue':n%4===0?'Pending':'Paid';
        fees.push(stamp(genId('fee'),{studentId:id,studentName:student.name,class:cls,amount:rates[c],date:lastWorking,status,method:status==='Paid'?'Cash':'',receivedByAdminId:status==='Paid'?adminId:'',receivedByAdminName:status==='Paid'?'Demo Administrator':''}));
      }
    });
    ['Office Assistant','School Caregiver'].forEach((designation,i)=>{
      const id=genId('staff');
      staff.push(stamp(id,{name:i?'Nasreen Raza':'Kamran Saeed',loginId:'demo.staff'+(i+1),passwordHash:hashPassword(base+'-staff'+(i+1),id),apiKey:Utilities.getUuid(),designation,contact:'03XX-200000'+(i+1),joiningDate:'2026-04-01',status:'Active'}));
    });
    notifications.push(stamp(genId('not'),{title:'Monthly Assessment (Demo)',audience:'All',channel:'Portal',message:'Please prepare for the upcoming monthly assessment. Fictional demonstration notice.',status:'Published',isPublished:true,date:today,notificationType:'General'}));
    resources.push(stamp(genId('res'),{category:'school-working-week',title:'School Working Days and Holidays',description:JSON.stringify({version:1,weeklyOff:[0]}),link:''}));
    const datasets={students,teachers,attendance,teacherAttendance,fees,homework,notifications,resources,tests,datesheet,nonTeachingStaff:staff};
    Object.keys(datasets).forEach(key=>{
      const cfg=COLLECTIONS[key],sh=ss.getSheetByName(cfg.tab),rows=datasets[key];
      if(!sh||sh.getLastRow()!==1)throw Error('Expected empty new demo tab: '+key);
      if(sh.getMaxRows()<rows.length+1)sh.insertRowsAfter(sh.getMaxRows(),rows.length+1-sh.getMaxRows());
      const grid=sh.getRange(2,1,rows.length,cfg.headers.length);
      grid.setNumberFormat('@');
      grid.setValues(rows.map(row=>recordToRow(cfg.headers,row)));
      if(sh.getLastRow()!==rows.length+1)throw Error('Demo record count mismatch: '+key);
    });
    writeAudit(ss,school.schoolId,{id:adminId,name:'Demo Administrator',role:'schoolAdmin'},'seed','demoSchool',school.schoolId,null,{fictional:true,students:students.length,teachers:teachers.length,feeRecords:fees.length,attendanceRecords:attendance.length});
    SpreadsheetApp.flush();
    setRegistry({status:'Active'});
    props.deleteProperty('LAMA_DEMO_SETUP_PASSWORD');
    Logger.log('Demo school created. School ID: '+school.schoolId+'; owner email: '+email+'; admin username: demo.admin; teacher ID: demo.teacher1; student enrollment: DEMO-001. Passwords: your private setup password followed by -owner, -admin, -teacher1 or -student001, respectively. Do not show credentials in marketing materials.');
  } catch(e) {
    // Never reset or delete an existing school. If the new school is incomplete, block it.
    if(school&&match){try{setRegistry({status:'Blocked'});}catch(ignore){Logger.log('Check newly created demo school status manually: '+school.schoolId);}}
    throw e;
  } finally {lock.releaseLock();}
}
