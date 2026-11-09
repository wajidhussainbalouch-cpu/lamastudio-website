'use strict';
// Read-only per-school PWA identity. Never trust a caller-supplied approval flag.
const sharp=require('sharp');
const SCRIPT_URL='https://script.google.com/macros/s/AKfycbz8Num29Df94i-TNlX4ggN6nveyVLpoPDo4feStMXV3DuAx-JoRD3nZH1Q90kVuEH57/exec';
const BASE='/lamastudio-school-suite/';
const clean=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{4,100}$/.test(x);
function fail(res,status,message){return res.status(status).json({error:message});}
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET')return fail(res,405,'GET required');
  const schoolId=req.query.schoolId,kind=req.query.kind||'profile';
  if(!clean(schoolId)||!['profile','manifest','icon'].includes(kind))
    return fail(res,400,'Invalid school or request');
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    let result;
    try{
      const response=await fetch(SCRIPT_URL+'?action=getPublicSchoolPwa&schoolId='+encodeURIComponent(schoolId),
        {signal:controller.signal,headers:{Accept:'application/json'},redirect:'follow'});
      if(!response.ok)throw Error('School app verification unavailable');
      result=await response.json();
    }finally{clearTimeout(timeout);}
    if(result.status!=='success'||!result.pwa||result.pwa.schoolId!==schoolId)
      return fail(res,403,'School branded PWA is not approved or ready');
    const name=String(result.pwa.name||'').trim(),logo=String(result.pwa.logo||'');
    if(!name||name.length>120||!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(logo)||logo.length>60000)
      return fail(res,403,'School app name or logo is not configured');
    if(kind==='profile')return res.status(200).json({schoolId,name});
    if(kind==='manifest'){
      const icon=size=>'/api/school-pwa?kind=icon&schoolId='+encodeURIComponent(schoolId)+'&size='+size;
      res.setHeader('Content-Type','application/manifest+json; charset=utf-8');
      return res.status(200).end(JSON.stringify({
        id:BASE+'installed-school/'+encodeURIComponent(schoolId),
        name,short_name:name.slice(0,20),
        start_url:BASE+'install-school.html?schoolId='+encodeURIComponent(schoolId)+'&launch=1',
        scope:BASE,display:'standalone',background_color:'#ffffff',theme_color:'#0b626d',
        icons:[{src:icon(192),sizes:'192x192',type:'image/png',purpose:'any maskable'},
          {src:icon(512),sizes:'512x512',type:'image/png',purpose:'any maskable'}]
      }));
    }
    const size=Number(req.query.size);
    if(size!==192&&size!==512)return fail(res,400,'Unsupported icon size');
    const bytes=Buffer.from(logo.split(',')[1],'base64');
    if(!bytes.length||bytes.length>50000)return fail(res,403,'Invalid school image');
    const png=await sharp(bytes,{limitInputPixels:1024*1024})
      .resize(size,size,{fit:'contain',background:'#ffffff'}).png().toBuffer();
    res.setHeader('Content-Type','image/png');
    return res.status(200).end(png);
  }catch(error){return fail(res,503,'Branded app service is unavailable. Please retry later.');}
};
