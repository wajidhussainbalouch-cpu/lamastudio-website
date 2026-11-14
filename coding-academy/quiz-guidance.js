/* LAMA Coding Academy — deterministic local learning suggestions.
 * Every destination is a static, authored academy page/lesson.
 * No cloud use, analytics, ML predictions, or changes to lesson completion.
 */
(function(root){
"use strict";
const map={
 html:[
  {title:"HTML: the skeleton of a page",href:"./index.html#lesson=intro-html",
   detail:"Practise headings, paragraphs and opening and closing tags.",
   urdu:"سرخی، پیراگراف اور ٹیگ کی بنیادی مشق کریں۔"},
  {title:"Links and page navigation",href:"./index.html#lesson=link",
   detail:"Build links, lists and clear navigation on a real web page.",
   urdu:"ویب صفحے میں لنکس اور نیویگیشن بنائیں۔"},
  {title:"Build a labelled input form",href:"./index.html#lesson=form-fields",
   detail:"Connect labels and fields and review accessible HTML.",
   urdu:"فارم اور لیبل کا صحیح استعمال سیکھیں۔"}
 ],
 css:[
  {title:"CSS: colors and appearance",href:"./index.html#lesson=intro-css",
   detail:"Start with color, background and easy style rules.",
   urdu:"رنگ، پس منظر اور آسان سی ایس ایس اصول سیکھیں۔"},
  {title:"Style a real page with CSS",href:"./index.html#lesson=css",
   detail:"Practice selectors, margins, padding and layout.",
   urdu:"سیلیکٹر، مارجن اور پیڈنگ کی مشق کریں۔"},
  {title:"Responsive web page layout",href:"./index.html#lesson=layout",
   detail:"Use layout rules that work on phones and computers.",
   urdu:"موبائل اور کمپیوٹر کے لیے بہتر لے آؤٹ بنائیں۔"}
 ],
 javascript:[
  {title:"JavaScript: make a button respond",href:"./index.html#lesson=intro-js",
   detail:"Watch a tap change visible text in a real browser.",
   urdu:"بٹن دبانے سے عبارت بدلنے کی مشق کریں۔"},
  {title:"Variables and program logic",href:"./index.html#lesson=variable",
   detail:"Practice named values and simple calculations.",
   urdu:"ویری ایبل اور بنیادی حساب سمجھیں۔"},
  {title:"Decisions with if and else",href:"./index.html#lesson=condition",
   detail:"Make a program choose actions from a condition.",
   urdu:"اگر اور ورنہ کی مدد سے فیصلہ سازی سیکھیں۔"}
 ],
 python:[
  {title:"Python Lab: start with print",href:"./python.html",
   detail:"Learn simple Python words; running real Python may need a one-time download.",
   urdu:"پائتھن میں پرنٹ سے آغاز کریں؛ پہلی بار انٹرنیٹ درکار ہوسکتا ہے۔"},
  {title:"Python Lab: functions and loops",href:"./python.html",
   detail:"Build small programs, functions and repeatable actions.",
   urdu:"فنکشن اور لوپ کی مشق کریں۔"},
  {title:"Python Lab: practical challenges",href:"./python.html",
   detail:"Use the existing Python challenges and verify their results.",
   urdu:"پائتھن کی عملی مشقیں حل کریں۔"}
 ],
 sql:[
  {title:"Industry Practice: basic SQL",href:"./practice.html",
   detail:"Practice reading and filtering table records in the simulated SQL lab.",
   urdu:"ایس کیو ایل میں ریکارڈ تلاش کرنے کی مشق کریں۔"},
  {title:"Industry Practice: SQL queries",href:"./practice.html",
   detail:"Try sorting, counting and filtering records in local SQL exercises.",
   urdu:"ڈیٹا کی ترتیب، گنتی اور فلٹرنگ سیکھیں۔"},
  {title:"Industry Practice: SQL reasoning",href:"./practice.html",
   detail:"Recheck your database-query thinking using the existing SQL drills.",
   urdu:"ڈیٹابیس سوالات کی منطق کی مشق کریں۔"}
 ]
};
const labels={html:"HTML",css:"CSS",javascript:"JavaScript",python:"Python",sql:"SQL"};
function related(question){
 if(!question||!Object.hasOwn(map,question.track)||![1,2,3].includes(question.level))return null;
 return {...map[question.track][question.level-1],track:question.track,
  label:labels[question.track],level:question.level};
}
function suggestions(catalog,state){
 if(!catalog||!Array.isArray(catalog.items)||!state||!state.stats)return [];
 const report=[];
 for(const track of Object.keys(map)){
  const missed=catalog.items.filter(q=>q.track===track
   &&state.stats[q.id]&&state.stats[q.id].attempts>0&&state.stats[q.id].lastCorrect!==true);
  if(!missed.length)continue;
  const byLevel=[1,2,3].map(level=>missed.filter(q=>q.level===level).length);
  const mostMissed=Math.max(...byLevel);
  const level=byLevel.indexOf(mostMissed)+1;
  const lesson=related({track,level});
  report.push({...lesson,missed:missed.length,answered:catalog.items.filter(q=>q.track===track
    &&state.stats[q.id]&&state.stats[q.id].attempts>0).length});
 }
 return report.sort((a,b)=>b.missed-a.missed||Object.keys(map).indexOf(a.track)-Object.keys(map).indexOf(b.track));
}
root.LAMA_QUIZ_GUIDANCE=Object.freeze({related,suggestions});
})(typeof window!=="undefined"?window:globalThis);
