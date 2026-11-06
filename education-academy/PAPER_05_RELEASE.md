# LAMA PPSC Academy — Headmaster / Headmistress Paper 5

**Created:** 6 November 2026  
**Paper ID:** `HM-2026-P05`  
**Stable question IDs:** `HM05-001`–`HM05-100`  
**Status:** 100 original **free educational-practice** MCQs. Structural, duplicate and answer-key tests passed. No independent human academic review or official PPSC case-specific verification has occurred.

## Delivered

- Exactly **100 new original questions**, split into four 25-item source files under `papers/headmaster-05-part1.js` through `part4.js`, with publication registration in `papers/headmaster-05-register.js`.
- Every question has a subject and distinct topic, full question stem, four plausible choices, one correct answer, rationale and difficulty classification.
- Papers 1–4 remain unchanged. For the two school-head job choices, the academy source now offers **5 distinct free practice papers / 500 public MCQ positions**. No new papers were falsely created for unrelated posts.
- Paper 5 has its own **90-minute timer**, local unfinished attempt, submitted marks and history key `lama_ppsc_attempt_HM-2026-P05`. Existing `lama_ppsc_history_v1` scores are not cleared.
- The standard examination interface shows the score, each correct option, chosen option and explanation **after submission**. The printable answer key at `answer-key.html?paper=HM-2026-P05` is unlocked by a locally submitted attempt and supports **Print / Save as PDF**. `print.html?paper=HM-2026-P05` prints a question-only version with no answers.
- The **public free paper** includes answer keys inside downloadable JavaScript. This is only a post-submission user-experience gate; it must not be described as secure answer protection for a paid or proctored test. A future premium service requires server-side access-controlled delivery and scoring.

## Originality and question quality checks

- 100 unique question identifiers, 100 unique stems and 100 distinct topic labels.
- Compared with 100 public Paper 1 questions and the **330 existing** private Supabase stems (which include the earlier 30 teaching-editorial drafts and Papers 2–4). No exact duplicate stems or strong word-overlap matches were found during automated screening.
- Questions cover educational administration and governance, classroom pedagogy, curriculum, educational statistics and research, English, ICT/cybersecurity, science and environmental literacy.
- Four distinct nonblank options per item, correct answer preserved under deterministic option rotation, specific explanations, content-length requirements and a balanced distribution of correct positions.
- Four public scripts, selector, exam print view, answer review and PWA public cache (`lama-ppsc-preview-v60`) are included in the source tests.
- Automated screening cannot detect every semantic paraphrase, syllabus mismatch, debatable wording, scientific inaccuracy or local-law exception. **Human academic review is required** before claiming verified examination alignment.

## Supabase verification

Paper 5 was saved in the isolated LAMA PPSC Academy Supabase project in four batches of 25 records, with conflict-safe inserts to `public.ppsc_question_bank`, `job_id='teaching'`, `review_status='draft'`. No previous question was overwritten.

| Metric | Verified value |
| --- | ---: |
| Newly inserted Paper 5 draft questions | 100 |
| Total private school-head bank records | 430 |
| Unique normalized private question stems | 430 |
| Private editorial drafts | 430 |
| Independently human-reviewed/approved | 0 |
| Structurally invalid new Paper 5 records | 0 |
| Public anonymous table read/write | Denied (RLS and grants) |

## Source files changed

- `papers/headmaster-05-part1.js` to `part4.js` and `headmaster-05-register.js`
- `index.html`, `print.html`, `answer-key.html`, `sw.js`
- `test-headmaster-paper5.cjs`, `test-paper-library.cjs`, `validate-papers.cjs`, `.github/workflows/ppsc-academy-checks.yml`
- `README.md`, `PROJECT_MASTER_HANDOFF.md`, `QUESTION_BANK_WORKFLOW.md`

## Next command: Continue → Paper 6

1. Retrieve current GitHub `main` and all paper source/question bank files. Query the current Supabase private stems first; never use stale counts.
2. Write **another 100 original Headmaster/Headmistress questions**, IDs `HM06-001`–`HM06-100`. Avoid duplicates and lightly reworded variants of the existing 500 public questions or any private editorial drafts.
3. Validate numerical answers, unique plausible options, explanation accuracy, response distribution, job and syllabus relevance and cross-paper similarity.
4. Preserve Papers 1–5 and all candidate attempts. Add the sixth paper as `HM-2026-P06` with its own 90-minute attempt, answer-key review and downloadable browser-print/PDF flow.
5. Insert 100 additional private RLS-protected draft records without overwriting existing data. Update the public PWA cache, content tests, job-wise selector tests, GitHub Actions and MD handoffs.
6. Keep content labelled as **original academy free practice**, not official PPSC material. Do not enable premium answer-key delivery without a private scored exam service.
7. Observe the existing **GitHub-commit-only / no manual Vercel deployment** constraint; verify GitHub CI and check the actual production commit separately. A successful CI job does not establish the live site uses that commit.

## Outstanding release gates

Academic editing, case-specific PPSC syllabus alignment, live Android/mobile Chrome examination and production deployment verification are separate from the completed authoring and source integration. The Supabase security advisor previously flagged leaked-password protection as disabled, a distinct authentication hardening task.
