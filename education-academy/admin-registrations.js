/* Private candidate account registration review. No ability to override email verification. */
'use strict';
(()=>{
 const root=document.getElementById('registrationRows');
 if(!root)return;
 const auth=window.LamaAcademyAuth,$=id=>document.getElementById(id);
 let authorized=false;
 async function refresh(){
  if(!authorized)return;
  try{
   const rows=await auth.adminRegistrations();
   root.replaceChildren();
   const confirmed=rows.filter(x=>!!x.email_confirmed_at).length;
   $('registrationSummary').textContent=rows.length+' registered account(s) · '+confirmed+' confirmed email(s) · '+(rows.length-confirmed)+' pending confirmation (latest 200).';
   if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='No registrations yet';tr.append(td);root.append(tr);return}
   rows.forEach(r=>{
    const tr=document.createElement('tr'),cells=[
     String(r.display_name||'Not supplied'),
     String(r.email||''),
     r.email_confirmed_at?'Email confirmed':'Awaiting candidate confirmation',
     r.last_sign_in_at?new Date(r.last_sign_in_at).toLocaleString('en-PK'):'Not signed in'
    ];
    cells.forEach(c=>{const td=document.createElement('td');td.textContent=c;tr.append(td)});
    root.append(tr);
   });
  }catch(e){$('registrationSummary').textContent='Unable to load private registration status: '+(e.message||'Access denied')}
 }
 window.addEventListener('lama:admin-authorized',()=>{authorized=true;refresh()});
 document.getElementById('refresh')?.addEventListener('click',()=>{if(authorized)refresh()});
 document.getElementById('logout')?.addEventListener('click',()=>{authorized=false;root.replaceChildren();$('registrationSummary').textContent='Sign in to view private registration status.'});
})();