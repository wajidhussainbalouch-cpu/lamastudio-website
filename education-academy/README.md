# LAMA PPSC Preparation Academy — development handoff

## Final school-head milestone — Paper 20 (9 November 2026)

**Paper 20 completed in source:** `HM-2026-P20` adds 100 original AI-assisted free-practice MCQs (`HM20-001`–`HM20-100`) in four batches, with 80 education-domain and 20 general-ability questions. **20 teaching-family practice papers / 2,000 MCQ positions** are integrated into the exam selector, 90-minute test, per-paper saved attempts, print and post-submission explanations. The owner-set **20-paper limit is now reached**; do not create a Paper 21 without explicit authorization to change this policy. Public PWA cache `lama-ppsc-preview-v81`.

**Protected Supabase editorial bank:** Added 100 Paper 20 rows as `draft` without changing earlier records. Verified **1,930 private teaching editorial records / 1,930 distinct normalized stems**, exactly 100 Paper 20 drafts, all 100 structurally valid and **zero human-approved**. GitHub Actions Paper 20 checks passed, including 100 unique stems/topics and no above-threshold text repeats against the public Papers 2–19. Independent academic answer-key, explanation, and current PPSC syllabus review remain outstanding. Browser-readable public practice answer keys are not secure premium exams.

**Next `Continue`:** Move to the **post-Paper-20 release audit**, including candidate paper selection, Start Examination, timer, answer persistence, score, printable question-only paper, post-submission key and PWA offline behavior. Check the READY production domain commit before calling the new paper live; avoid unnecessary manual Vercel deployments. See [PAPER_20_RELEASE.md](./PAPER_20_RELEASE.md).


## Latest school-head practice — Paper 19 (9 November 2026)

**Paper 19 integrated:** `HM-2026-P19` adds 100 new original AI-assisted Headmaster/Headmistress practice MCQs, in four 25-question batches (`HM19-001`–`HM19-100`), with 80 education-related and 20 general-ability items, 90-minute test, separate saved attempt, two-column question-only A4 paper and post-submission explanation. **19 public teaching-family papers / 1,900 MCQ positions** now register with a strict 20-paper cap. PWA cache `lama-ppsc-preview-v80`.

**Editorial bank:** 100 Paper 19 entries added as private `draft` rows without overwriting old records. Supabase audit: **1,830 teaching questions / 1,830 distinct normalized stems**, 100 structurally valid Paper 19 questions and zero human-reviewed approvals. GitHub Actions academy quality checks passed, including original-text/answer-key compatibility, but source-based answer keys are not secure premium exams and independent expert/syllabus review is still required.

**Next `Continue`:** First verify no concurrent Paper 20 source or protected records; then build **Paper 20** (`HM20-001`–`HM20-100`) to reach the 20-paper ceiling. Before claiming the latest update is live, confirm Vercel production alias READY at an appropriate GitHub commit and test on mobile; avoid extra manual Vercel builds. See [PAPER_19_RELEASE.md](./PAPER_19_RELEASE.md).


## Latest school-head practice — Paper 18 (9 November 2026)

**Paper 18 integrated:** `HM-2026-P18` has 100 new original AI-assisted free-practice questions (`HM18-001`–`HM18-100`), consisting of 80 education-domain and 20 general-ability MCQs, with a separate 90-minute examination, candidate attempt and score tracking, question-only A4 printing and post-submission answer explanations. **18 teaching-family papers / 1,800 public practice positions** are registered in GitHub. The existing maximum 20 papers per teaching job family stays in place; offline PWA cache is `lama-ppsc-preview-v79`.

**Private editorial Supabase bank:** 100 Paper 18 `draft` items inserted non-destructively; **1,730 unique teaching editorial questions**, with zero human-approved. Source screening against the older 1,630 private questions found no identical or above-threshold near-text question stems. Automated tests passed, but independent educational accuracy and vacancy-specific syllabus checking are pending. Public free-practice JS contains answer keys and is not suitable for secure paid tests.

**Next `Continue`:** Paper 19 (`HM19-001`–`HM19-100`), after confirming no concurrent work has already built it. Verify exact READY production SHA and mobile exam behavior independently of GitHub. Do not trigger unnecessary Vercel manual deployments. See [PAPER_18_RELEASE.md](./PAPER_18_RELEASE.md).


## Latest school-head practice — Paper 17 (9 November 2026)

**Paper 17 implemented:** `HM-2026-P17` adds 100 original free educational-practice MCQs (`HM17-001`–`HM17-100`) as four 25-question source files, with 80 education-related and 20 general-ability questions. The academy now registers **17 teaching-family papers / 1,700 public practice question positions**, using the existing 90-minute exam workflow, candidate attempt and score isolation, question-only A4 print and post-submission answer explanations. The offline PWA cache is `lama-ppsc-preview-v78`, and the 20-paper ceiling per job family is preserved.

**Protected Supabase editorial bank:** 100 new Paper 17 draft rows inserted non-destructively; verified **1,630 teaching editorial questions / 1,630 unique normalized stems**, with **zero human-approved** questions. The GitHub Actions structural and text originality checks passed, but independent academic correctness and PPSC vacancy-specific syllabus review are still pending. Public practice JS contains visible keys and must not be treated as secure premium testing.

**Next `Continue`:** Check repository and private bank for concurrent work, then build **Paper 18** (`HM18-001`–`HM18-100`) if absent. Do not claim live-site update until the production domain's READY SHA and mobile exam behavior are verified. Respect prior Vercel usage limits. See [PAPER_17_RELEASE.md](./PAPER_17_RELEASE.md).


## Latest school-head practice — Paper 16 (9 November 2026)

**Paper 16 integrated in GitHub source:** `HM-2026-P16` adds 100 original free practice MCQs (`HM16-001`–`HM16-100`) in four batches, with 80 education-domain and 20 general-ability items, 90-minute timed examination, distinct saved attempt, A4 paper printing, and post-submission answer explanations. **16 teaching-family papers / 1,600 public practice positions** now register, subject to the existing cap of 20 papers per job family. Public PWA cache: `lama-ppsc-preview-v77`.

**Private editorial bank:** 100 Paper 16 records inserted as `draft` without overwriting earlier records; **1,530 teaching questions and 1,530 distinct normalized stems, zero human-approved**. Source structure and text-overlap screening completed, but independent factual accuracy review and official PPSC syllabus verification are pending. Client-side free practice keys are not secure premium examinations.

**Next:** Paper 17 (`HM17-001`–`HM17-100`), unless another worker has already created it. Check source and Supabase first, and do not claim the academy's newest version is live without checking the READY production SHA and mobile browser. Do not trigger Vercel redeploys against the previously reached quota. Details: [PAPER_16_RELEASE.md](./PAPER_16_RELEASE.md).


## Job-wise subject and paper library (8 November 2026)

- The Academy has a dedicated **Question Bank & Paper Library** page: `index.html#library` or `section.html?view=library&job=teaching`. The job dropdown is sourced from the same catalog as the dashboard, including later Super Admin-published jobs.
- Each job's **published MCQ subject coverage** is counted directly from its registered public paper questions. The full list is searchable; candidates can download the currently selected job's subject counts as CSV. These are source-derived practice totals, **not syllabus weightages or private Supabase drafts**.
- The `Papers & Examinations` page now places the long subject list in a **collapsed** disclosure and links to the full library, reducing excessive scrolling on phones.
- The side menu adds **Question Bank Library** and an expandable **Job-wise Paper List**. Selecting a post shows only its published, numbered papers and opens the correct exam. Unpublished jobs show a clear empty-state message, never an unrelated school-head exam.
- Public paper order is derived from the stable paper sequence/ID in `paper-library.js`, rather than the insertion order in JavaScript. The same numbered ordering is used in the examination list, resource library and side menu. Existing paper IDs, saved scores and in-progress attempts are preserved.
- `library-ui.js` handles searchable subject counts, CSV export, menu job selector and automatic refresh on catalog changes. The `test-jobwise-library.cjs` regression is added to CI; service-worker cache updated to **v72**, including offline fallback for public job, library, print and paper deep links.
- The 20-public-papers-per-job cap remains enforced through `LamaPpscPaperLibrary.forJob`; new jobs and published papers will appear automatically **when registered through the existing catalog/public paper workflow**. This does not itself build new MCQs or grant subscription access.
- Browser end-to-end testing and actual Vercel production deployment have **not been independently verified**. No Vercel deployment was initiated by this change.


## Latest Headmaster / Headmistress milestone — Paper 15 (6 November 2026)

**Paper 15 complete:** `HM-2026-P15` adds 100 original educational-practice MCQs (`HM15-001`–`HM15-100`), with a separate 90-minute exam, unique saved candidate attempt, question-only print page and post-submission printable explanations. The academy GitHub source now contains **15 papers / 1,500 public MCQ positions**, retaining all previous papers, candidate accounts, memberships and results. Offline cache `lama-ppsc-preview-v70`.

**Protected Supabase editorial bank:** 100 new draft records inserted without overwriting existing records; **1,430 unique private questions**, all awaiting independent human academic approval. Automated source screening compared new stems against the previous 1,330 private records and legacy Paper 1, and corrected five overlaps. Strong token-overlap flags are now clear at the screening threshold. Automatic QA does **not** establish official PPSC syllabus approval or absence of subtle substantive repetition. Free public JavaScript contains answer keys, so the client review gate is educational only, not secure paid/proctored scoring.

**Policy:** Keep the existing **20-paper maximum independently per job family**; Headmaster/Senior Headmaster teaching variants share twenty slots. Next `Continue` begins **Paper 16** with `HM16-001`–`HM16-100`, if not already built. See [PAPER_15_RELEASE.md](./PAPER_15_RELEASE.md) for complete QA, security cautions and next instructions. GitHub success is not proof of the exact version on the live domain; inspect Vercel READY production SHA and Android Chrome behavior separately. Respect the previous Vercel deployment quota restriction.


## Latest school-head practice — Paper 14 (6 November 2026)

**Paper 14 is complete in GitHub:** `HM-2026-P14` contains 100 original free-practice MCQs (`HM14-001`–`HM14-100`) across four 25-question source files. Separate 90-minute timed exam, question-only printing, post-submission answer explanations and result history are integrated. The academy now registers **14 Headmaster/Headmistress papers / 1,400 public practice questions**, with earlier 13 papers and candidate data retained. The offline PWA version is `lama-ppsc-preview-v69`.

**Protected Supabase:** 100 new Paper 14 rows saved as `draft` without overwriting older records; **1,330 unique private editorial questions**, all pending human review. Cross-paper duplicate screening against 1,230 previous private stems plus public Paper 1 is clear at the established threshold after corrections. GitHub Actions validates the paper and job-wise limits. **Maximum of 20 papers per job family** is enforced; Headmaster and Senior Headmaster variants share the teaching family limit. No official PPSC endorsement or current syllabus validation is claimed; public JS free-practice answers cannot secure paid exams.

See **[PAPER_14_RELEASE.md](./PAPER_14_RELEASE.md)** for full status and next **Paper 15** instructions. The last explicit Vercel deployment for Paper 13 was blocked by the Hobby account's daily deployment quota. GitHub source status must not be confused with verified live custom-domain publication.


## Latest Headmaster / Headmistress batch — Paper 13 (6 November 2026)

**Paper 13 complete:** `HM-2026-P13` adds original LAMA free educational-practice questions `HM13-001`–`HM13-100`, with 90-minute individual exam, preserved attempt/score history, print-ready question-only paper and post-submission answer explanations. The GitHub source includes **13 papers / 1,300 practice MCQs**. Public PWA cache: `lama-ppsc-preview-v68`.

**Private Supabase:** Inserted 100 new Paper 13 `draft` questions; the protected teaching bank totals **1,230 unique draft questions**, with no human-approved records. Automated originality and structural checks passed, and GitHub Actions validates the new paper and older papers. Independent academic review and official PPSC vacancy-specific syllabus alignment remain pending.

**Maximum 20 papers per job:** `MAX_PAPERS_PER_JOB=20` enforced in the job-specific paper library and the Paper 13 registration guard. Teaching job variants share one twenty-paper cap; other job families have separate caps. Candidate records are preserved. Free client JavaScript contains answer keys; normal post-submission review is not secure premium-exam scoring.

See **[PAPER_13_RELEASE.md](./PAPER_13_RELEASE.md)** for detailed verification and next **Paper 14** instructions. Publishing to GitHub does not alone confirm the same version is live at the custom domain; check Vercel deployment commit and actual browser behavior separately.


## Latest Headmaster / Headmistress paper and maximum-per-job policy — Paper 12 (6 November 2026)

**Paper 12 completed in GitHub source:** `HM-2026-P12` contains 100 new original educational practice MCQs (`HM12-001`–`HM12-100`) with four options and explanation per question, a dedicated 90-minute exam, preserved candidate scores and attempts, printable question paper and post-submission printable answer review. This brings the school-head public practice collection to **12 distinct papers / 1,200 MCQs**, including its senior school-head variant. PWA cache is `lama-ppsc-preview-v67`.

**New owner-defined ceiling:** **Maximum 20 published full-length papers per job family.** The library enforces the cap separately by job ID (e.g., both `teaching:0` and `teaching:1` use the same teaching quota), shows **12 / 20**, prevents a 21st paper from appearing through the library or deep links, and does not delete existing results. Unrelated jobs have independent limits and must not receive school-head papers as substitutes. The Paper 12 register also refuses to exceed the teaching quota.

**Supabase private editorial bank:** 100 Paper 12 rows added with `review_status='draft'`. The `teaching` bank now holds **1,130 records / 1,130 distinct normalized stems**, with 0 human-approved and anonymous SELECT/INSERT blocked by permissions and RLS. Three overlapping draft questions were replaced before final checks. These are **original free practice questions, not official PPSC questions**, with independent academic review still outstanding. Public JavaScript contains answer keys, so local answer-review gating is not secure premium examination access control.

Read **[PAPER_12_RELEASE.md](./PAPER_12_RELEASE.md)** for source/test details, the 20-paper-per-job policy, production release verification instructions and next **Paper 13 (`HM13-001`–`HM13-100`)**. GitHub CI passing is separate from Vercel/custom-domain release and real mobile Chrome testing.


## Latest Headmaster/Headmistress question-bank milestone — Paper 11 (6 November 2026)

**Paper 11 completed:** `HM-2026-P11` contains 100 original Headmaster/Headmistress free practice MCQs (`HM11-001`–`HM11-100`), each with four choices and explanations, in four 25-question files. The Academy source registers **11 separate papers, 1,100 public practice questions**, 90-minute individual attempts, score/history tracking and post-submission answer explanations/printable answer key. Papers 1–10 and all existing candidate records are preserved. The exam, print, review and PWA source files are integrated; offline cache is `lama-ppsc-preview-v66`.

**Supabase:** Inserted 100 Paper 11 private `draft` questions without replacing previous records; the protected teaching editor bank now has **1,030 unique private questions / 1,030 pending editorial drafts**, with no human-approved records. Automated checks screened the new items against 930 older private stems plus Paper 1, corrected five problematic items, and validated 100 IDs, stems, topics and four answer options. **GitHub Actions passed** including Paper 11, global registry/answer review and backward compatibility. Human academic review and official case-specific PPSC syllabus verification remain outstanding. Free client JavaScript contains answer keys, so local submission gating is a study-only feature, not secure paid examination delivery.

**Read [PAPER_11_RELEASE.md](./PAPER_11_RELEASE.md)** for the full release details and the next **Paper 12** instructions (`HM12-001`–`HM12-100`, `HM-2026-P12`). Keep GitHub `main` authoritative, avoid destructive edits, and do **not** initiate a manual Vercel deployment under the existing quota restriction. Verify the actual production SHA and Android Chrome behavior separately.


## Most recent content — Headmaster/Headmistress Paper 10 (6 November 2026)

**Paper 10** (`HM-2026-P10`) is completed in GitHub source with 100 original free-practice MCQs `HM10-001`–`HM10-100`, each with four answer choices, correct response and explanation. The teaching practice library now includes **10 separate 100-question papers / 1,000 total public MCQs** for Headmaster/Headmistress and Senior Headmaster/Headmistress study tracks. The new paper has a **90-minute** independent attempt, saved result, question-only print view and post-submission answer explanations plus printable answer key. Papers 1–9 and prior marks are preserved. Public PWA cache version: `lama-ppsc-preview-v65`.

**Supabase verified:** 100 new Paper 10 rows inserted privately into `ppsc_question_bank` with `review_status='draft'`, bringing the teaching editorial bank to **930 unique question stems / 930 drafts**, with zero independently human-approved items. Automated QA tested structure, answer rotation, originality against the prior 830 private stems plus public Paper 1, print/answer review, job-wise paper selection and old-paper compatibility. GitHub Actions passed. These questions are original LAMA practice, **not officially issued PPSC questions or independently academically approved**. Public free-paper JavaScript exposes the answer keys; the post-submission UI does not offer premium exam security.

Read **[PAPER_10_RELEASE.md](./PAPER_10_RELEASE.md)** before the next `Continue`. The next phase is Paper 11 with **100 new questions `HM11-001`–`HM11-100`**, separate paper `HM-2026-P11`, preservation of old paper results, fresh private draft imports, QA, CI and MD updates. Maintain the **GitHub-only / no manual Vercel deployment** restriction and independently verify live production and Android browser behavior before describing any new paper as live.


## Latest school-head practice — Paper 9 (6 November 2026)

**Paper 9** (`HM-2026-P09`) adds **100 original free-practice MCQs** (`HM09-001`–`HM09-100`) across governance, instructional practice, assessment, math/research, English, ICT and science. The Academy GitHub source now registers **nine separate 100-question Headmaster/Headmistress papers / 900 public MCQ positions**; Papers 1–8, attempts, candidate marks and separate job assignments are preserved. Paper 9 has a 90-minute timer, distinct saved attempt, post-submission explanations/printable answer key, and question-only printing. The public PWA cache is `lama-ppsc-preview-v64`.

**Supabase verified:** 100 new Paper 9 `draft` records added without overwriting existing entries. The private editorial teaching bank now contains **830 records / 830 distinct normalized stems**, including 30 older unpublished editorial drafts. **All 830 remain pending human academic approval**; no official PPSC endorsement or case-specific syllabus validation is asserted. Automated checks compared all 100 new stems with the earlier 730 private items plus public Paper 1 and flagged no remaining strong token-overlap matches after corrections. Free public JS contains the answer keys; post-submission answer review is not secure premium/proctored access control.

**Read [PAPER_09_RELEASE.md](./PAPER_09_RELEASE.md)** before the next `Continue`. Next: **Paper 10** `HM10-001`–`HM10-100` as a separate `HM-2026-P10`, with fresh questions, private drafts, tests and docs. Continue committing to GitHub `main` only; under the standing quota restriction do **not** initiate manual Vercel deployment. Independently inspect actual production commit and mobile browser behavior.


## Latest Headmaster/Headmistress practice batch — Paper 8 (6 November 2026)

**Paper 8 completed in GitHub source:** `HM-2026-P08`, questions `HM08-001`–`HM08-100`, with a separate 90-minute exam, candidate answer/explanation review after submission, printable question-only paper and printable answer key. This raises the public school-head preparation library to **8 independent free practice papers / 800 MCQ positions** while preserving Papers 1–7 and their saved attempts.

**Supabase private editorial bank verified:** 100 new records added with `review_status='draft'` to the school-head `teaching` collection, now **730 unique private question stems / 730 draft records** and **0 independently human-approved**. The new questions were compared to 630 older private stems and Paper 1; two overlapping English questions were replaced, and structural, duplicate-screening, answer-key, job-specific and PWA tests passed in GitHub Actions. Public free JavaScript contains answer keys; the post-submission gating is for study usability, **not premium/proctored security**. Do not claim official PPSC syllabus endorsement or completed academic review.

Read **[PAPER_08_RELEASE.md](./PAPER_08_RELEASE.md)** for the full release verification and the next **Paper 9** plan (`HM09-001`–`HM09-100`). Follow the existing **GitHub-only / no manual Vercel deployment** rule and independently verify actual live production and mobile browser behavior.


## Paper 7 completed — verified 6 November 2026

**Headmaster/Headmistress Paper 7** (`HM-2026-P07`) is registered in GitHub `main`: 100 original MCQs (`HM07-001`–`HM07-100`) with an independent 90-minute exam, saved attempt, candidate score and post-submission explanation/printable answer key. **Seven complete school-head papers / 700 free-practice questions** now exist in the public source, and Papers 1–6 plus existing candidate records are preserved.

**Supabase verified:** 100 new Paper 7 items inserted as authorized private editable **draft** rows, bringing the `teaching` question bank to **630 distinct normalized stems (630 records)**. Previously imported 530 private drafts remain. The new batch was compared with the 530 older private stems plus Paper 1; three questions that overlapped earlier topics/scenarios were materially rewritten before final QA. GitHub Actions Paper 7 and regression checks passed; the answer-key review remains an **interface-only gate** because free JavaScript contains the correct answers. **All 630 private rows still need independent academic review**, and none should be presented as official PPSC material.

Read **[PAPER_07_RELEASE.md](./PAPER_07_RELEASE.md)** for the verified release details and the **next Paper 8** workflow (new IDs `HM08-001`–`HM08-100`). Continue commits only to GitHub under the no-manual-Vercel-deployment constraint, and verify the production commit and Android browser testing separately.


## Latest academy practice set — Paper 7 (6 November 2026)

The new **Headmaster / Headmistress Paper 7** (`HM-2026-P07`, `HM07-001`–`HM07-100`) has been added to the public free-practice registry, bringing the school-head preparation library to **seven separate 100-question papers / 700 questions**. Both Headmaster and Senior Headmaster variants select the same `teaching` question library; **other jobs still have no dedicated exam** until their own papers are written and reviewed. Earlier paper records and local attempt keys remain separate.

Paper 7 includes an independent 90-minute attempt, score, print-ready question sheet and post-submission answer key. The PWA offline assets have been bumped to **v62**. Automated source checks for structure, answer distribution, duplicates against the earlier public questions and available private fingerprints found no obvious collisions; however, **independent academic review, full private-bank semantic comparison, GitHub Actions success and deployed Android Chrome testing are not yet confirmed**. These are **original educational-practice questions**, not an officially verified PPSC syllabus or past paper.

Developer release notes: [Paper 7 release and QA boundaries](./PAPER_07_RELEASE.md). The question files are `papers/headmaster-07-part1.js` through `part4.js`; registration is `papers/headmaster-07-register.js`. The workflow runs `test-headmaster-paper7.cjs` alongside the existing checks. **Do not deploy or enable subscriptions without explicit user approval.**


## Latest Academy question bank — Paper 6 (6 November 2026)

**Paper 6 is complete in GitHub source:** `HM-2026-P06`, original MCQs `HM06-001`–`HM06-100`, across teaching, school leadership, educational research, English, ICT and science. It has a **separate 90-minute attempt**, marks, post-submission explanation/answer key and printable PDF review. The earlier five papers remain available with their original history: **6 free Headmaster/Headmistress practice papers / 600 questions**.

**Supabase:** Added 100 private `draft` records; the separate school-head editorial question bank now contains **530 unique normalized stems** (all 530 pending human academic approval). Automated checks verified question uniqueness, options, rationales and paper-link/answer-review logic. The source also uses PWA cache `v61`; tests and GitHub CI passed. **Do not claim official PPSC syllabus endorsement or independently reviewed questions.** Free client JavaScript includes keys and cannot protect premium exams.

The new handoff is **[PAPER_06_RELEASE.md](./PAPER_06_RELEASE.md)**. When the owner says **Continue**, next prepare Paper 7 with **100 additional non-repeating items `HM07-001`–`HM07-100`**, separate ID `HM-2026-P07`, keep old papers and candidate records, insert new private drafts, update CI/PWA/docs. Follow GitHub-only policy: **do not manually deploy to Vercel** under current project constraints. A CI pass is not proof that the latest commit is live or mobile-tested.


## Most recent Headmaster/Headmistress bank — Paper 5 (6 November 2026)

**Paper 5** (`HM-2026-P05`) is now authored and committed as **100 more original free-practice MCQs** (`HM05-001` through `HM05-100`). The academy source now contains **five separate free school-head papers, 500 total practice questions**. The new paper retains its own 90-minute state, separate saved attempts and scores, and post-submission correct answers, explanations, and Print / Save PDF review. Papers 1–4 and all existing marks remain intact.

The new 100-question batch was also inserted into the RLS-protected Supabase `ppsc_question_bank` as academic editorial drafts. The **private Headmaster/Headmistress bank now contains 430 unique question stems**, **430 still needing human approval**. Automated tests found no exact or strong word-overlap duplicates against earlier papers/drafts, and the question/answer structures passed. These are original LAMA educational practice questions, **not officially issued PPSC questions**, not independently verified syllabus coverage, and not secure premium material. Answer keys inside free client scripts remain inspectable.

Read **[PAPER_05_RELEASE.md](./PAPER_05_RELEASE.md)** for the complete changes, quality checks and next `Continue` instructions. The next Paper 6 batch is reserved as `HM06-001`–`HM06-100`, with paper ID `HM-2026-P06`. Keep GitHub `main` authoritative, verify actual Supabase status before inserting, preserve past candidate data, and update the exam/print/review/PWA/test/documentation files. **GitHub commits and checks are not proof that Vercel has deployed the new code**; do not manually deploy under the existing quota restriction.


## Latest content release — Paper 4 (6 November 2026)

**Headmaster / Headmistress Paper 4** (`HM-2026-P04`) adds **100 unique original free-practice MCQs** (`HM04-001` through `HM04-100`), complete with four choices, answer keys, explanations, difficulty and subject tags. Source registration, selected-job card, 90-minute attempt, independent saved score, question-only printing and post-submission answer-review/PDF printing are integrated. **Four school-head free practice papers / 400 public MCQ slots** now exist in GitHub source; previous papers and attempts are preserved.

**Supabase private draft bank** now has **330 unique school-head question records** (30 original drafts + 100 from each Paper 2, Paper 3 and Paper 4). All 330 remain drafts pending independent human academic review. SQL and GitHub automated checks passed; this is not a verified official PPSC paper or secure premium examination. Public practice answer keys are client-inspectable; the post-submission interface gate only guides practice.

**Read `PAPER_04_RELEASE.md` before the next `Continue`.** Next Paper 5 should add 100 original questions with IDs `HM05-001`–`HM05-100`, compare against every previous source and Supabase draft, retain all candidate data, update tests and PWA cache, and commit to GitHub `main`. Source commits and Supabase storage are **not proof of live Vercel deployment** or mobile-browser testing. No manual deployment is authorized.


**Private-bank usability fix:** With 230 stored records, the Super Admin editor formerly loaded only the newest 200. `auth-supabase.js` now requests successive RLS-protected pages of 250, retaining all authorized rows up to 5,000 (and reporting an error instead of silently truncating beyond that limit). The editor's search, review and explicit private JSON export can therefore reach earlier items. Private answer-key export requires user confirmation. For larger banks, replace whole-bank loading with server-side search and cursor pagination.


## Paper 3 completed — 6 November 2026 (newest academy question-bank status)

**Headmaster / Headmistress Paper 3** (`HM-2026-P03`) now contains **100 new original free-practice questions** (HM03-001–HM03-100), a separate 90-minute exam state, post-submission marks, per-question answer/explanation review and printable answer key. Papers 1 and 2 remain intact: **3 free school-head papers / 300 public practice questions** in the GitHub source.

The 100 additional questions are also saved as private **Supabase editorial drafts** under the `teaching` job. The private bank contains **230 unique question stems**, with **0 independently human-approved** items. Do not represent automated QA as academic approval or the papers as an official PPSC syllabus. Public free JavaScript contains the keys, so post-submission hiding is a user-experience gate and is not a secure premium exam design.

GitHub CI now tests Paper 3's item counts, answer positions, source originality, question-only printing, answer-key unlock, job links and PWA loading; all older exam records and school modules are preserved. Read [PAPER_03_RELEASE.md](./PAPER_03_RELEASE.md) first for the next `Continue` (Paper 4, IDs HM04-001–HM04-100). Latest source commits and automated testing do not, by themselves, establish whether the current live Vercel build or mobile Chrome has been updated.


## Latest verified Paper 2 development — 6 November 2026

A **second original Headmaster / Headmistress free practice paper (HM-2026-P02)** has now been authored with **100 new MCQs** (HM02-001 to HM02-100), 90-minute timer, post-submission answer key, explanations, and print-to-PDF via the browser. Both school-head preparation options display Paper 1 and Paper 2. Existing Paper 1, local scores and other academy modules are retained.

**Private Supabase bank:** the 100 additional questions were inserted as draft records in ppsc_question_bank, alongside the earlier 30 private drafts (**130 total, 130 unreviewed drafts, 0 human approved**). A free practice copy uses automated structural and duplicate checks and **must not be described as independently academically approved or official PPSC questions**.

**Non-repetition:** 100 new unique stems and IDs. Checks compare against Paper 1's 100 stems, 30 pre-existing private-stem fingerprints, and the new 100 internal pairs. Automatic answer-position rotation preserves the correct response. The paper's source contains answer keys because it is free practice; candidate UI displays them only after submitting. **Premium/private exams still require server-side answer security.**

**Files:** papers/headmaster-02-part1.js through part4.js, papers/headmaster-02-register.js, answer-key.html, index.html, print.html, paper-library.js, engine.js, sw.js, expanded validators and GitHub Actions. Read **PAPER_02_RELEASE.md** first before working on the next 100-question batch; next Paper 3 IDs are HM03-001 to HM03-100. Do not overwrite older papers or score records.

**Release distinction:** GitHub commits and automated CI do not prove that a latest Vercel production build is live or mobile-tested. No manual Vercel deployment was requested in this batch. Confirm actual production commit before sending candidates to the new paper.


## Final integration checks — 6 November 2026

- **Admin identity:** The previously designated academy owner email was matched to the connected Gmail account and to its existing Supabase Auth UID, then provisioned with `super_admin` in `ppsc_admin_members`. The Gmail confirmation message was confirmed delivered, but **the owner has not yet clicked the confirmation link** and the Auth account remains unconfirmed. Admin sign-in is blocked until the user completes that step.
- **Public job test:** the actual Headmaster/Headmistress preparation track is published as a managed Supabase job, status **unverified** (not an open vacancy). Using database transactions that were rolled back, an authenticated Super Admin role successfully inserted a test draft job; an ordinary candidate role was rejected by RLS. No test job remains.
- **Candidate verification:** private status mirror has two registrations, one confirmed and one pending; one candidate profile was created for the confirmed account. `admin-registrations.js` displays read-only status. Signup now requests an academy `confirm.html` redirect and includes a **Resend confirmation email** option. Configure the Supabase redirect allow-list and custom SMTP before unrestricted release. The observed email was sent by **Supabase Auth**, not an academy-branded sender.
- **Private MCQs:** 30 new Headmaster/Headmistress drafts across 11 subjects. Correct options were distributed across A–D (7 / 8 / 9 / 6) with answer-text preservation checked. They are private and not a second published 100-MCQ exam. The private Super Admin editor supports draft/review, JSON batch imports of up to 100 and local export of the last loaded 200.
- **PWA:** `admin.webmanifest`, `admin-install.js` and the secure login page provide a private admin installation path; the service worker caches only public academy shell assets, never private candidate or question bank API responses. **Android install and live mobile UX remain unverified.**
- **Tests:** Supabase role simulations, public visibility checks, answer-key rotation QA and GitHub Actions regression tests passed. Actual candidate browser signup, email-confirmation click, Super Admin UI sign-in, SMTP branding and live website deploy still have user/external dependencies. Do not claim these gates completed.
- **Deployment:** Vercel's latest inspected READY production deployment referenced an earlier GitHub commit, not all of the changes above. No manual deployment was triggered because of the earlier build-limit constraint. Update `main` and verify the live domain after deployment resumes.


## Verified implementation status — 6 November 2026 (latest)

**Super Admin:** One academy Auth account associated with the designated owner mailbox was independently matched to the connected Gmail account and provisioned in the protected `ppsc_admin_members` registry. The account is **not yet email-confirmed** and cannot sign in until its 6 November Supabase confirmation email is opened and confirmed. No Auth confirmation was bypassed. Another existing candidate account is confirmed.

**Candidate verification:** Supabase Auth sent a confirmation email to the owner's Gmail inbox, with a **Supabase Auth sender**. SMTP branding as LAMA PPSC Academy is **not** activated. A private `ppsc_candidate_registrations` status mirror and Auth trigger now track real confirmations and create valid candidate profiles after verification. At last check: **2 registrations / 1 confirmed / 1 candidate profile / 1 authorized Super Admin**. No arbitrary candidate email was marked confirmed.

**Real job record:** The priority Headmaster/Headmistress education preparation entry (`teaching`) exists as a **published Supabase-managed job** with six suggested subjects and vacancy status `unverified`. It is not an official open PPSC application. RLS role simulations confirmed public visibility, authorized administrator editing, and normal candidate editing denial.

**Private question bank:** `ppsc_question_bank` contains **30 new original draft MCQs across 11 subjects**, IDs EDU-HM-101–130. All are private, unpublished and awaiting academic review. Question-key rotation preserved every correct answer. Super Admin form, JSON bulk import/export and a read-only verification list are committed, with no public answer-key exposure. See [QUESTION_BANK_WORKFLOW.md](./QUESTION_BANK_WORKFLOW.md), [ADMIN_JOB_MANAGEMENT.md](./ADMIN_JOB_MANAGEMENT.md), and [backend/EMAIL_SETUP.md](backend/EMAIL_SETUP.md).

**Deployment:** Changes are in GitHub `main`. Connected Vercel reported a READY production build from an earlier commit, but **the newest Admin and question editor code has not been verified on the live domain**. No additional manual Vercel deployment was initiated. Automated GitHub tests cover source integrity, not live Chrome/PWA sign-in, SMTP configuration, or paid membership.

**Next release gates:** candidate must click email confirmation, current build must deploy, real browser sign-in and create/edit tests must run, and SMTP domain/sender must be verified before unrestricted public registration. Premium payment and private server-side exams remain disabled.


## Current release note — 6 November 2026

**The dedicated Supabase project is active and the frontend has an enabled publishable-key configuration; old preview text below is historical where it states registration or backend do not exist.** The database currently has 2 Auth users (1 confirmed email), but 0 candidate profiles and 0 provisioned Super Admin accounts. Signup email delivery, branded sender and full mobile confirmation have **not** been verified. Candidate profiles are created after verified sign-in; payment and premium entitlement are still inactive.

The private **Super Admin Job Manager** has an RLS-protected Supabase job table and a source-code UI. Published admin jobs load automatically into dashboard/job dropdowns, planner, syllabus and paper library after the updated website is deployed. **No account can manage jobs until independently provisioned as Super Admin.** See [ADMIN_JOB_MANAGEMENT.md](./ADMIN_JOB_MANAGEMENT.md) and [backend/EMAIL_SETUP.md](./backend/EMAIL_SETUP.md). The existing School Suite is unchanged.


Status: **working public practice preview; NOT ready for paid memberships**.
This module belongs to the LAMA Studio website, not the School Suite. Keep school data, user roles, payment records, and subscriptions separate.

## First release scope

Priority: Headmaster / Headmistress BS-17 and Senior Headmaster / Headmistress BS-18 educational administration preparation. Other PPSC posts appear as future preparation tracks; they are **not** currently supplied with full question banks. The job catalog references historical results, not currently open vacancies.

## Implemented

- Mobile-first academy entry, separate job cards and per-job preparation roadmaps.
- Teaching administration free paper with 100 MCQs, 90-minute timer, explicit start and submit, countdown pinned to the page, answer persistence on this browser, unanswered-question navigation, and automatic submission at timeout.
- Correct-answer explanations, question-option rotation and migration of earlier saved answer indices.
- Per-attempt local scores, weak-subject breakdown, recent score trend, suggested five-day revision plan, CSV export and confirmed local-history deletion.
- Print layout, basic study planner, and offline PWA shell. Offline installation and cross-browser behavior still require device testing.
- Automated GitHub Actions checks for JavaScript syntax, navigation IDs, and paper structure; see `validate-papers.cjs`, `check-links.cjs`, and `check-exam-contract.cjs`.

## Not implemented — must not be advertised as active

- Candidate signup, verified email/password login, password reset, and persistent user identity. The visible registration form is **disabled** until a secure backend is configured.
- Cloud score history and cross-device synchronization.
- Payment screenshot/transaction reference submission, payment reconciliation, manual Super Admin approval, and subscription activation.
- Premium access authorization and 500 validated 100-MCQ papers. The 500-paper figure is a **target**, not current content.
- Official syllabus verification for each recruitment case; current study topics are educational guidance, not confirmed case weightings.

## Proposed paid access policy

PKR 1,000 per verified candidate for 12 months, academy-wide access to all published job-specific tracks during the active period. This is a planned policy, not a currently purchasable product.

## Backend groundwork (not deployed)

A provider-neutral, isolated PostgreSQL draft is available at [`backend/schema.sql`](./backend/schema.sql), with the proposed API and security rules at [`backend/README.md`](./backend/README.md). These are **design files only**. No database was created, no candidate registration was activated, and no payments can be accepted.

## Secure backend acceptance requirements

1. Choose the academy's authentication and storage service and configure secrets outside the public GitHub repository.
2. Server verifies email ownership; passwords must be processed by the authentication provider, never stored in localStorage, Google Sheets or public code.
3. Server checks every protected request for user identity, role, and active subscription. Hiding buttons is **not** access control.
4. Payment submission creates a pending record with transaction reference, claimed amount, optional private evidence upload and audit timestamps. Do not grant access from a screenshot alone.
5. Super Admin approves only after independent transaction reconciliation. Approval must be idempotent and recorded in an audit log.
6. Start and expiry times are server-generated; expiration is enforced server-side for premium papers.
7. Scores and answers are associated with the authenticated candidate; provide access control, export/deletion rules, and backup/restore procedures.
8. Verify question provenance, originality, difficulty, non-repetition, and official PPSC case-specific syllabus before premium publication.
9. Run integration tests for authentication, payment review, unauthorized access, expired membership, data recovery, and mobile PWA behavior.
10. Obtain explicit approval before deploying new changes to Vercel. GitHub commits do not themselves prove production publication.

## Developer checks

```bash
node education-academy/validate-papers.cjs
node education-academy/check-links.cjs
node education-academy/check-exam-contract.cjs
for f in education-academy/*.js education-academy/*.cjs; do node --check "$f"; done
```

These checks detect structural issues but **do not establish academic accuracy or production security**.

## Job-wise paper library (6 November 2026)

- `jobs.js` is the single public preparation-job catalog; the Papers & Examinations job dropdown is derived from it (including the two school-head post variants).
- `paper-library.js` discovers only explicitly public, full-length free papers. The legacy `DEMO-01` educational foundation set remains available for teaching administration. To publish another free paper, add an academically reviewed 100-item object to `LAMA_PPSC_PAPERS` with `jobIds: ["job-id"]`, `access: "free"`, `publishStatus: "public"`, and `reviewStatus: "approved"`. Its questions require unique IDs, clear answers and substantive explanations. Run the paper validation and editorial review before publishing.
- Other jobs display syllabus and planning links with an honest unpublished status; no teaching paper is mislabelled for another profession. Only public papers are shipped to visitors; do not put premium answer keys in public JS files.
- Paper states come from existing local `lama_ppsc_attempt_<paperId>` and `lama_ppsc_history_v1` records. Saved scores, in-progress timers and previous answers are not overwritten by the new library. Backups remain available under My Scores.
- Job track availability does **not** mean the PPSC vacancy is open or the case-specific syllabus is verified. User data is browser-local unless the configured and authenticated cloud attempt API separately reports a successful save.
- The 500-paper figure is a roadmap, not a published paper count. Subscription activation and secure entitlement checks must be completed server-side before paid content is released.


## Launch readiness and mobile polish — 8 November 2026

The candidate academy has been updated with the approved PPSC green/gold logo, `academy-polish.css` (responsive mobile touch targets, compact secondary headers, keyboard focus, reduced-motion), `help.html`, `privacy.html`, `terms.html`, a support/footer section, descriptive route titles and active-menu semantics. The public PWA cache now uses **v74** to include all new public pages and styles. The release-check `test-launch-polish.cjs` was added to `.github/workflows/ppsc-academy-checks.yml`.

**Go/no-go decision: NO-GO for commercial paid launch.** Supabase project is active and 7/7 academy tables have RLS enabled, but there were no active subscription records and payment entitlements/approval remain unimplemented for public use. Security Advisor warned that leaked-password protection is disabled. Account confirmation, reset flows, Android Chrome layout, offline/PWA update, printed PDFs and a full end-to-end exam attempt are still not independently verified, nor has the educational bank completed independent academic review. Only the school-head job family has 15 dedicated published 100-question practice papers; other catalog jobs must not advertise exams until published. No direct Vercel deploy action was initiated, though `main` Git commits may trigger Git-integrated deployments.

Full release checklist: [LAUNCH_READINESS_2026-11-08.md](./LAUNCH_READINESS_2026-11-08.md). Preserve previous questions, candidate attempts and backend data. Do not activate billing or premium examination access before owner approval, trusted server-side entitlement checks and reviewed business/legal policy.
