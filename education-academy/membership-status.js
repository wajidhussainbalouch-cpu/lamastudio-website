/* Candidate membership timeline: derived only from authenticated Supabase subscription records. */
'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const host=document.getElementById('membershipStatus');
 if(!host)return;
 const auth=window.LamaAcademyAuth;
 const day=86400000;
 const fmt=d=>new Intl.DateTimeFormat('en-PK',{day:'numeric',month:'short',year:'numeric'}).format(d);
 const wholeMonths=(start,end)=>{
  let n=(end.getFullYear()-start.getFullYear())*12+end.getMonth()-start.getMonth();
  if(end.getDate()<start.getDate())n--;
  return Math.max(0,n);
 };
 const line=(label,value)=>{const row=document.createElement('div');row.className='membership-stat';const a=document.createElement('span');a.textContent=label;const b=document.createElement('strong');b.textContent=value;row.append(a,b);return row};
 function render(status,rows,percent){
  host.replaceChildren();
  const h=document.createElement('h3');h.textContent='My Membership Status';host.append(h);
  const p=document.createElement('p');p.className='membership-state';p.textContent=status;host.append(p);
  if(rows&&rows.length){const grid=document.createElement('div');grid.className='membership-stats';rows.forEach(([a,b])=>grid.append(line(a,b)));host.append(grid)}
  if(Number.isFinite(percent)){const label=document.createElement('p');label.textContent='Membership period completed: '+Math.round(percent)+'%';host.append(label);const bar=document.createElement('progress');bar.max=100;bar.value=percent;bar.setAttribute('aria-label','Membership period completed');host.append(bar)}
 }
 async function load(){
  if(!auth||!auth.state().configured){render('Membership accounts are not available yet.');return}
  if(!auth.state().authenticated){
   try{await auth.restoreSession()}catch(e){/* Sign-in is required. */}
  }
  if(!auth.state().authenticated){render('Not signed in — log in to view your membership dates.');return}
  render('Checking your membership…');
  try{
   const records=await auth.subscriptions();
   const now=new Date();
   const current=records.find(r=>r.status==='active'&&r.starts_at&&r.expires_at&&new Date(r.starts_at)<=now&&new Date(r.expires_at)>now);
   if(!current){
    const expired=records.find(r=>r.expires_at&&new Date(r.expires_at)<=now);
    if(expired){render('Expired — renewal is not available yet.',[['Previous start',fmt(new Date(expired.starts_at||expired.expires_at))],['Expired on',fmt(new Date(expired.expires_at))]]);return}
    const pending=records.find(r=>r.status==='pending');
    render(pending?'Pending approval — membership has not started.':'Not Active — no approved membership found.');return;
   }
   const start=new Date(current.starts_at),end=new Date(current.expires_at);
   const duration=end-start,elapsed=now-start;
   const completed=Math.min(100,Math.max(0,elapsed/duration*100));
   const usedMonths=wholeMonths(start,now);
   const remainingMonths=wholeMonths(now,end);
   const remainingDays=Math.max(0,Math.ceil((end-now)/day));
   render('Active',[
    ['Membership start',fmt(start)],['Membership expiry',fmt(end)],
    ['Full months used',String(usedMonths)],['Full months remaining',String(remainingMonths)],
    ['Days remaining',String(remainingDays)],['Membership period',String(Math.max(1,Math.round(duration/(365.2425*day)*12)))+' months']
   ],completed);
  }catch(e){render('Unable to load membership. Please check your connection and try again.')}
 }
 const refresh=document.createElement('button');refresh.type='button';refresh.className='membership-refresh';refresh.textContent='Refresh Membership';refresh.addEventListener('click',load);
 host.after(refresh);
 load();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
});
