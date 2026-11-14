/* Shared offline-first LAMA Coding Academy shell.
 * No network calls, storage writes, external assets or account assumptions.
 */
(function(){
"use strict";
function start(){
 if(document.querySelector(".lama-shell-header"))return;
 const body=document.body;
 const path=(location.pathname.split("/").pop()||"index.html").toLowerCase();
 const route=path==="index.html"&&/^#(?:learn|lesson=)/.test(location.hash)?"learn":path;
 const sections=[
  {name:"START HERE",links:[
   ["🏠","Home","./index.html","home"],
   ["📖","Guided Lessons","./index.html#learn","learn"],
   ["🧩","Practice Questions","./quiz.html","quiz.html"],
   ["🧠","Industry Challenges","./practice.html","practice.html"]]},
  {name:"BUILD SKILLS",links:[
   ["🐍","Python Lab","./python.html","python.html"],
   ["🛠️","Project Studio","./studio.html","studio.html"],
   ["📈","My Journey","./progress.html","progress.html"],
   ["🎯","Career Paths","./index.html#paths","paths"]]},
  {name:"MY ACCOUNT & HELP",links:[
   ["👤","Account & Cloud Backup","./account.html","account.html"],
   ["🔒","Privacy","./privacy.html","privacy.html"],
   ["⚙️","Device System Check","./diagnostics.html","diagnostics.html"],
   ["🌐","LAMA Studio","https://www.lamastudio.pk/","external"]]}
 ];
 const safe=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 const anchor=([emoji,label,href,id])=>'<a href="'+safe(href)+'"'+
   (id===route||id==="home"&&path==="index.html"&&route!=="learn"&&route!=="paths"?' aria-current="page"':'')+
   '><span aria-hidden="true">'+emoji+'</span>'+safe(label)+'</a>';
 const header=document.createElement("header");
 header.className="lama-shell-header";
 header.innerHTML='<a class="lama-shell-logo" href="./index.html"><img src="./icon.svg" width="43" height="43" alt="LAMA Coding Academy logo">'+
  '<span><strong>LAMA Coding Academy</strong><small>Learn · Practice · Build</small></span></a>'+
  '<button class="lama-shell-menu" type="button" aria-label="Open navigation menu" aria-controls="lamaShellSidebar" aria-expanded="false">☰</button>';
 // Preserve page-specific learning controls from the old header.
 // Moving the button retains event listeners registered by Python/Studio.
 const language=document.querySelector('body > header #language');
 if(language){
  language.classList.add("lama-shell-language");
  header.insertBefore(language,header.querySelector(".lama-shell-menu"));
 }
 const sidebar=document.createElement("aside");
 sidebar.className="lama-shell-sidebar";sidebar.id="lamaShellSidebar";
 sidebar.setAttribute("aria-label","Academy side navigation");
 sidebar.innerHTML='<div class="lama-side-head"><img src="./icon.svg" width="40" height="40" alt=""><div><strong>LAMA Coding Academy</strong><small>Your learning space</small></div>'+
 '<button class="lama-side-close" type="button" aria-label="Close navigation menu">×</button></div>'+
 sections.map(s=>'<h2>'+safe(s.name)+'</h2><nav aria-label="'+safe(s.name)+'">'+s.links.map(anchor).join("")+'</nav>').join("")+
 '<p class="lama-learning-note"><strong>Learning status:</strong> Progress saves on this phone. Cloud account syncing is available only after it is securely configured and enabled.</p>';
 const backdrop=document.createElement("button");
 backdrop.className="lama-menu-backdrop";backdrop.type="button";
 backdrop.setAttribute("aria-label","Close menu");
 backdrop.hidden=true;
 const bottom=document.createElement("nav");
 bottom.className="lama-bottom-nav";bottom.setAttribute("aria-label","Quick mobile navigation");
 bottom.innerHTML=[["🏠","Home","./index.html","home"],["📖","Lessons","./index.html#learn","learn"],
 ["🧩","Practice","./quiz.html","quiz.html"],["📈","Journey","./progress.html","progress.html"]]
 .map(([emoji,label,href,id])=>'<a href="'+safe(href)+'"'+
 (id===route||id==="home"&&path==="index.html"&&route!=="learn"&&route!=="paths"?' aria-current="page"':'')+
 '><span aria-hidden="true">'+emoji+'</span>'+safe(label)+'</a>').join("");
 const skip=document.createElement("a");
 skip.className="lama-skip";skip.href="#lamaPageMain";skip.textContent="Skip to learning content";
 const main=document.querySelector("body>main");if(main&&!main.id)main.id="lamaPageMain";
 else if(main&&main.id!=="lamaPageMain"){skip.href="#"+main.id;}
 body.insertBefore(header,body.firstChild);
 body.insertBefore(skip,header);
 body.append(sidebar,backdrop,bottom);
 const menu=header.querySelector(".lama-shell-menu"),close=sidebar.querySelector(".lama-side-close");
 const desktop=window.matchMedia("(min-width:1024px)");
 let previousFocus=null;
 function setOpen(open,restoreFocus=false){
  const expanded=Boolean(open&&!desktop.matches);
  body.classList.toggle("lama-menu-open",expanded);
  backdrop.hidden=!expanded;
  menu.setAttribute("aria-expanded",String(expanded));
  sidebar.setAttribute("aria-hidden",desktop.matches?"false":String(!expanded));
  if("inert" in sidebar)sidebar.inert=!desktop.matches&&!expanded;
  if(expanded){previousFocus=document.activeElement;close.focus();}
  else if(restoreFocus&&(previousFocus||menu)){(previousFocus||menu).focus();}
 }
 menu.addEventListener("click",()=>setOpen(!body.classList.contains("lama-menu-open"),true));
 close.addEventListener("click",()=>setOpen(false,true));
 backdrop.addEventListener("click",()=>setOpen(false,true));
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&body.classList.contains("lama-menu-open")){setOpen(false,true);return;}
  if(event.key!=="Tab"||!body.classList.contains("lama-menu-open"))return;
  const focus=Array.from(sidebar.querySelectorAll("button,a")).filter(x=>!x.disabled);
  if(!focus.length)return;
  const first=focus[0],last=focus[focus.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 function screenChanged(){setOpen(false);updateActive();}
 function updateActive(){
  const currentPage=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  const hash=location.hash;
  for(const a of document.querySelectorAll(".lama-shell-sidebar nav a,.lama-bottom-nav a")){
   const href=a.getAttribute("href");
   let active=false;
   if(currentPage==="index.html"){
    if(href==="./index.html"&&!hash)active=true;
    if(href==="./index.html#learn"&&(hash==="#learn"||hash.startsWith("#lesson=")))active=true;
    if(href==="./index.html#paths"&&hash==="#paths")active=true;
   }else active=href==="./"+currentPage;
   if(active)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
  }
 }
 window.addEventListener("hashchange",screenChanged);
 if(desktop.addEventListener)desktop.addEventListener("change",()=>setOpen(false));
 else if(desktop.addListener)desktop.addListener(()=>setOpen(false));
 body.classList.add("lama-shell-ready");
 setOpen(false);
 updateActive();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
 else start();
})();
