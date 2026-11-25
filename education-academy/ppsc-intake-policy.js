/* LAMA PPSC Preparation Academy — per-position intake rule.
 * New PPSC advertisements: select jobs only if verified advertised vacancies >= 10.
 * Count seats per ONE exact job/case, including its reserved quotas; do not
 * pool different job titles or cases to meet the threshold.
 * Historic preparation tracks are not deleted retroactively.
 * Keep explicit advertisement-specific owner selections when they narrow scope.
 * Designed for future verified intake workflows; not an automatic official PPSC feed.
 */
'use strict';
window.LamaPpscIntakePolicy=Object.freeze((()=>{
 const MIN_POSTS=10;
 function eligible(post){
  const count=post&&post.advertisedVacancies;
  return Number.isInteger(count)&&count>=MIN_POSTS;
 }
 function select(posts,{onlyJobIds=null}={}){
  if(!Array.isArray(posts))throw Error('Expected an array of job postings.');
  const selected=onlyJobIds?new Set(onlyJobIds):null;
  const seen=new Set();
  return posts.filter(job=>{
   if(!job||typeof job.id!=='string'||!eligible(job))return false;
   if(selected&&!selected.has(job.id))return false;
   const id=job.id.trim();
   if(!id||seen.has(id))return false;
   seen.add(id);
   return true;
  });
 }
 return {minimumVacancies:MIN_POSTS,eligible,select};
})());
