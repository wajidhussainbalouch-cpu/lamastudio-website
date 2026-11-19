(function(root){
'use strict';
const WIDTH=600,HEIGHT=800,MIN_BYTES=15*1024,MAX_BYTES=30*1024;
function jpegBytes(dataUrl){
 if(typeof dataUrl!=='string'||!dataUrl.startsWith('data:image/jpeg;base64,'))throw Error('JPEG image encoding failed.');
 const base64=dataUrl.slice(dataUrl.indexOf(',')+1);
 return Math.floor(base64.length*3/4)-(base64.endsWith('==')?2:base64.endsWith('=')?1:0);
}
function padSmallJpeg(dataUrl,minBytes=MIN_BYTES){
 const current=jpegBytes(dataUrl);
 if(current>=minBytes)return dataUrl;
 // A standards-compliant JPEG COM segment grows very compressible/flat
 // photographs without altering the original 600x800 pixels.
 const prefix='data:image/jpeg;base64,';
 const raw=atob(dataUrl.slice(prefix.length));
 if(raw.charCodeAt(0)!==255||raw.charCodeAt(1)!==216)throw Error('Image is not JPEG.');
 const n=Math.max(4,minBytes-current),contentLength=n-4;
 if(n<4||contentLength>65531)throw Error('Photo cannot be adjusted to required file size.');
 const len=contentLength+2;
 const com=String.fromCharCode(255,254,(len>>>8)&255,len&255)+' '.repeat(contentLength);
 return prefix+btoa(raw.slice(0,2)+com+raw.slice(2));
}
function photoBytes(dataUrl){return jpegBytes(dataUrl)}
function loadImage(file){
 return new Promise((resolve,reject)=>{
  if(!file||!/^image\//.test(file.type||''))return reject(Error('Select a valid photo from gallery or camera.'));
  if(file.size>15*1024*1024)return reject(Error('Photo exceeds 15 MB. Select a smaller source photo.'));
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Could not read this image. Select another photo.'))};
  img.src=url;
 });
}
function drawCentered(canvas,img,blur){
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)throw Error('Image processing is not supported in this browser.');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,WIDTH,HEIGHT);
 const scale=Math.max(WIDTH/img.naturalWidth,HEIGHT/img.naturalHeight);
 const cropW=WIDTH/scale,cropH=HEIGHT/scale;
 const sx=(img.naturalWidth-cropW)/2,sy=(img.naturalHeight-cropH)/2;
 ctx.filter=blur?'blur('+blur+'px)':'none';
 ctx.drawImage(img,sx,sy,cropW,cropH,0,0,WIDTH,HEIGHT);
 ctx.filter='none';
}
async function resize(file){
 const img=await loadImage(file);
 const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;
 if(!(img.naturalWidth>0&&img.naturalHeight>0))throw Error('Photo has invalid dimensions.');
 for(const blur of [0,0.5,1,1.8,3]){
  drawCentered(canvas,img,blur);
  let best=null;
  for(let step=0;step<=19;step++){
   const quality=Math.max(.04,.95-step*.047);
   const result=canvas.toDataURL('image/jpeg',quality);
   const bytes=jpegBytes(result);
   if(bytes>MAX_BYTES)continue;
   best={result,bytes};
   if(bytes>=MIN_BYTES)return {dataUrl:result,width:WIDTH,height:HEIGHT,size:bytes};
   break; // Lower qualities are even smaller.
  }
  if(best){
   const padded=padSmallJpeg(best.result);
   const bytes=jpegBytes(padded);
   if(bytes>=MIN_BYTES&&bytes<=MAX_BYTES)return {dataUrl:padded,width:WIDTH,height:HEIGHT,size:bytes};
  }
 }
 throw Error('Photo could not fit 15–30 KB at 600×800. Use a clearer, less detailed picture.');
}
root.LamaTeacherPhotos={resize,jpegBytes:photoBytes,padSmallJpeg,WIDTH,HEIGHT,MIN_BYTES,MAX_BYTES};
})(typeof window!=='undefined'?window:globalThis);
