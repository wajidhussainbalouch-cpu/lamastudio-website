/* Client-side A4 landscape register PDF, no network or external libraries.
 * Canvas preserves Unicode names using device fonts. PDF pages have fixed physical dimensions.
 */
(function(root){
'use strict';
const W=297,H=210,M=7,TOP=29,HEAD=5,ROW=4.05,BOTTOM=198;
const CAPACITY=Math.floor((BOTTOM-TOP-HEAD)/ROW);
const MM=72/25.4;
function paginate(rows){
 const pages=[];for(let i=0;i<rows.length;i+=CAPACITY)pages.push(rows.slice(i,i+CAPACITY));
 return pages.length?pages:[[]];
}
function pack(images){
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
function drawPage(canvas,report,rows,index,count){
 const scale=7;canvas.width=W*scale;canvas.height=H*scale;
 const c=canvas.getContext('2d');if(!c)throw Error('PDF drawing is unavailable on this device.');
 c.scale(scale,scale);c.fillStyle='#fff';c.fillRect(0,0,W,H);
 function text(value,x,y,size=2.5,{bold=false,align='left',max=Infinity,color='#162e35'}={}){
  const s=String(value??'');let f=size;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';
  const font=()=>{c.font=(bold?'bold ':'')+f+'px Arial, sans-serif'};font();
  while(f>1.7&&c.measureText(s).width>max){f-=0.12;font()}
  c.fillText(s,x,y,Number.isFinite(max)?max:W);
 }
 function cell(x,y,w,h,fill='#fff'){c.fillStyle=fill;c.fillRect(x,y,w,h);c.strokeStyle='#a4b3b6';c.lineWidth=.13;c.strokeRect(x,y,w,h)}
 text(report.school,M,9,4.4,{bold:true,max:W-2*M});
 text('Monthly Attendance Register  |  '+report.label+'  |  '+report.month,M,15,3.2,{bold:true,max:W-2*M});
 const total=report.rows.reduce((a,r)=>{for(const k of ['P','A','L'])a[k]+=r.marks.filter(v=>v===k).length;return a},{P:0,A:0,L:0});
 text('Students: '+report.rows.length+'   |   Present: '+total.P+'   |   Absent: '+total.A+'   |   Leave: '+total.L+'   |   Total marked: '+(total.P+total.A+total.L),M,21,2.7,{max:W-2*M});
 text('P = Present   A = Absent   L = Leave   S = Sunday   – = Not recorded',M,25,2.4,{max:W-2*M});
 const nameW=50,numW=7,dayW=(W-2*M-nameW-numW*4)/report.days.length;
 const cols=[nameW,...report.days.map(()=>dayW),numW,numW,numW,numW];
 const labels=['Student / Enrollment / Class',...report.days.map(d=>d.slice(-2)), 'P','A','L','Total'];
 let x=M;cols.forEach((w,i)=>{const sun=i>0&&i<=report.days.length&&new Date(report.days[i-1]+'T12:00:00Z').getUTCDay()===0;cell(x,TOP,w,HEAD,sun?'#dce5e8':'#e2eff0');text(labels[i],i===0?x+1:x+w/2,TOP+HEAD/2,2.35,{bold:true,align:i===0?'left':'center',max:w-1});x+=w});
 rows.forEach((row,i)=>{
  const y=TOP+HEAD+i*ROW;let x=M;
  cell(x,y,nameW,ROW,i%2?'#f5f8f8':'#fff');
  text(row.name,x+1,y+1.12,2.65,{bold:true,max:nameW-2});
  text([row.enrollment,row.className].filter(Boolean).join(' · '),x+1,y+2.98,2.05,{max:nameW-2,color:'#50636a'});
  x+=nameW;
  const counts={P:0,A:0,L:0};
  row.marks.forEach((mark,j)=>{
   const sun=new Date(report.days[j]+'T12:00:00Z').getUTCDay()===0;
   const fill={P:'#e0f4e8',A:'#fbe4e4',L:'#fff1cf'}[mark]||(sun?'#e8edef':'#fff');
   if(Object.hasOwn(counts,mark))counts[mark]++;
   cell(x,y,dayW,ROW,fill);
   text(mark||(sun?'S':'–'),x+dayW/2,y+ROW/2,2.45,{align:'center',max:dayW-.5,color:{P:'#195e40',A:'#952635',L:'#795500'}[mark]||'#75848a'});
   x+=dayW;
  });
  for(const v of [counts.P,counts.A,counts.L,counts.P+counts.A+counts.L]){cell(x,y,numW,ROW,'#f4f8f8');text(v,x+numW/2,y+ROW/2,2.4,{align:'center',max:numW-1});x+=numW}
 });
 if(!rows.length)text('No students in this selection.',M+1,TOP+HEAD+3,2.7);
 text('LAMA School Suite · LamaStudio.pk',M,202,2.25,{color:'#52666c'});
 text('Page '+(index+1)+' of '+count,W-M,202,2.25,{align:'right'});
}
async function create(report){
 if(!report||!Array.isArray(report.rows)||!Array.isArray(report.days)||report.days.length<28||report.days.length>31)throw Error('Select a valid month and load the saved register first.');
 if(report.rows.some(r=>!Array.isArray(r.marks)||r.marks.length!==report.days.length||r.marks.some(v=>!['','P','A','L'].includes(v))))throw Error('Attendance data is incomplete.');
 const pages=paginate(report.rows),images=[];
 for(let i=0;i<pages.length;i++){
  const canvas=document.createElement('canvas');drawPage(canvas,report,pages[i],i,pages.length);
  const jpeg=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not create the PDF page.')),'image/jpeg',.94));
  images.push({width:canvas.width,height:canvas.height,bytes:new Uint8Array(await jpeg.arrayBuffer())});
  canvas.width=1;canvas.height=1;
 }
 return {blob:pack(images),pages:pages.length};
}
root.LamaRegisterPdf={create,paginate,pack,capacity:CAPACITY,pageSizeMM:[W,H]};
})(typeof window!=='undefined'?window:globalThis);