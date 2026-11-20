/* Client-side adaptive A4 register PDF, no external PDF libraries.
 * Canvas preserves Unicode names using device fonts. PDF pages have fixed physical dimensions.
 */
(function(root){
'use strict';
const MM=72/25.4,M=7,TOP=27,HEAD=6,ROW=4.0,FOOT=20;
function layout(report,choice='auto'){
 // Choose orientation by width as well as student count; full-month identity columns need space.
 const portrait=choice==='portrait';
 const W=portrait?210:297,H=portrait?297:210;
 return {W,H,orientation:portrait?'portrait':'landscape',capacity:Math.floor((H-FOOT-TOP-HEAD)/ROW)};
}
function paginate(rows,capacity=37){
 const pages=[];for(let i=0;i<rows.length;i+=capacity)pages.push(rows.slice(i,i+capacity));
 return pages.length?pages:[[]];
}
function calendar(days,resources,asOf){
 const available=Array.isArray(resources);
 const kinds=days.map(d=>{const n=new Date(d+'T12:00:00Z').getUTCDay();if(!available)return n===0?'S':'W';const reason=root.LamaSchoolWeek.reason(resources,d);return reason?(n===0&&/weekly holiday/i.test(reason)?'S':'H'):'W'});
 const count=k=>kinds.filter(x=>x===k).length;
 return {available,kinds,working:count('W'),holidays:available?count('H'):null,nonworking:count('H')+count('S'),sundays:count('S'),elapsedWorking:days.filter((d,i)=>d<=asOf&&kinds[i]==='W').length,asOf};
}
function rowSummary(marks,days,cal){
 const n=k=>marks.filter((x,i)=>x===k&&cal.kinds[i]==='W').length;
 return [n('P'),n('A'),n('L'),cal.working,cal.nonworking,cal.holidays??'?',days.filter((d,i)=>d<=cal.asOf&&cal.kinds[i]==='W'&&!marks[i]).length];
}
function markFor(mark,day,kind,asOf){return kind==='H'||kind==='S'?(mark?kind+'*':kind):mark||(day>asOf?'':'–')}
const summaryHeaders=['P','A','L','WD','NW','H','U'];
function pack(images,{W=297,H=210}={}){
 const enc=new TextEncoder(),chunks=[],offsets=[0];let length=0;
 function add(x){const b=typeof x==='string'?enc.encode(x):x;chunks.push(b);length+=b.length}
 function object(n,body){offsets[n]=length;add(n+' 0 obj\n');for(const x of body)add(x);add('\nendobj\n')}
 add('%PDF-1.4\n');
 object(1,['<< /Type /Catalog /Pages 2 0 R >>']);
 object(2,['<< /Type /Pages /Count '+images.length+' /Kids ['+images.map((_,i)=>(3+3*i)+' 0 R').join(' ')+'] >>']);
 const width=(W*MM).toFixed(3),height=(H*MM).toFixed(3);
 images.forEach((img,i)=>{
  const p=3+3*i,stream='q\n'+width+' 0 0 '+height+' 0 0 cm\n/Im0 Do\nQ\n';
  object(p,['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+width+' '+height+'] /Resources << /XObject << /Im0 '+(p+1)+' 0 R >> >> /Contents '+(p+2)+' 0 R >>']);
  object(p+1,['<< /Type /XObject /Subtype /Image /Width '+img.width+' /Height '+img.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+img.bytes.length+' >>\nstream\n',img.bytes,'\nendstream']);
  object(p+2,['<< /Length '+enc.encode(stream).length+' >>\nstream\n',stream,'endstream']);
 });
 const xref=length;add('xref\n0 '+offsets.length+'\n0000000000 65535 f \n');
 for(let n=1;n<offsets.length;n++)add(String(offsets[n]).padStart(10,'0')+' 00000 n \n');
 add('trailer\n<< /Size '+offsets.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');
 return new Blob(chunks,{type:'application/pdf'});
}
function drawPage(canvas,report,rows,index,count,plan,logo){
 const {W,H,capacity}=plan,scale=8;canvas.width=W*scale;canvas.height=H*scale;
 const c=canvas.getContext('2d');if(!c)throw Error('PDF drawing is unavailable on this device.');
 c.scale(scale,scale);c.fillStyle='#fff';c.fillRect(0,0,W,H);
 function text(value,x,y,size=2.5,{bold=false,align='left',max=Infinity,color='#162e35'}={}){
  const s=String(value??'');let f=size;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';
  const font=()=>{c.font=(bold?'bold ':'')+f+'px Arial, sans-serif'};font();
  while(f>1.7&&c.measureText(s).width>max){f-=0.12;font()}
  c.fillText(s,x,y,Number.isFinite(max)?max:W);
 }
 function cell(x,y,w,h,fill='#fff'){c.fillStyle=fill;c.fillRect(x,y,w,h);c.strokeStyle='#a4b3b6';c.lineWidth=.13;c.strokeRect(x,y,w,h)}
 const cal=report.calendar;
 if(logo){const ratio=Math.min(20/logo.naturalWidth,20/logo.naturalHeight),lw=logo.naturalWidth*ratio,lh=logo.naturalHeight*ratio;c.drawImage(logo,W-M-20+(20-lw)/2,6+(20-lh)/2,lw,lh)}
 text(report.school,M,10,5.5,{bold:true,max:W-2*M-(logo?23:0)});
 text('MONTHLY STUDENT ATTENDANCE REGISTER',M,17,3.8,{bold:true,max:W-2*M-(logo?23:0)});
 text(report.label+'  |  '+report.month+'  |  Students: '+report.rows.length,M,23,2.8,{max:W-2*M-(logo?23:0)});
 const portrait=plan.orientation==='portrait',showClass=report.showClass??report.label==='All Classes';
 const identity=[{label:'No.',w:6,value:(r,n)=>n},{label:'Enrol.',w:portrait?13:17,value:r=>r.enrollment},{label:'Student Name',w:portrait?27:38,value:r=>r.name,left:true},{label:'Father Name',w:portrait?26:37,value:r=>r.fatherName,left:true}];
 if(showClass)identity.push({label:'Class',w:portrait?13:19,value:r=>r.className,left:true});
 const numW=portrait?4.5:6,dayW=(W-2*M-identity.reduce((n,v)=>n+v.w,0)-numW*7)/report.days.length;
 const cols=[...identity.map(v=>v.w),...report.days.map(()=>dayW),...summaryHeaders.map(()=>numW)];
 const labels=[...identity.map(v=>v.label),...report.days.map(d=>d.slice(-2)),...summaryHeaders];
 let x=M;cols.forEach((w,i)=>{const j=i-identity.length,kind=j>=0&&j<report.days.length?cal.kinds[j]:'';cell(x,TOP,w,HEAD,kind==='H'?'#f9e6c6':kind==='S'?'#dce5e8':'#e2eff0');text(labels[i],x+w/2,TOP+HEAD/2,2.35,{bold:true,align:'center',max:w-.6});x+=w});
 rows.forEach((row,i)=>{
  const y=TOP+HEAD+i*ROW;let x=M;
  for(const col of identity){
   cell(x,y,col.w,ROW,i%2?'#f5f8f8':'#fff');
   text(col.value(row,index*capacity+i+1)||'—',col.left?x+.7:x+col.w/2,y+ROW/2,2.5,{bold:col.label==='Student Name',align:col.left?'left':'center',max:col.w-1.2});
   x+=col.w;
  }
  row.marks.forEach((mark,j)=>{
   const kind=cal.kinds[j],v=markFor(mark,report.days[j],kind,cal.asOf);
   const fill={P:'#e0f4e8',A:'#fbe4e4',L:'#fff1cf',H:'#f9e6c6',S:'#e8edef'}[v]||'#fff';
   cell(x,y,dayW,ROW,fill);text(v,x+dayW/2,y+ROW/2,2.45,{align:'center',max:dayW-.5,color:{P:'#195e40',A:'#952635',L:'#795500'}[v]||'#75848a'});x+=dayW;
  });
  for(const v of rowSummary(row.marks,report.days,cal)){cell(x,y,numW,ROW,'#f4f8f8');text(v,x+numW/2,y+ROW/2,2.4,{align:'center',max:numW-.6});x+=numW}
 });
 if(!rows.length)text('No students in this selection.',M+1,TOP+HEAD+3,2.7);
 text('P = Present · A = Absent · L = Leave · WD = Working days · NW = Non-working days · H = Holidays',M,H-16,2.25,{max:W-2*M});
 text('U = Unmarked elapsed working days · S = Sunday · – = Not marked · Blank = Future working day',M,H-12,2.25,{max:W-2*M});
 text(cal.available?'WD/NW/H cover the full month; saved marks are retained on closures.':'Holiday calendar unavailable; WD/NW provisional (Sundays only).',M,H-8.5,2.05,{max:W-2*M});
 text('LAMA School Suite · LamaStudio.pk',M,H-4.5,2.1,{color:'#52666c'});
 text('Page '+(index+1)+' of '+count,W-M,H-4.5,2.1,{align:'right'});
}
async function loadLogo(url){
 if(!url)return null;
 if(!/^https:\/\/[^\s"'<>]+$/i.test(url)&&!/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(url))return null;
 return new Promise(resolve=>{const img=new Image();let done=false;const finish=v=>{if(done)return;done=true;clearTimeout(timer);resolve(v)};const timer=setTimeout(()=>finish(null),4000);img.crossOrigin='anonymous';img.onload=()=>finish(img.naturalWidth&&img.naturalHeight?img:null);img.onerror=()=>finish(null);img.src=url});
}
async function create(report,choice='auto'){
 if(!report||!Array.isArray(report.rows)||!Array.isArray(report.days)||report.days.length<28||report.days.length>31)throw Error('Select a valid month and load the saved register first.');
 if(report.rows.some(r=>!Array.isArray(r.marks)||r.marks.length!==report.days.length||r.marks.some(v=>!['','P','A','L'].includes(v))))throw Error('Attendance data is incomplete.');
 if(!report.calendar||report.calendar.kinds?.length!==report.days.length)throw Error('Attendance calendar is incomplete.');
 const plan=layout(report,choice),pages=paginate(report.rows,plan.capacity),images=[];
 const logo=await loadLogo(report.logo);
 for(let i=0;i<pages.length;i++){
  const canvas=document.createElement('canvas');drawPage(canvas,report,pages[i],i,pages.length,plan,logo);
  const jpeg=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not create the PDF page.')),'image/jpeg',.94));
  images.push({width:canvas.width,height:canvas.height,bytes:new Uint8Array(await jpeg.arrayBuffer())});
  canvas.width=1;canvas.height=1;
 }
 return {blob:pack(images,plan),pages:pages.length,orientation:plan.orientation,logoIncluded:!!logo};
}
root.LamaRegisterPdf={create,paginate,pack,layout,calendar,rowSummary,markFor,summaryHeaders};
})(typeof window!=='undefined'?window:globalThis);