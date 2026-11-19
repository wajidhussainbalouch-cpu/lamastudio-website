'use strict';
// A mocked canvas validates the exact pixel and file-size contract without saving to any real Google Sheet.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../js/teacher-photo-utils.js'),'utf8');
const btoa=x=>Buffer.from(x,'binary').toString('base64');
const atob=x=>Buffer.from(x,'base64').toString('binary');
let lastCanvas,qualityCalls=0;
const bytesToUrl=n=>'data:image/jpeg;base64,'+Buffer.concat([Buffer.from([0xff,0xd8]),Buffer.alloc(n-4,0x20),Buffer.from([0xff,0xd9])]).toString('base64');
const fakeCanvas=()=>({
 width:0,height:0,
 getContext:()=>({fillStyle:'',filter:'',fillRect(){},drawImage(){}}),
 toDataURL:(_type,q)=>{qualityCalls++;return bytesToUrl(Math.round(q*32000+3500))}
});
const URL={createObjectURL:()=> 'blob:teacher-test',revokeObjectURL:()=>{}};
class Image {
 naturalWidth=1200;naturalHeight=900;
 set src(_){this.onload?.()}
}
const root={};
const context={window:root,URL,Image,document:{createElement:type=>{
 assert.equal(type,'canvas');lastCanvas=fakeCanvas();return lastCanvas;
}},atob,btoa};
vm.createContext(context);
vm.runInContext(script,context);
const photo=root.LamaTeacherPhotos;
assert.equal(photo.WIDTH,600);assert.equal(photo.HEIGHT,800);
assert.equal(photo.MIN_BYTES,15360);assert.equal(photo.MAX_BYTES,30720);
assert.equal(photo.jpegBytes(bytesToUrl(20000)),20000);
assert.equal(photo.jpegBytes(photo.padSmallJpeg(bytesToUrl(8000))),15360,'Short JPEGs automatically pad with a valid comment marker');
assert.equal(photo.jpegBytes(photo.padSmallJpeg(bytesToUrl(15358))),15362,'Near-minimum JPEG still reaches size band');
(async()=>{
 const converted=await photo.resize({type:'image/jpeg',size:100000});
 assert.equal(converted.width,600);assert.equal(converted.height,800);
 assert.equal(lastCanvas.width,600);assert.equal(lastCanvas.height,800);
 assert.ok(converted.size>=15360&&converted.size<=30720);
 assert.equal(photo.jpegBytes(converted.dataUrl),converted.size);
 assert.ok(qualityCalls>=1);
 await assert.rejects(()=>photo.resize({type:'application/pdf',size:100}),/valid photo/);
 await assert.rejects(()=>photo.resize({type:'image/jpeg',size:16*1024*1024}),/15 MB/);
 assert.match(script,/ctx\.drawImage\(img,sx,sy,cropW,cropH,0,0,WIDTH,HEIGHT\)/,'Center crop should preserve aspect ratio');
 console.log('PASS: 600×800 photo crop, JPEG 15–30 KB, tiny-image padding and invalid-source safety.');
})().catch(error=>{console.error(error);process.exitCode=1});
