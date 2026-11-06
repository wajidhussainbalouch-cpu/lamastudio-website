# Headmaster / Headmistress Paper 13 Release

## Live website publication blocker — 6 November 2026

A production deployment was explicitly attempted for the tested GitHub commit `33aef0c805a2b1d3058c1db69bbfd4142abe2112`, targeted to Vercel project `lamastudio-website` on the connected account. Vercel rejected it with **HTTP 402**, code **`api-deployments-free-per-day`**, stating the Hobby account exceeded 100 daily deployments and returning `retryAfter=86400` seconds. **No new production deployment resulted.** The latest READY production SHA seen prior to this attempt was `a4ea406bf940734da3be71e8c59691a61428b7c4`, earlier than Paper 13. Therefore Paper 13 is **not yet verified live on the custom domain**.

When the Vercel limit resets or the user resolves the quota, deploy the latest reviewed GitHub `main` once (not every intermediary commit), confirm that the deployment reports `READY` and the exact main commit, and check the public `/education-academy/` paper selector and Paper 13 attempt/print/answer-key workflow on mobile. Do not repeat deployment attempts before the reset. Source, Supabase and academic-review statuses are unaffected.


Completed 6 November 2026. Paper ID: `HM-2026-P13`; items: `HM13-001`–`HM13-100`.

**Status:** Original LAMA educational practice, free. Automated structural and overlap checks passed; human academic review and official PPSC syllabus mapping remain pending.

## Source delivery
- `papers/headmaster-13-part1.js` through `part4.js`: 25 MCQs each, all with four options, one answer, explanation, subject, topic and difficulty.
- `papers/headmaster-13-register.js`: unique 90-minute school-head practice paper, assigned to `teaching` job family.
- `index.html`, `print.html`, `answer-key.html` updated to include Paper 13, with separate local attempt key and post-submission explanation review.
- `sw.js` PWA cache `lama-ppsc-preview-v68` includes new source assets.
- 13 individual 100-question practice papers now in GitHub source: **1,300 public practice positions**. Earlier papers, accounts, candidate results and memberships preserved.

## Maximum papers per job
**20 published papers maximum per job family.** `paper-library.js` applies `MAX_PAPERS_PER_JOB=20` to display, selection and deep links. Headmaster and Senior Headmaster variants share the teaching family; other job families have their own twenty slots. The Paper 13 register refuses a 21st teaching-family item. Library regression tests check the cap and preserve previous candidate history.

## Verification
- Exactly 100 distinct IDs and normalized stems and 100 unique topic labels; 81 subject labels.
- Four distinct answer options on every item; valid answer index, clear explanation and length requirements checked.
- Automated comparison to 1,130 prior private editorial stems and 100 public Paper 1 stems. Similar questions and conflicting distractors were revised; no strong token overlap remained under the screening criterion.
- Key distribution in source A23/B29/C23/D25; deterministic display rotation A19/B27/C30/D24.
- CI test file `test-headmaster-paper13.cjs`, global validator, job-library validator and GitHub Actions succeeded:
  https://github.com/wajidhussainbalouch-cpu/lamastudio-website/actions/runs/42251106845

## Protected Supabase
100 Paper 13 rows imported as `draft` using four batches of 25, without overwriting older records. Total private teaching questions: **1,230**, all with distinct normalized stems; **1,230 drafts**, 0 independently approved. New rows passed structural checks. Private RLS remains enabled and anonymous SELECT/INSERT privileges are not granted.

Public client JavaScript contains free-practice answer keys; hiding them before local submission does not make a secure paid or proctored exam. Human fact checking and specific official PPSC syllabus alignment are still required.

## Next Continue: Paper 14
First inspect current repository, database, CI and production state. Generate `HM14-001` to `HM14-100` as substantively novel practice questions. Compare against 1,300 public MCQs and private drafts, verify answers, register a distinct 90-minute exam and printable key, import 100 draft records, extend tests/PWA and update MD handoffs. Preserve the **20 per job** cap and all existing accounts, results and papers. Check the live Vercel commit separately before claiming website publication.
