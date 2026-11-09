# LAMA PPSC Preparation Academy — Headmaster / Headmistress Paper 16

**Date:** 9 November 2026  
**Paper ID:** `HM-2026-P16`  
**Question IDs:** `HM16-001`–`HM16-100`  
**Academic status:** Original LAMA practice material; automated checks only. **Not official PPSC questions; independent educator review and vacancy-specific syllabus verification remain pending.**

## Complete paper content and integration

- Four question files `papers/headmaster-16-part1.js` through `headmaster-16-part4.js`: 25 questions each, distinct subject, topic, four options, keyed answer and explanation per item.
- Composition: **80 education, school management, pedagogy, psychology and curriculum questions; 20 English, quantitative, logical, digital-literacy and general-science questions**. The 80/20 allocation is a preparation design target, not a verified statement of current PPSC recruitment rules.
- `papers/headmaster-16-register.js` registers a separate **free 90-minute practice paper** for the teaching job family, visible to Headmaster/Headmistress and Senior Headmaster/Headmistress preparation variants.
- Added to candidate exam `index.html`, question-only two-column A4 `print.html`, and post-submission `answer-key.html`; normal attempt and score isolation uses `lama_ppsc_attempt_HM-2026-P16`.
- Offline PWA cache incremented from `lama-ppsc-preview-v76` to `lama-ppsc-preview-v77`. Existing candidate records, earlier question banks, scores and subscriptions were not migrated or deleted.
- Public source now registers **16 full-length teaching-family practice papers / 1,600 question positions**. The **20-paper cap** per job family remains in force; teaching variants share one cap.

## Validation and originality

- Source count: 100 distinct sequential IDs, 100 distinct normalized stems, 100 topic labels and 75 distinct subject labels; four options and one keyed correct answer with explanation for each.
- Original raw answer letter positions: A25/B25/C25/D25; post-registration deterministic option rotation: A25/B29/C26/D20; key text preserved by rotation.
- Question stems screened against 1,400 previously released school-head practice questions in Papers 2–15: no exact matches or high-overlap stems at the configured token-Jaccard threshold of 0.60. Additional registry checks include the 100-item legacy demo Paper 1.
- Added `test-headmaster-paper16.cjs`; extended `validate-papers.cjs`, `test-paper-library.cjs` and CI workflow. Automated structural and near-text repetition checks do **not** prove factual accuracy, no common underlying learning objective, or independent academic approval.
- Paper 16 is a free public-browser practice bank. **Answer keys are embedded in client JavaScript**, so this content is unsuitable as a secure premium examination bank without server-side protection.

## Supabase editorial records

- **100 separate `HM16-*` private editorial records inserted**, non-destructively, into `public.ppsc_question_bank` for `job_id='teaching'`; all flagged `draft`.
- Verified protected teaching bank: **1,530 records, 1,530 distinct normalized stems, 0 academically approved**. Paper 16 has 100/100 structurally valid stored records.
- Existing row-level-security grants and policy definitions were unchanged; public practice mode is not evidence of human editorial approval.

## Release and verification gate

- GitHub commit presence and CI success alone **do not prove** publication on the custom production domain `www.lamastudio.pk`.
- Do **not** trigger extra manual Vercel deployments due to the previously exhausted Hobby deployment quota. Compare the latest READY production SHA to the GitHub main SHA before claiming live availability.
- Confirm real Android Chrome / PWA exam start, 90-minute timer only during exam, exam completion, saved scores, question print, post-submission answer review and offline update before a production launch claim.

## Next paper, when instructed

Continue with **Paper 17**, IDs `HM17-001`–`HM17-100`, exactly 100 new questions and no substantively repeated items, preserving the 20-per-family ceiling. Independently review and correct earlier content before describing any private question as academically approved.
