/* LAMA Coding Academy optional first-time walkthrough.
 * Three very short bilingual steps. No login, tracking or storage access.
 */
(function(){
"use strict";
const stages=[
 {title:"1. Start with a tiny lesson",en:"Tap Start my first lesson. You will learn what a browser and website are before seeing difficult code.",ur:"پہلا سبق شروع کریں۔ پہلے ویب سائٹ اور براؤزر سمجھیں، پھر آہستہ آہستہ کوڈ سیکھیں۔",icon:"📖"},
 {title:"2. Try code and see the result",en:"Read the idea, change one line, tap Run and see the Live Preview. A line-number hint helps you fix mistakes.",ur:"کوڈ کی ایک سطر تبدیل کریں، رن دبائیں اور نتیجہ دیکھیں۔ غلطی کی صورت میں اسی سطر کی رہنمائی ملے گی۔",icon:"💻"},
 {title:"3. Practice, then keep your progress",en:"Answer short coding questions and build projects. My Journey shows your progress and lets you download a complete local backup.",ur:"مختصر سوالات حل کریں اور پراجیکٹ بنائیں۔ My Journey میں پیش رفت اور بیک اپ محفوظ کریں۔",icon:"🏆"}
];
let root=null,step=0,returnFocus=null,previousOverflow="";
const byId=id=>root?.querySelector("#"+id);
function update(){
 if(!root)return;
 const item=stages[step];
 byId("lamaTourNumber").textContent="STEP "+(step+1)+" OF "+stages.length;
 byId("lamaTourIcon").textContent=item.icon;
 byId("lamaTourTitle").textContent=item.title;
 byId("lamaTourDescription").textContent=item.en;
 byId("lamaTourUrdu").textContent=item.ur;
 byId("lamaTourBack").disabled=step===0;
 byId("lamaTourNext").hidden=step===stages.length-1;
 byId("lamaTourStart").hidden=step!==stages.length-1;
}
function close(){
 if(!root)return;
 root.remove();root=null;
 document.body.style.overflow=previousOverflow;
 if(returnFocus&&returnFocus.isConnected)returnFocus.focus();
}
function open(trigger){
 if(root)return;
 step=0;returnFocus=trigger;previousOverflow=document.body.style.overflow;
 const wrap=document.createElement("div");
 wrap.className="lama-tour-overlay";
 wrap.innerHTML='<section class="lama-tour-dialog" role="dialog" aria-modal="true" aria-labelledby="lamaTourTitle" aria-describedby="lamaTourDescription">'+
 '<div class="lama-tour-top"><span id="lamaTourNumber"></span><button type="button" id="lamaTourClose" aria-label="Close welcome tour">×</button></div>'+
 '<div class="lama-tour-icon" aria-hidden="true" id="lamaTourIcon"></div>'+
 '<h2 id="lamaTourTitle"></h2><p id="lamaTourDescription"></p>'+
 '<p id="lamaTourUrdu" class="lama-tour-urdu" lang="ur" dir="rtl"></p>'+
 '<div class="lama-tour-controls"><button type="button" id="lamaTourBack">← Back</button>'+
 '<button type="button" id="lamaTourNext">Next →</button>'+
 '<button type="button" id="lamaTourStart" hidden>Start my first lesson →</button></div>'+
 '<p class="lama-tour-note">You can close this guide anytime. Your work stays on this device unless you decide to save a cloud copy later.</p>'+
 '</section>';
 document.body.append(wrap);root=wrap;document.body.style.overflow="hidden";
 wrap.addEventListener("click",e=>{
  if(e.target===wrap||e.target.closest("#lamaTourClose")){close();return;}
  if(e.target.closest("#lamaTourBack")){step=Math.max(0,step-1);update();}
  if(e.target.closest("#lamaTourNext")){step=Math.min(stages.length-1,step+1);update();}
  if(e.target.closest("#lamaTourStart")){
   close();
   const button=document.querySelector('button[data-action="lesson"]');
   if(button)button.click();
  }
 });
 update();byId("lamaTourClose").focus();
}
document.addEventListener("click",e=>{
 const trigger=e.target.closest("#takeTour");
 if(trigger)open(trigger);
});
document.addEventListener("keydown",e=>{
 if(!root)return;
 if(e.key==="Escape"){e.preventDefault();close();return;}
 if(e.key!=="Tab")return;
 const focus=Array.from(root.querySelectorAll("button:not([hidden]):not(:disabled)"));
 if(!focus.length)return;
 const first=focus[0],last=focus[focus.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
})();
