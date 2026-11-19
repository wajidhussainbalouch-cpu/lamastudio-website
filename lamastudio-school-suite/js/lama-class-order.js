/* Shared school display order; does not change record IDs or class assignments. */
(function(root){
'use strict';
const text=v=>String(v??'').trim();
const natural=(a,b)=>text(a).localeCompare(text(b),undefined,{numeric:true,sensitivity:'base'});
function parts(v){
 const raw=text(v),m=raw.match(/^(.*?)\s*·\s*Section\s+(.+)$/i);
 return {grade:m?m[1]:raw,section:m?m[2]:''};
}
function rank(v){
 const n=text(v).toLowerCase().replace(/^(?:class|grade|standard|std)[\s._-]+/,'').replace(/[\s._-]+/g,'');
 if(!n)return 10000;
 const early={ecce:0,ece:1,playgroup:2,pg:2,kachi:3,katchi:3,nursery:4,kg:5,kindergarten:5,prep:6,preparatory:6};
 if(Object.prototype.hasOwnProperty.call(early,n))return early[n];
 if(/^\d+$/.test(n)&&Number(n)>0&&Number(n)<=99)return 10+Number(n);
 return 1000;
}
function compare(a,b){
 const x=parts(a),y=parts(b),r=rank(x.grade)-rank(y.grade);
 return r||((rank(x.grade)>=1000)?natural(x.grade,y.grade):0)||natural(x.section,y.section)||natural(x.grade,y.grade);
}
function teachers(a,b){
 const label=t=>text(t.assignedClass)+(text(t.assignedSection)?' · Section '+text(t.assignedSection):'');
 return compare(label(a),label(b))||natural(a.name||a.fullName,b.name||b.fullName)||natural(a.loginId||a.id,b.loginId||b.id);
}
root.LamaClassOrder={compare,teachers,rank};
})(typeof window==='undefined'?globalThis:window);