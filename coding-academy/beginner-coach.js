/* LAMA Coding Academy beginner coach.
 * Local, offline-capable heuristic explanations: no remote API, execution,
 * eval, learner code uploads or private data access.
 * Hints catch common mistakes, NOT every valid HTML/CSS/JS error.
 */
(function(root){
"use strict";
const htmlTags=new Set(("a abbr address area article aside audio b base bdi bdo blockquote body br button "+
"canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure "+
"footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map "+
"mark menu meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script "+
"search section select small source span strong style sub summary sup table tbody td template textarea tfoot th thead time "+
"title tr track u ul var video wbr svg path circle rect line polygon polyline g text defs use").split(" "));
const voidTags=new Set("area base br col embed hr img input link meta param source track wbr".split(" "));
const optionalClose=new Set("li p dt dd option tr td th".split(" "));
const glossary=[
 {word:"Computer code",urdu:"کمپیوٹر کو دی جانے والی ہدایات، جن پر عمل کر کے وہ کوئی کام کرتا ہے۔",simple:"Instructions written so a computer can perform an action.",example:"You write a small instruction; the browser shows its result."},
 {word:"HTML",urdu:"ویب صفحے کی ساخت، جیسے سرخی، عبارت، تصویر اور بٹن بنانے کی مارک اپ زبان۔",simple:"The structure of a web page: headings, paragraphs, images and buttons. HTML is markup, not a programming language.",example:"<h1>Welcome</h1> creates a big heading."},
 {word:"CSS",urdu:"ویب صفحے کے رنگ، سائز، فاصلے اور ترتیب کو خوبصورت بناتی ہے۔",simple:"The styling language: colors, sizes, spacing and layouts.",example:"h1 { color: blue; } makes a heading blue."},
 {word:"JavaScript",urdu:"ایسی پروگرامنگ زبان جو بٹن دبانے یا لکھنے پر صفحے کو ردعمل دینا سکھاتی ہے۔",simple:"A programming language that makes pages respond when someone clicks, types or changes something.",example:"A button can change a message."},
 {word:"Python",urdu:"حساب، ڈیٹا اور خودکار کاموں کے لیے نسبتاً آسان پروگرامنگ زبان۔",simple:"A beginner-friendly programming language for calculations, data, automation and many other tasks.",example:"print('Hello') displays text."},
 {word:"SQL",urdu:"ڈیٹابیس سے معلومات پوچھنے، تلاش کرنے اور تبدیل کرنے کی زبان۔",simple:"A language for asking a database questions and retrieving or changing its stored rows.",example:"SELECT name FROM students; asks for names."},
 {word:"Kotlin / Dart",urdu:"اینڈرائیڈ اور دوسری موبائل ایپس بنانے میں استعمال ہونے والی زبانیں۔",simple:"Languages used to develop Android and cross-platform mobile apps; learn coding foundations first.",example:"They help build apps with screens and interactions."},
 {word:"Bug / debugging",urdu:"کوڈ کی غلطی کو بگ کہتے ہیں، اور اسے تلاش کر کے درست کرنا ڈی بگنگ کہلاتا ہے۔",simple:"A bug is a mistake that makes code behave incorrectly. Debugging means locating it, understanding it and fixing it.",example:"A missing </p> can make page structure confusing."}
];
function lineOf(code,offset){return code.slice(0,offset).split("\n").length;}
function issue(code,offset,message,kind){return {line:lineOf(code,offset),offset,message,kind:kind||"warning"};}
function maskComments(code){return code.replace(/<!--[\s\S]*?-->/g,s=>s.replace(/[^\n]/g," "));}
function bracketIssues(code,inner,offset,language,errors){
 const openers={"{":"}","(":")","[":"]"};
 const closers=new Set(["}",")","]"]);
 const stack=[];
 let quote=null,escape=false,lineComment=false,blockComment=false;
 for(let i=0;i<inner.length;i++){
   const ch=inner[i],next=inner[i+1];
   if(lineComment){if(ch==="\n")lineComment=false;continue;}
   if(blockComment){if(ch==="*"&&next==="/"){blockComment=false;i++;}continue;}
   if(quote){if(escape){escape=false;continue;}if(ch==="\\"){escape=true;continue;}
     if(ch===quote){quote=null;}continue;}
   if(ch==="'"||ch==='"'||ch.charCodeAt(0)===96){quote=ch;continue;}
   if(ch==="/"&&next==="*"){blockComment=true;i++;continue;}
   if(language==="JavaScript"&&ch==="/"&&next==="/"){lineComment=true;i++;continue;}
   if(Object.hasOwn(openers,ch))stack.push({char:ch,position:i});
   else if(closers.has(ch)){
     const prev=stack.pop();
     if(!prev||openers[prev.char]!==ch){
       errors.push(issue(code,offset+i,language+": unexpected '"+ch+"'. Check opening and closing brackets.","error"));
       if(prev)stack.push(prev);
     }
   }
 }
 if(stack.length){
   const prev=stack[stack.length-1];
   errors.push(issue(code,offset+prev.position,language+": '"+prev.char+"' needs a matching '"+openers[prev.char]+"'.","error"));
 }
}
function analyze(source){
 const code=String(source||"");
 if(code.length>15000)return [issue(code,0,"This code is very long for the beginner checker. Keep each lesson example short.")];
 const found=[],plain=maskComments(code),regions=[];
 for(const type of ["style","script"]){
   const re=new RegExp("<"+type+"\\b[^>]*>([\\s\\S]*?)<\\/"+type+"\\s*>","gi");
   let m;
   while((m=re.exec(plain))!==null){
     const bodyOffset=m.index+m[0].indexOf(m[1]);
     regions.push({start:bodyOffset,end:bodyOffset+m[1].length});
     bracketIssues(code,m[1],bodyOffset,type==="style"?"CSS":"JavaScript",found);
     if(type==="style"){
       const decl=/([{;])\s*([a-zA-Z-]+)\s+(?=[a-zA-Z0-9#])/g;
       let bad;
       while((bad=decl.exec(m[1]))!==null){
         found.push(issue(code,bodyOffset+bad.index,"CSS: use a colon after '"+bad[2]+"', for example '"+bad[2]+": blue;'."));
       }
     }
   }
 }
 function inRawTag(offset){return regions.some(r=>offset>=r.start&&offset<r.end);}
 const tags=/<(\/?)([A-Za-z][A-Za-z0-9:-]*)(?=[\s/>])([^<>]*)>/g;
 const stack=[];
 let m;
 while((m=tags.exec(plain))!==null){
   if(inRawTag(m.index))continue;
   const closing=Boolean(m[1]),name=m[2].toLowerCase(),raw=m[0];
   const custom=name.includes("-");
   if(!htmlTags.has(name)&&!custom){
     const phrase=raw.replace(/^<|>$/g,"").replace(/^\//,"").trim();
     const explanatory=/\s/.test(phrase)?" If you intended to display words, write <p>"+phrase+"</p>.":" To display words, use <p>your text</p>.";
     found.push(issue(code,m.index,"<"+m[2]+"> is not a common HTML tag."+explanatory,"warning"));
     continue;
   }
   if(voidTags.has(name))continue;
   if(closing){
     let index=stack.length-1;
     while(index>=0&&stack[index].name!==name)index--;
     if(index<0){
       found.push(issue(code,m.index,"Unexpected closing </"+name+">. Check that you opened <"+name+"> first.","warning"));
     }else{
       for(let j=stack.length-1;j>index;j--){
         if(!optionalClose.has(stack[j].name)){
           found.push(issue(code,m.index,"Before </"+name+">, close <"+stack[j].name+"> with </"+stack[j].name+">.","warning"));
         }
       }
       stack.length=index;
     }
   }else if(!/\/>$/.test(raw)){
     if(optionalClose.has(name)&&stack.length&&stack[stack.length-1].name===name)stack.pop();
     stack.push({name,at:m.index});
   }
 }
 for(const open of stack){
   if(!optionalClose.has(open.name)&&!["html","head","body"].includes(open.name)){
     found.push(issue(code,open.at,"This <"+open.name+"> looks unclosed. Add </"+open.name+"> after its content."));
   }
 }
 for(const [i,line] of code.split("\n").entries()){
   if(/<\s*[a-zA-Z][a-zA-Z0-9:-]*[^>]*$/.test(line)&&!line.includes("<!--")){
     const start=code.split("\n").slice(0,i).join("\n").length+(i?1:0);
     found.push(issue(code,start+line.indexOf("<"),"This tag appears to be missing its closing >. Check the end of the line."));
   }
 }
 const unique=new Map();
 for(const entry of found.sort((a,b)=>a.offset-b.offset)){
   const k=entry.line+"-"+entry.message;
   if(!unique.has(k))unique.set(k,entry);
 }
 return [...unique.values()].slice(0,12);
}
root.LAMA_CODE_COACH={analyze,glossary};
})(typeof window!=="undefined"?window:globalThis);
