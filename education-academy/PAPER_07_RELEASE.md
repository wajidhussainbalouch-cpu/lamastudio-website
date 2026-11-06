# LAMA PPSC Academy — Headmaster / Headmistress Paper 7

**Completed:** 6 November 2026  
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
- Final answer-index distribution in the original source: A 23 / B 29 / C 25 / D 23. Deterministic option rotation keeps the keyed answer text correct; registered display positions are A 35 / B 25 / C 18 / D 22.
- Directly compared all 100 new stems to the previous **530 private question-bank stems plus 100 Paper 1 public stems**. Three potentially overlapping items (HM07-023, HM07-043 and HM07-083) were rewritten with different instructional targets. Final items have distinct normalized stems, and the structural originality tests pass.
- Existing private fingerprints were also checked by the automated test. The full current Supabase question texts, including the 30 earlier unpublished drafts, were separately screened before uploading Paper 7. Automated comparisons do not eliminate every conceivable semantic overlap or substitute for academic review.
- Added `test-headmaster-paper7.cjs` for cross-paper ID and stem uniqueness, answer-option rotation integrity, 700 public paper positions, print/answer-key/PWA links and post-submission answer review.
- Updated the global paper validator and job-wise library test, and added the new regression to `.github/workflows/ppsc-academy-checks.yml`.
- **GitHub Actions passed**, including the new Paper 7 regression, after the content changes: [successful automated run](https://github.com/wajidhussainbalouch-cpu/lamastudio-website/actions/runs/42189823637). Real Android Chrome interaction, human review and official case-specific syllabus validation remain unverified.

## Publication boundaries

Other academy job categories **do not** inherit this school-head paper. Their practice libraries must stay empty until genuine job-specific papers are reviewed and registered. This publication does not signal an open PPSC recruitment opportunity, subscription payment availability, or production deployment.

No Vercel deployment was requested or triggered. GitHub commits alone do not establish that the live website has refreshed.

## Supabase upload verified

- Inserted 100 private records `HM07-001`–`HM07-100` as editorial `draft` questions in four idempotent 25-item batches. Each uses the existing teaching job and authorized owner ID. Previous questions and candidates were not replaced.
- Private bank count after upload: **630 rows with 630 distinct normalized question stems** (530 previous plus 100 new).
- The public practice bank contains **700 items across seven distinct school-head papers**; the private editable database also includes 30 older draft items that were never a separate public paper.
- **630 private records remain editorial drafts, not independently human-approved.** The published public practice copy is labelled original, automatically checked educational practice; no claim of official PPSC endorsement.

## Next `Continue` milestone: Paper 8

1. Read this handoff and fetch GitHub main, public Papers 1–7 and the current private Supabase bank before authoring.
2. Create 100 **genuinely new** Headmaster/Headmistress questions `HM08-001` through `HM08-100` with clear explanations and no rephrased prior scenarios.
3. Validate calculations, answer positions, distractors and text similarity against all current questions; mark the editable private entries as `draft` pending human review.
4. Register Paper 8 as `HM-2026-P08` in the selectable paper library, exam/print/answer-key pages and public PWA cache. Preserve previous papers, historical attempts, accounts and permissions.
5. Run CI, update the master docs and verify real production deployment independently; follow the GitHub-only policy and **do not initiate a manual Vercel deployment**.
