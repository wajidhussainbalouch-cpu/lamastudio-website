# LAMA PPSC Academy — Headmaster / Headmistress Paper 7

**Prepared:** 6 November 2026  
**Paper ID:** `HM-2026-P07`  
**Question IDs:** `HM07-001` through `HM07-100`  
**Job catalog assignment:** `teaching` (both Headmaster / Headmistress and Senior Headmaster / Headmistress preparation options)  
**Status:** Free **educational practice** paper registered in GitHub source. Automated structural tests added; **not independently academically reviewed** and **not an official PPSC paper**.

## Deliverables

- Exactly 100 new scenario-based and knowledge-based multiple-choice questions, in `papers/headmaster-07-part1.js` through `part4.js`, assembled by `papers/headmaster-07-register.js`.
- Each item has an ID, subject, unique topic, question, four options, one keyed answer, substantive explanation and difficulty descriptor.
- Paper 7 registers with `LAMA_PPSC_PAPERS` as `HM-2026-P07`, `jobIds: ['teaching']`, `minutes: 90`, `access: 'free'`, `publishStatus: 'public'`, `reviewStatus: 'automated-checked'`, `qaStatus: 'pass'` and `practiceOnly: true`.
- The existing paper registry now contains seven full 100-question school-head practice papers (700 total positions). Paper 1–6 IDs, records and local attempt histories are not intentionally changed.
- Scripts load in the academy exam page, printable questions page, answer-key page and PWA service-worker precache (v62). Questions use the existing 90-minute timer, per-paper local state, score calculation and answer review.
- The candidate's answer-key page requires a locally marked submitted attempt for **display**, but answer keys are inside public JavaScript and are **not secure for paid or proctored exams**. Do not market this as protected content.

## Checks performed

- Inspected source and loaded all 100 Paper 7 items using a JavaScript runtime: sequential IDs, 100 distinct question stems and topic labels, unique four-option sets, explanation length checks and indexed correct answers.
- Answer-index distribution before registration: A 23 / B 27 / C 26 / D 24.
- Independent text-comparison scripts found **no exact normalized stems** repeated from Paper 1 or Paper 6 and no high-similarity matches at the chosen threshold; additional exact and near-text screens against source Papers 2–5 also found none at their threshold.
- Compared 100 new stems against the available `prior-private-stem-fingerprints.json` **30 hashed entries** with no exact normalized collisions. This does **not** establish zero overlap with the other private Supabase drafts, which were not individually compared.
- Added `test-headmaster-paper7.cjs` for cross-paper ID and stem uniqueness, answer-option rotation integrity, 700 public paper positions, print/answer-key/PWA links and post-submission answer review.
- Updated the global paper validator and job-wise library test, and added the new regression to `.github/workflows/ppsc-academy-checks.yml`.
- **Automated GitHub Actions execution and real Android Chrome interaction were not confirmed in this session.** Independent review of academic accuracy, quality and alignment with any eventual official PPSC case syllabus is still required.

## Publication boundaries

Other academy job categories **do not** inherit this school-head paper. Their practice libraries must stay empty until genuine job-specific papers are reviewed and registered. This publication does not signal an open PPSC recruitment opportunity, subscription payment availability, or production deployment.

No Vercel deployment was requested or triggered. GitHub commits alone do not establish that the live website has refreshed.
