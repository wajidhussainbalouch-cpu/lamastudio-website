# LAMA PPSC Academy — Headmaster / Headmistress Paper 11

**Completed:** 6 November 2026  
**Paper ID:** `HM-2026-P11`  
**Question IDs:** `HM11-001`–`HM11-100`  
**Academic status:** 100 original **free educational-practice** MCQs. Automated structural and duplicate-screening tests passed. **Independent subject-expert review and case-specific official PPSC syllabus verification remain pending.** Never present these as official PPSC questions.

## Work completed

- Four source files, `papers/headmaster-11-part1.js` through `part4.js`, each containing **25** different educational-practice questions with four answer options, one correct index, rationale, subject, topic and difficulty.
- Subject breadth: school governance, strategy, administration, safety and financial controls; pedagogy, inclusion, educational psychology and assessment; mathematical reasoning, statistics and research; English, ICT, security and general science.
- `papers/headmaster-11-register.js` registers a distinct 90-minute free school-head practice examination `HM-2026-P11`, available to the existing teaching job family (Headmaster/Headmistress and Senior Headmaster/Headmistress).
- **Eleven separate 100-question public practice papers / 1,100 public MCQ positions** in the GitHub academy source. No changes to earlier paper IDs or their questions, users, memberships, subscriptions or candidate score/attempt data.
- Separate local attempt key `lama_ppsc_attempt_HM-2026-P11`, unchanged shared score-history format, results and correct-answer explanations after submission.
- `index.html`, `print.html` and `answer-key.html` load the new bank. `print.html?paper=HM-2026-P11` prints a question-only version; `answer-key.html?paper=HM-2026-P11` permits browser Print / Save as PDF after a submitted attempt.
- Offline PWA public asset version updated to `lama-ppsc-preview-v66`.

**Free-paper answer-key limitation:** Correct keys are present in downloadable public JavaScript, so the post-submission interface restriction is for study workflow, not true answer confidentiality. Do not reuse these client scripts for a paid or proctored secure exam without server-side entitlements and scoring.

## Originality, integrity, and validation

- **100** sequential unique IDs, **100** distinct normalized stems, **100** different topic labels and **72** subject labels.
- All stems are at least 45 characters; explanations at least 65; every item has four distinct normalized options and one integer answer index between 0 and 3.
- Checked all Paper 11 question stems against **930 previous private Supabase teaching records plus the 100 original public Paper 1 questions**. Revised five items to remove similar scenarios, correct distractor collisions and improve uniqueness; no exact or strong Jaccard overlaps remained after the revisions at the screening threshold.
- Raw source correct-answer distribution A25/B27/C24/D24. Deterministic rotation preserves the keyed answer text with a rendered distribution A26/B26/C22/D26.
- Updated `validate-papers.cjs`, `test-paper-library.cjs`, created `test-headmaster-paper11.cjs`, added it to `.github/workflows/ppsc-academy-checks.yml`. Tests check the 11-paper / 1,100-slot registry, prior-paper preservation, 90-minute paper, free practice labeling, answer-option rotation, subject/topic coverage, distinct attempts and post-submission answer-key access.
- **GitHub Actions passed** on source commit `ac4430a5ee1274b63d7e1a88206b7bbba7caa240`: https://github.com/wajidhussainbalouch-cpu/lamastudio-website/actions/runs/42217275930. Re-run the workflow as the MD handoff commits advance.

Automated quality checks cannot guarantee the absence of subtle semantic paraphrases, ambiguity, mistaken science facts or alignment to a particular PPSC announcement. Human academic review remains required before claiming substantive item verification.

## Protected Supabase database verification

Inserted all **100** new `HM11-001`–`HM11-100` records into `public.ppsc_question_bank`, `job_id='teaching'`, `review_status='draft'`, under the pre-existing authorized editor. Four batches of 25 used `ON CONFLICT (id) DO NOTHING` and did not overwrite earlier records.

| Verified metric | Count or setting |
| --- | --- |
| Paper 11 new draft rows | 100 |
| Total private teaching-bank records | 1,030 |
| Distinct normalized private question stems | 1,030 |
| Private editorial drafts pending approval | 1,030 |
| Human-approved private questions | 0 |
| Invalid structural Paper 11 records | 0 |
| RLS on private table | Enabled |
| Anonymous table SELECT or INSERT privileges | Not granted |

The public bank contains 1,100 practice questions across Papers 1–11. The private editor bank includes the 1,000 items from Papers 2–11 and 30 older, unpublished editorial drafts. Paper 1 is public client code only.

## Files and documentation

- `papers/headmaster-11-part1.js` … `part4.js`, `papers/headmaster-11-register.js`
- `index.html`, `print.html`, `answer-key.html`, `sw.js`
- `test-headmaster-paper11.cjs`, `test-paper-library.cjs`, `validate-papers.cjs`
- `.github/workflows/ppsc-academy-checks.yml`
- `README.md`, `PROJECT_MASTER_HANDOFF.md`, `QUESTION_BANK_WORKFLOW.md`

## Next command: Continue → Paper 12

1. Fetch the latest GitHub `main`, all current source papers, and live Supabase question stems first. Do not assume counts or prior task status.
2. Write **100 genuinely new Headmaster/Headmistress MCQs** `HM12-001`–`HM12-100`; compare them against the existing 1,100 public practice questions and all private drafts. Avoid slight numerical substitutions, template repetition and close paraphrases.
3. Verify calculations, alternatives, answer-key text, explanations, balanced display positions, unique topics and educational relevance. Keep newly imported editorial rows at `review_status='draft'` until human approval.
4. Add a distinct `HM-2026-P12` 90-minute free practice exam with its own attempt, results, post-submission explanations and printable question/answer pages. Preserve earlier paper content, users and score history.
5. Extend PWA cache, 12-paper validators, standalone Paper 12 test, GitHub Actions, Supabase private draft bank and MD handoffs; recheck CI.
6. Maintain the standing **GitHub-only / no manual Vercel deployment** constraint. Verify the actual production commit and Android Chrome flow independently; do not assume GitHub success means the latest paper is live.
7. Retain transparent 'original academy free practice, not official PPSC, academic review pending' labels. Free client-side keys are not secure premium content.

## Remaining separate release gates

Independent academic content review, official PPSC recruitment-specific syllabus alignment, real candidate workflow testing on Android/mobile Chrome and confirmation of the precise Vercel production commit are not implied by successful source tests and Supabase imports.
