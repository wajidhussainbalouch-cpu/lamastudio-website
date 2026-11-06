# LAMA PPSC Academy — Headmaster / Headmistress Paper 9

**Completed:** 6 November 2026  
**Practice Paper ID:** `HM-2026-P09`  
**Question IDs:** `HM09-001` to `HM09-100`  
**Review status:** Original **free educational practice**, automated checks passed. **Independent academic review and any case-specific PPSC syllabus verification are pending; these are not official PPSC questions.**

## Delivered

- 100 original multi-choice questions with stable IDs, broad subjects, unique topics, four options, an answer index, an explanation of at least 65 characters and a difficulty tag.
- Four source batches of 25: `papers/headmaster-09-part1.js` to `part4.js`, covering school governance/management; teaching, learning and inclusion; assessment, quantitative reasoning and educational research; English, ICT and science.
- The registration script `papers/headmaster-09-register.js` adds an independent **90-minute** free paper (`HM-2026-P09`) assigned to `jobIds: ['teaching']`. Headmaster/Headmistress and Senior Headmaster/Headmistress use this teaching-specific practice library; unrelated job categories are not assigned the paper.
- GitHub source now includes **nine distinct 100-question practice papers / 900 public practice MCQ slots**. Papers 1–8 are retained unchanged, with separately keyed local attempts and scores.
- Paper 9's attempt state uses `lama_ppsc_attempt_HM-2026-P09`. After submission the candidate can review selected/correct answers, explanations and score; `answer-key.html?paper=HM-2026-P09` is printable as PDF from the browser. `print.html?paper=HM-2026-P09` prints questions without the answers.
- `index.html`, `print.html`, `answer-key.html`, the nine-paper library selector and public PWA cache version **`lama-ppsc-preview-v64`** load Paper 9.
- **Security note:** The public free-practice JavaScript itself contains answer keys. The local post-submission gating is for candidate study workflow only, not secure premium or proctored-exam confidentiality. A paid exam should use access-controlled private scoring and data delivery.

## Quality checks

- 100 sequential unique IDs `HM09-001`–`HM09-100`; 100 distinct normalized question stems and 100 topic names; 69 subject labels.
- All question stems meet a minimum 45-character length and explanations 65 characters. Each item has exactly four distinct normalized options and one valid correct-answer index.
- Direct automated screening against **730 previous private Supabase teaching stems and 100 original Paper 1 public stems**; no exact or strong token-overlap matches remain after revision. The original question drafts with overlap or duplicate distractor issues were corrected before registration.
- Source correct-letter distribution is A25/B26/C25/D24, with deterministic option rotation producing A27/B23/C26/D24 for the exam display. Correct answer text is preserved by the registration algorithm.
- Global validator, job-wise public paper selector, standalone `test-headmaster-paper9.cjs` (including prior-paper preservation and post-submission answer page), PWA asset checks and other academy regression tests included in GitHub Actions.
- Automated tests help find technical or textual problems. They **do not replace a qualified academic editor's verification of facts, distractor plausibility, ambiguity or official syllabus relevance**.

## Supabase private draft bank

Four batches of 25 were inserted into the existing RLS-protected `public.ppsc_question_bank`, `job_id='teaching'`, with existing authorized `created_by` and `review_status='draft'`. `ON CONFLICT(id) DO NOTHING` preserved all earlier records.

| Database measure | Verified value |
| --- | ---: |
| New Paper 9 private drafts | 100 |
| Total private teaching questions | 830 |
| Distinct normalized private stems | 830 |
| Pending draft records | 830 |
| Human-approved records | 0 |
| Structurally invalid Paper 9 records | 0 |
| RLS enabled | Yes |
| Anonymous SELECT / INSERT grants | No |

The private bank contains the eight later public paper batches (Papers 2–9, 800 items), plus 30 earlier separate editorial drafts. Paper 1's 100 MCQs are published in original client-source practice code, not duplicated in this private table.

## Changed source and documentation

- `papers/headmaster-09-part1.js` through `part4.js`, `papers/headmaster-09-register.js`.
- `index.html`, `print.html`, `answer-key.html`, `sw.js`.
- `test-headmaster-paper9.cjs`, `test-paper-library.cjs`, `validate-papers.cjs`, `.github/workflows/ppsc-academy-checks.yml`.
- `README.md`, `PROJECT_MASTER_HANDOFF.md`, `QUESTION_BANK_WORKFLOW.md`.

## Next Continue: Paper 10

1. Fetch latest `main` and the current Supabase private bank. Preserve all nine public papers and their existing results.
2. Write 100 **substantially new** Headmaster / Headmistress practice MCQs `HM10-001` to `HM10-100`. Screen against **900 existing public MCQs** and all current private editorial drafts; no recycled stems, barely altered numbers or superficial rewording.
3. Verify numerical answers, facts, grammar, four defensible options, clear explanations and unique topics before publishing.
4. Add an independent 90-minute public `HM-2026-P10` practice paper with the usual exam/print/answer-review pages and its own attempt key.
5. Insert 100 private draft records without overwriting existing questions, accounts, registrations, memberships or scores. Extend PWA assets, global validators, standalone Paper 10 QA, CI and MD handoff.
6. Keep the original educational-practice / not-official / academic-review-pending labels. **Do not treat public JavaScript answers as premium secure exam content.**
7. Honor the standing GitHub-only policy and **do not trigger manual Vercel deployment**. Verify the actual live production SHA and Android mobile-browser behavior separately.

## Remaining verification

GitHub success and Supabase insertion do not prove the complete Paper 9 revision is available at the live custom domain. Real Chrome/Android end-to-end testing, academic verification, and exact PPSC vacancy-specific syllabus checks remain separate release gates.
