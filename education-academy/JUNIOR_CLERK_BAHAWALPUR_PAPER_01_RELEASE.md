# Junior Clerk (BS-11) — Bahawalpur Division, Paper 01

**LAMA PPSC Preparation Academy · 9 November 2026**

**Candidate paper:** `JCB-BAHAWALPUR-2026-P01`  
**Job family:** `junior-clerk-bahawalpur-bor`  
**Question IDs:** `JCB01-001`–`JCB01-100`  
**Syllabus evidence:** User-provided PPSC written-test syllabus screenshot; recruitment case transcribed as **28J2026** and subject to confirmation against the original PPSC PDF. **These are original AI-assisted practice questions, not official PPSC questions or expert-reviewed examination content.**

## Published source implementation

- **100 multiple-choice questions / 100 marks / 90 minutes** under the job's separate public free-practice paper ID, with keyed answers, detailed explanations, rotating answer positions, attempt and score isolation, and a 20-paper-per-job ceiling.
- **Q001–080 (80% General Ability)**: General Knowledge (10), Pakistan Studies (10), Current Affairs and international institutions (10), Islamic Studies (8), Geography (7), Basic Mathematics (10), English (10), Urdu (8), Everyday Science (7).
- **Q081–100 (20% MS Office and Computer Skills)**: Word save, tracking revisions, mail merge, heading styles and page breaks; Excel formulas, SUM, absolute references, COUNT, sort, filter, freeze panes and workbook extension; PowerPoint Slide Master and slideshow; Access database primary key; operating-system folders, Undo, phishing avoidance and versioned backups.
- The screenshot specifies **General Knowledge for non-Muslim candidates in place of Islamic Studies**. This published practice set currently contains eight Islamic Studies questions and **does not yet provide the alternate General Knowledge version**. The practice paper's `candidateNote` records the distinction; an alternate candidate-friendly variant remains a launch task.
- English, Urdu and arithmetic practice questions are educational examples; independent subject review is still needed. The Current Affairs allocation includes stable international institutions and policy frameworks to avoid falsely presenting unverified breaking news as fact.
- Written-qualified candidates may proceed to separate typing/proficiency tests. **A typing or English proficiency simulator has not been represented as complete.** Exact recruitment and selection criteria must be checked against the original official notice.

## Source files, exam and validation

- Four blocks of 25 questions: `papers/junior-clerk-bahawalpur-01-part1.js` through `part4.js`, plus `papers/junior-clerk-bahawalpur-01-register.js` for independent paper registration.
- `index.html`, `print.html`, `answer-key.html` and `sw.js` include all five scripts, keeping exam selection, A4 printing, post-submission review and offline public-practice assets aligned.
- The PWA's published-shell cache was increased from `v85` to `v86`.
- `test-junior-clerk-bahawalpur-paper1.cjs` verifies all sequential IDs, answer options and correct-text preservation through deterministic rotation, subject 80/20 split, 90 minutes, duplicate protection, preserved 23 older papers and job-isolated 24th public source paper.
- The global `validate-papers.cjs` now handles Unicode Urdu stems and preserves significant technical symbols in Excel options (e.g. `$A$1` versus `A1`) during choice distinctness checks.
- The public library test verifies that the Bahawalpur paper cannot be opened as Faisalabad Junior Clerk or Assistant Kot Addu and that the Headmaster (20 papers) and Information Officer (3 papers) retain their paper quotas.
- Source test and CI checks passed at source-integration commit `7439e3b6a958282cc322e78f9d38999e65c7f26b`, GitHub Actions run `42621202612`. Later commits update the Job Catalog's `ready` indicator and the job-details navigation.

## Supabase private editorial bank

- **100** questions inserted with `job_id='junior-clerk-bahawalpur-bor'` and `review_status='draft'`; four batches of 25; `ON CONFLICT DO NOTHING`; no prior records overwritten.
- Post-write verification: 100 distinct question texts, 100 structurally valid answer arrays and indexes, 100 drafts, **zero expert-approved**.
- Previously saved private bank: **1,930 teaching** + **300 Information Officer** questions. All three families together: **2,330 draft editorial records**.
- Public practice scripts necessarily ship answer keys to the browser and therefore **must not be used as secure premium or proctored examination storage**. Separate server-side access controls remain required.

## Next priorities

1. Verify the custom production domain's READY deployment SHA includes this paper before announcing it is live. GitHub CI passing does not establish live release, and unnecessary manual Vercel deployments are discouraged due to quota limits.
2. Human-check facts and language, run Android/PWA exam selection, Start Examination, 90-minute timer, saved progress, submitted score, print output and answer key.
3. Add a **General Knowledge alternative** for non-Muslim candidates, without collecting or inferring sensitive religious information or corrupting saved attempt keys.
4. **Next `Continue`:** Junior Clerk **Faisalabad Paper 01**, following the separately supplied 80% General Ability / 20% MS Office screenshot. New job ID `junior-clerk-faisalabad-bor`, unique IDs, independent 20-paper cap, and separate later typing/proficiency process.
5. After Faisalabad, prioritize Assistant Kot Addu and Assistant Faisalabad General Ability papers, then PAMRA market secretaries and other verified-syllabus jobs. See [PPSC_UPLOADED_JOB_SYLLABI_PRIORITY_2026.md](./PPSC_UPLOADED_JOB_SYLLABI_PRIORITY_2026.md).

