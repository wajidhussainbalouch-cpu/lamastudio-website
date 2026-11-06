# LAMA PPSC Academy — Headmaster / Headmistress Paper 2

**Created:** 6 November 2026  
**Paper ID:** HM-2026-P02  
**Status:** 100-question original **free educational practice** paper. Automated structure and duplication tests passed; independent human academic review is still pending. This is not an official PPSC examination or a verified case-specific paper.

## Delivered in this batch

- 100 NEW MCQs, IDs HM02-001 through HM02-100, four groups of 25 questions.
- Every question has one subject, topic, difficulty, four distinct options, correct choice and useful explanatory answer key.
- Earlier Paper 1 (DEMO-01, 100 MCQs) is unchanged. Paper 2 has a distinct ID and its own 90-minute examination timer and saved attempts, connected to both Headmaster/Headmistress and Senior Headmaster/Headmistress.
- Candidates choose Paper 2 in Papers & Examinations, explicitly start it, submit, then see each selected answer, correct answer and explanation. The **View / Print Answer Key (PDF)** link opens the answer review page *after submission*. The printed question paper has no answer key.
- Original free-practice questions (and answer keys) are available in public JavaScript; client-side gating only hides keys in the standard interface until completion. Do not use this approach for a secure premium exam.

## Where stored

Public practice source: papers/headmaster-02-part1.js through part4.js, assembled by papers/headmaster-02-register.js.  
Private editable Supabase source: **100 additional draft rows** in public.ppsc_question_bank with IDs HM02-001 through HM02-100, job_id teaching, review_status draft.  
Earlier 30 EDU-HM-101 through EDU-HM-130 drafts remain intact. **Total private question bank: 130 unique items.**

These private rows remain editorial drafts. A free original practice release does NOT mean independent human academic approval.

## Non-repetition and validation

- All 100 new stems are distinct from Paper 1's 100 and from the 30 prior private drafts.
- Previously private stems are represented only by non-reversible check fingerprints in papers/prior-private-stem-fingerprints.json.
- test-headmaster-paper2.cjs checks question IDs, option correctness, post-rotation answer preservation, topic variety, answer positions, exact duplicates, similarity among the new 100, and answer-key unlock before/after submitting.
- validate-papers.cjs checks BOTH published paper structures and cross-paper duplicates.
- test-paper-library.cjs verifies two active teaching papers, 200 publicly available MCQ slots, deep linking and job isolation. GitHub Actions runs these tests on main.
- These are automated and editorial author checks; verify all question facts, academic quality and relevance against the actual official PPSC post/case before describing anything as official.

## When the owner says Continue

1. Read this file, QUESTION_BANK_WORKFLOW.md, PROJECT_MASTER_HANDOFF.md, Paper 1, all four Paper 2 parts, and the latest private question-bank stems.
2. Prepare **another 100 original questions** with unique IDs HM03-001 through HM03-100. Avoid duplicated stems, lightly reworded questions, overlapping examples and poor distractors. Recheck correctness and educational content.
3. Save 100 additional private draft records in Supabase **without modifying prior rows**.
4. Add a separately identified Paper 3 (e.g. HM-2026-P03) to the job-wise library, teaching category, print page, post-submission answer-key page, PWA cache and source manifest. Keep Papers 1 and 2, and existing candidate records, untouched.
5. Extend structural, duplicate-content, answer-key and attempt-isolation tests. Update the MD handoff and CI workflow. Maintain clear academic-review status; do not claim official PPSC coverage without verified sources.
6. Do not initiate a manual Vercel deployment while the project is limited or under the existing GitHub-only instruction. GitHub commits and live website publishing are distinct steps.

## Relevant changed files

index.html, paper-library.js, engine.js, print.html, answer-key.html, sw.js, validate-papers.cjs, test-paper-library.cjs, test-headmaster-paper2.cjs, GitHub Actions workflow, and the source question files.

**Release note:** These changes were committed to GitHub main. Live deployment and Android Chrome testing require separate verification.
