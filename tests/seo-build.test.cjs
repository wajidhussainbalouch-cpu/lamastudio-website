'use strict';
const assert=require('node:assert/strict');
const {isCandidate,urlFor,isIndexable,normalize}=require('../scripts/seo-build.cjs');
assert.equal(isCandidate('lamastudio-school-suite/attendance/student-attendance.html'),false);
assert.equal(isCandidate('education-academy/confirm.html'),false);
assert.equal(isCandidate('blogs/education.html'),true);
assert.equal(isCandidate('guides/school-attendance-management-pakistan.html'),true);
assert.equal(isCandidate('categories/productivity/goal-setter.html'),true);
assert.equal(urlFor('index.html'),'https://www.lamastudio.pk/');
assert.equal(urlFor('categories/productivity/index.html'),'https://www.lamastudio.pk/categories/productivity/');
const html='<html><head><title>Test</title><link rel="canonical" href="https://lamastudio.com/categories/productivity/goal-setter.html"><meta property="og:url" content="https://lamastudio.pk/old"></head><body><h1>Test</h1></body></html>';
const canonical='https://www.lamastudio.pk/categories/productivity/goal-setter.html';
const updated=normalize(html,canonical);
assert.ok(updated.includes('rel="canonical" href="'+canonical+'"'));
assert.ok(updated.includes('property="og:url" content="'+canonical+'"'));
assert.ok(isIndexable(updated));
assert.ok(updated.includes('name="google-adsense-account" content="ca-pub-4212196297960637"'));
assert.ok(!isIndexable(updated.replace('<title>','<meta name="robots" content="noindex"><title>')));
assert.equal(normalize(updated,canonical),updated);
// Catch known public-navigation regressions before a production deployment.
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
assert.equal(isCandidate('faqs.html'),true);
assert.equal(urlFor('faqs.html'),'https://www.lamastudio.pk/faqs.html');
for(const file of ['index.html','faqs.html','privacy.html','terms.html','solutions/school-management-software-pakistan.html','guides/school-attendance-management-pakistan.html','categories/productivity/index.html','ads.txt']){
  assert.ok(fs.existsSync(path.join(base,file)),'Missing expected public resource: '+file);
}
const faq=fs.readFileSync(path.join(base,'faqs.html'),'utf8');
const home=fs.readFileSync(path.join(base,'index.html'),'utf8');
assert.ok(!faq.includes('href="categories/business/"'),'FAQ must not link to missing business category');
assert.ok(faq.includes('name="description"'),'FAQ requires a meaningful description');
assert.ok(home.includes('href="faqs.html"'),'Homepage must link to FAQ');
assert.ok(fs.readFileSync(path.join(base,'robots.txt'),'utf8').includes('https://www.lamastudio.pk/sitemap.xml'));
const ads=fs.readFileSync(path.join(base,'ads.txt'),'utf8');
assert.ok(ads.includes('pub-4212196297960637'),'ads.txt publisher account should match verified account');
console.log('SEO build tests passed');
