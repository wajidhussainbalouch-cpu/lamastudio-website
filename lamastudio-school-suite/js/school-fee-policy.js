/* School-wide fee schedules. Stored in existing school feeCategoriesJson,
 * not device storage. Plans are estimates, not issued invoices or payment records.
 */
(function(root){
'use strict';
const key=v=>String(v??'').trim().toLowerCase().replace(/^(class|grade|standard|std)[\s._-]+(?=\d)/,'').replace(/^0+(?=\d)/,'').replace(/\s+/g,'');
const nameKey=v=>String(v??'').trim().toLowerCase().replace(/\s+/g,' ');
const isTuition=n=>['tuitionfee','monthlyfee','schoolfee','tuition'].includes(key(n));
function parse(v){if(Array.isArray(v))return v;if(!v)return [];const a=JSON.parse(v);if(!Array.isArray(a))throw Error('Invalid saved settings.');return a}
function mode(s){return String(s?.type||'').toLowerCase()==='government'?'government':/pef/i.test(String(s?.privateSub||''))?'pef':'private'}
function vouchersAllowed(s){return nameKey(s?.type)==='private'&&nameKey(s?.privateSub)==='standard private'}
function amount(value){if(value===''||value===null||value===undefined)return null;const n=Number(value);if(!Number.isFinite(n)||n<0||n>10000000||Math.abs(n*100-Math.round(n*100))>1e-6)throw Error('Enter a fee from 0 to 10,000,000 with at most two decimals.');return Math.round(n*100)/100}
function classes(s){return parse(s?.offeredClassesJson).map(c=>String(c.name||'').trim()).filter(Boolean)}
function categories(s){return parse(s?.feeCategoriesJson).filter(c=>c&&typeof c.name==='string').map(c=>({...c,enabled:c.enabled===true,cadence:['monthly','one-time','as-needed'].includes(c.cadence)?c.cadence:(isTuition(c.name)?'monthly':'as-needed'),rates:Array.isArray(c.rates)?c.rates:[]}))}
function ratesFor(c,cls){const match=c.rates.find(r=>key(r.className)===key(cls));return amount(match?.amount)}
function permitted(c,s){return c.enabled&&(!isTuition(c.name)||vouchersAllowed(s))}
function schedule(s,entries,offered){
 const cls=new Map(offered.map(n=>[key(n),String(n).trim()]));
 const used=new Set();
 const out=entries.filter(c=>c.enabled).map(c=>{
  const n=String(c.name||'').trim(),k=nameKey(n);
  if(!n||n.length>80||used.has(k))throw Error('Invalid or duplicate fee category.');
  used.add(k);
  if(isTuition(n)&&!vouchersAllowed(s))throw Error('Tuition is disabled for government and PEF schools. Configure only authorized non-tuition collections.');
  const seen=new Set(),rates=[];
  for(const r of c.rates||[]){const k=key(r.className);if(!cls.has(k))continue;if(seen.has(k))throw Error('Duplicate class fee rate.');seen.add(k);const a=amount(r.amount);if(a!==null)rates.push({className:cls.get(k),amount:a})}
  return {name:n,enabled:true,cadence:['monthly','one-time','as-needed'].includes(c.cadence)?c.cadence:'as-needed',rates};
 });
 const serialized=JSON.stringify(out);if(serialized.length>12000||out.length>60)throw Error('Fee schedule exceeds the existing settings storage limit.');
 return serialized;
}
function preview(s,students,selectedNames){
 if(!vouchersAllowed(s))throw Error('Voucher previews are disabled for this school type.');
 const allowedClasses=new Set(classes(s).map(key)),selected=new Set(selectedNames.map(nameKey));
 const enabled=categories(s).filter(c=>permitted(c,s)&&selected.has(nameKey(c.name)));
 if(!enabled.length)throw Error('Select at least one configured fee category.');
 return students.filter(st=>allowedClasses.has(key(st.class||st.className||st.grade))).map(st=>{
  const cls=st.class||st.className||st.grade,lines=[],missing=[];
  for(const c of enabled){const a=ratesFor(c,cls);if(a===null)missing.push(c.name);else if(a>0)lines.push({name:c.name,amount:a,cadence:c.cadence})}
  return {student:st,lines,missing,total:lines.reduce((sum,c)=>sum+Math.round(c.amount*100),0)/100};
 });
}
root.LamaFeePolicy={key,nameKey,isTuition,mode,vouchersAllowed,amount,classes,categories,ratesFor,permitted,schedule,preview};
})(typeof window!=='undefined'?window:globalThis);