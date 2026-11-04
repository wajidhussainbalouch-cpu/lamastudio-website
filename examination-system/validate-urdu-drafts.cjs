#!/usr/bin/env node
/**
 * Class 1 Urdu draft gate. Node.js 18+, no external dependencies.
 * Usage: node examination-system/validate-urdu-drafts.cjs batch1.json batch2.json batch3.json
 * This validates structure and release safety, NOT textbook correctness.
 */
const fs = require('node:fs');
const files = process.argv.slice(2);
if (files.length !== 3) {
  console.error('Usage: node validate-urdu-drafts.cjs batch1.json batch2.json batch3.json');
  process.exit(2);
}
const errors = [], warnings = [], ids = new Set(), promptMap = new Map();
const levels = { easy: 0, medium: 0, hard: 0 };
let total = 0, visual = 0, teacherReview = 0, unmapped = 0;
for (const [batchIndex, file] of files.entries()) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { errors.push(file + ': invalid JSON: ' + e.message); continue; }
  const rows = Array.isArray(data) ? data :
    Array.isArray(data.questions) ? data.questions :
    Array.isArray(data.items) ? data.items : null;
  if (!rows) { errors.push(file + ': expected array or questions/items array'); continue; }
  if (rows.length !== 500) errors.push(file + ': expected 500 questions, got ' + rows.length);
  for (const [index, q] of rows.entries()) {
    total++;
    const at = file + ':' + (index + 1);
    if (!q || typeof q !== 'object') { errors.push(at + ': not an object'); continue; }
    const id = q.questionId ?? q.id;
    const prompt = q.questionText ?? q.question ?? q.prompt;
    const answer = q.correctAnswer ?? q.answer;
    if (!id) errors.push(at + ': missing question ID');
    else if (ids.has(String(id))) errors.push(at + ': duplicate ID ' + id);
    else ids.add(String(id));
    if (typeof prompt !== 'string' || !prompt.trim()) errors.push(at + ': missing prompt');
    else {
      const key = prompt.normalize('NFC').trim().replace(/\\s+/g, ' ');
      promptMap.set(key, (promptMap.get(key) ?? 0) + 1);
    }
    if (answer === undefined || answer === null || String(answer).trim() === '') {
      errors.push(at + ': missing correct answer');
    }
    const level = String(q.difficulty ?? q.level ?? '').toLowerCase();
    if (Object.hasOwn(levels, level)) levels[level]++;
    else warnings.push(at + ': unrecognized difficulty ' + level);
    if (q.visual || q.visualPrompt || q.image || q.emoji || q.picture) visual++;
    const marking = String(q.scoringMode ?? q.markingMode ?? '').toLowerCase();
    if (marking.includes('teacher') || q.requiresTeacherReview === true) teacherReview++;
    if (!q.sourcePdfPage || !(q.chapterId || q.chapter)) unmapped++;
    if (q.approved === true || q.onlineReady === true || q.reviewStatus === 'approved') {
      errors.push(at + ': unverified draft marked approved or online-ready');
    }
    if (Array.isArray(q.options)) {
      const choices = q.options.map(x => typeof x === 'string' ? x : (x?.text ?? x?.value));
      if (new Set(choices).size !== choices.length) warnings.push(at + ': repeated choices');
      if (choices.length && !choices.includes(answer) && !Number.isInteger(answer)) {
        warnings.push(at + ': answer not found among option texts');
      }
    }
    if (batchIndex === 0 && /^501\b/.test(String(id))) warnings.push(at + ': suspicious batch numbering');
  }
}
const repeated = [...promptMap.entries()].filter(([, count]) => count > 1)
  .sort((a,b) => b[1]-a[1]).map(([prompt,count]) => ({prompt,count}));
const result = {total, batchSizesExpected: [500,500,500], uniqueIds:ids.size,
  difficulty:levels, visual, teacherReview, unmapped,
  repeatedPromptGroups: repeated.length, repeatedPromptExtraOccurrences:
  repeated.reduce((n,x)=>n+x.count-1,0), topRepeatedPrompts:repeated.slice(0,15),
  errors, warnings: warnings.slice(0,100), warningCount:warnings.length,
  disclaimer:'Structural validation only. Editorial and textbook verification still required.'};
console.log(JSON.stringify(result,null,2));
process.exitCode = errors.length ? 1 : 0;
