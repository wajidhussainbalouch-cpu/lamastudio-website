# LAMA PPSC Preparation Academy — Information Officer (BS-17), Paper 03

**Created:** 9 November 2026  
**Job family:** `information-officer`, separate from `teaching`  
**Practice paper ID:** `INFO-2026-P03`  
**Original MCQ IDs:** `IO03-001`–`IO03-100`  
**Review status:** AI-assisted original educational practice; **not official PPSC material**, not independently academically approved, and not certified to a verified recruitment-specific PPSC syllabus.

## Subject coverage and sequence

- **Q001–025:** investigative reporting, data journalism, verification, corrections, attribution, visual and broadcast ethics.
- **Q026–050:** mass communication and media-effects concepts, sampling, audience research, media theory, quantitative analytics and research ethics.
- **Q051–075:** crisis and government public-information practice, public-sector PR, accessibility, citizen notices, stakeholder communication and service communication.
- **Q076–080:** digital journalism accessibility, media development, document-sampling bias, native advertising and broadcast editing.
- **Q081–085:** political science and governance; **Q086–090:** Pakistan history; **Q091–095:** Urdu literature; **Q096–100:** English literature.

The **80 journalism/mass-communications plus 20 related humanities** split is an academy practice design, **not a confirmed official PPSC exam weighting**. The frontend's historical Information Officer case reference remains unverified and should not be presented as an active vacancy without an original commission notice.

## Public practice and paper-family cap

- Four 25-question source batches `papers/information-officer-03-part1.js` through `part4.js`, each with stable ID, subject, unique topic, four distinct options, answer index and written explanation.
- `papers/information-officer-03-register.js` publishes a separate 100-question, 90-minute **free practice** paper with `sequence:3`, `jobIds:['information-officer']`, distinct attempt/score history and stable ID-derived answer-option rotation.
- `index.html`, `print.html` and `answer-key.html` load the new source and registration files. The public offline PWA cache `lama-ppsc-preview-v84` lists all five new scripts; authentication, subscription and private API responses are **not** cached.
- Shared library regression validates Information Officer job-specific deep links, published status, saved attempt selection and independent family ceilings. **3/20 Information Officer papers = 300 public MCQ positions**, alongside **20/20 Headmaster/Headmistress teaching-family papers = 2,000 positions**; total **23 public practice papers / 2,300 question positions**.
- No Headmaster 21st paper, existing candidate account changes or alterations of historical attempts, results, payment approvals or teaching question data.

## Quality and originality checks

- Exactly 100 sequential `IO03-*` IDs, 100 distinct normalized question stems, 100 distinct topics and 63 subject/category labels; four distinct answers and detailed educational explanations per question.
- Automated normalized-stem and token-Jaccard overlap screening (threshold 0.60) against the **200 previous Information Officer questions in Papers 01 and 02** found no identical or high-overlap text matches; internal Paper 03 duplicates were also screened.
- Registration layer checks exact normalized stems across the entire public bank. Tests confirm answer text is preserved by deterministic option rotations and that job-family paper caps remain independent.
- Added `test-information-officer-paper3.cjs`; extended `test-paper-library.cjs`, `validate-papers.cjs` and `.github/workflows/ppsc-academy-checks.yml`.
- **GitHub Actions PPSC Academy Quality Checks passed** at commit `5c85ea40d5a13a0e4bfbefe59be2fb2815ee8001`, run `42609015071`: https://github.com/wajidhussainbalouch-cpu/lamastudio-website/actions/runs/42609015071.
- Automated text similarity, structural checks and answer rotation **cannot guarantee factual correctness, syllabus alignment or all conceptual uniqueness**. No item is independently reviewed.

## Supabase protected editorial database

- Inserted `IO03-001`–`IO03-100` as **100 `draft` rows** under `public.ppsc_question_bank` with `job_id='information-officer'`, in four 25-item batches using non-destructive `ON CONFLICT DO NOTHING`.
- Verified **300 Information Officer editorial rows / 300 distinct normalized stems**, including exactly 100 Paper 03 draft rows, all 100 structurally valid and **zero academic approvals**. The teaching family remains at **1,930** editorial rows. Total private teaching + information editorials: **2,230** rows.
- Public practice scripts contain browser-readable answer keys, so they are **not suitable as a secure high-stakes/premium question source**. The private editorial bank remains protected by its existing security rules.

## Production gates and next paper

1. Verify a Vercel **READY** deployment associated with the custom domain `www.lamastudio.pk` has a GitHub SHA containing Paper 03; CI success alone is insufficient proof of publication.
2. Live-test Android Chrome and PWA: manually start exam, timer, answer selection/persistence, resume, submit, score, print and post-submission explanation; check offline cache freshness.
3. Do not initiate manual Vercel deployments solely to check the alias because of prior quota concerns.
4. **Next `Continue`**: Information Officer **Paper 04**, IDs `IO04-001`–`IO04-100`, after checking GitHub and Supabase for concurrent work. Keep this job capped at 20 full papers, separate from the teaching family.
