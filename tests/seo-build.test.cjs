'use strict';
const assert=require('node:assert/strict');
const {isCandidate,urlFor,isIndexable,normalize,normalizePublicIndexLinks}=require('../scripts/seo-build.cjs');
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

// Public hub navigation must not point to removed or never-created local URLs.
// Keep informational cards without links until a real target exists.
// Include every public category page to guard against dead links recurring in tools or hubs.
const categoryHtmlPaths=[];
function collectCategoryHtml(directory) {
  for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    const full=path.join(directory,entry.name);
    if (entry.isDirectory()) collectCategoryHtml(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) categoryHtmlPaths.push(path.relative(base,full).replaceAll('\\','/'));
  }
}
collectCategoryHtml(path.join(base,'categories'));
for (const hub of [
  ...categoryHtmlPaths,
  'index.html',
  'categories/tech/index.html',
  'categories/developer-tools/index.html',
  'categories/productivity/index.html',
  'categories/network-security/index.html',
  'categories/education/index.html',
  'blogs/tech.html',
  'blogs/network-security.html',
  'apps/lamasky/index.html',
  'apps/lamavpnpro/index.html',
  'apps/lamaiqmaster/index.html',
  'apps/lamamulticalendar/index.html'
]) {
  const source=fs.readFileSync(path.join(base,hub),'utf8');
  for (const match of source.matchAll(/\bhref\s*=\s*(["'])([^"']+)\1/gi)) {
    const href=match[2].trim();
    if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(href)) continue;
    const local=href.split(/[?#]/)[0];
    if (!local) continue;
    const resolved=path.posix.resolve('/',path.posix.dirname('/'+hub),local);
    const full=path.join(base,resolved.slice(1));
    const realFile=fs.existsSync(full)&&fs.statSync(full).isFile();
    const directoryIndex=fs.existsSync(path.join(full,'index.html'));
    assert.ok(realFile||directoryIndex,hub+' has broken local link: '+href);
  }
}

// Developer utilities are public interactive pages: require an accessible heading
// and a search snippet before canonicalization and sitemap generation.
const developerUtilities=[
  'bezier-generator',
  'dockerfile-validator',
  'env-sanitizer',
  'graphql-query-builder',
  'openapi-tester',
  'package-json-validator',
  'redis-cli-syntax',
  'seo-meta-generator',
  'tailwind-merger',
  'webhook-debugger'
];
for (const name of developerUtilities) {
  const relative='categories/developer-tools/'+name+'.html';
  const html=fs.readFileSync(path.join(base,relative),'utf8');
  assert.ok(isCandidate(relative),'Developer page must be sitemap candidate: '+relative);
  assert.ok(isIndexable(html),'Developer page requires title and H1: '+relative);
  assert.ok(/<meta\b(?=[^>]*name\s*=\s*["']description["'])[^>]*>/i.test(html),'Developer page needs meta description: '+relative);
}
// Public marketing homepages belong in the sitemap; private modules must not.
for (const [relative,shouldIndex] of [["lamastudio-school-suite/index.html",true],["education-academy/index.html",true],["categories/education/learn-with-fun/index.html",true],["lamastudio-school-suite/portals/admin/index.html",false],["education-academy/confirm.html",false],["examination-system/index.html",false]]) {
  assert.equal(isCandidate(relative),shouldIndex,'Sitemap inclusion mismatch: '+relative);
}
for (const relative of [
  'lamastudio-school-suite/index.html',
  'education-academy/index.html',
  'categories/education/learn-with-fun/index.html'
]) {
  const html=fs.readFileSync(path.join(base,relative),'utf8');
  assert.ok(isIndexable(html),'Public homepage must have a head, title and H1: '+relative);
  assert.ok(/<meta\b(?=[^>]*name\s*=\s*["']description["'])[^>]*>/i.test(html),'Public homepage needs description: '+relative);
  assert.equal(normalize(html,urlFor(relative)).includes('rel="canonical" href="'+urlFor(relative)+'"'),true,'Canonical should use www: '+relative);
}
// Internal links to public directory index pages must match canonical sitemap URLs.
const fixture=[
  '<a href="index.html">Current hub</a>',
  '<a href="../../index.html#apps">Home apps</a>',
  '<a href="../education/index.html">Education</a>',
  '<a href="/lamastudio-school-suite/index.html?view=features#faq">School suite</a>',
  '<a href="/education-academy/index.html">PPSC</a>',
  '<a href="/lamastudio-school-suite/portals/admin/index.html">Private admin</a>',
  '<a href="https://other.example/index.html">External</a>',
  '<a href="mailto:info@example.com">Email</a>'
].join('\n');
const aligned=normalizePublicIndexLinks(fixture,'categories/tech/index.html');
assert.ok(aligned.includes('href="/categories/tech/"'));
assert.ok(aligned.includes('href="/#apps"'));
assert.ok(aligned.includes('href="/categories/education/"'));
assert.ok(aligned.includes('href="/lamastudio-school-suite/?view=features#faq"'));
assert.ok(aligned.includes('href="/education-academy/"'));
assert.ok(aligned.includes('href="/lamastudio-school-suite/portals/admin/index.html"'));
assert.ok(aligned.includes('href="https://other.example/index.html"'));
assert.equal(normalizePublicIndexLinks(aligned,'categories/tech/index.html'),aligned);


// 2026-11-27 Search Console 404 drilldown: redirect only exact old URLs
// with an existing, closely equivalent target. Never send missing categories
// or retired editorial pages to an unrelated homepage.
const vercelConfig=JSON.parse(fs.readFileSync(path.join(base,'vercel.json'),'utf8'));
const requiredRedirects={
  "/categories/tech-utilities/": "/categories/developer-tools/",
  "/categories/devtools/": "/categories/developer-tools/",
  "/categories/dev/": "/categories/developer-tools/",
  "/categories/security/": "/categories/network-security/",
  "/tools/base64/": "/categories/tech/base64-tool.html",
  "/tools/json-formatter/": "/categories/tech/json-formatter.html",
  "/tools/jwt-decoder/": "/categories/tech/jwt-decoder.html",
  "/categories/education/calculator.html": "/categories/education/calculator_utility.html",
  "/lamastudio-school-suite/Index.html": "/lamastudio-school-suite/",
  "/apps/lamamulticalendar/login.html": "/signin.html",
  "/lamasky/": "/apps/lamasky/",
  "/lamavpnpro/": "/apps/lamavpnpro/",
  "/lamaiqmaster/": "/apps/lamaiqmaster/",
  "/account/": "/signin.html"
};
const seenRedirects=new Set();
for(const redirect of vercelConfig.redirects){
  assert.ok(!seenRedirects.has(redirect.source),'Duplicate redirect source '+redirect.source);
  seenRedirects.add(redirect.source);
}
for(const [source,dest] of Object.entries(requiredRedirects)){
  const redirect=vercelConfig.redirects.find(item=>item.source===source);
  assert.ok(redirect,'Missing known-legacy redirect: '+source);
  assert.equal(redirect.destination,dest,'Unexpected legacy redirect destination: '+source);
  assert.equal(redirect.permanent,true,'Legacy redirect must be permanent: '+source);
  const destFile=path.join(base,dest.slice(1));
  assert.ok((fs.existsSync(destFile)&&fs.statSync(destFile).isFile())||
    fs.existsSync(path.join(destFile,'index.html')),'Legacy redirect target missing: '+dest);
}
for(const category of ['business','travel','sports','fashion','news','weather','health']){
  assert.ok(!vercelConfig.redirects.some(r=>r.source==='/categories/'+category+'/'),
    'Retired category should not redirect to a non-equivalent landing page: '+category);
}

console.log('SEO build tests passed');
