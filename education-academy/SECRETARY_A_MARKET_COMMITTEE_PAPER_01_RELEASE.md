# Secretary 'A' Class Market Committee (BS-17) — Paper 01

**Prepared:** 11 November 2026  
**Academy:** LAMA PPSC Preparation Academy (lamastudio.pk)  
**Source status:** GitHub repository integrated; production website/PWA deployment not separately verified.

## Recruitment evidence and corrected identity

- PPSC Advertisement No. **08/2026**, PAMRA / Food Safety & Consumer Protection Department.
- Correct post: **Secretary 'A' Class Market Committee (BS-17)** — 9 advertised posts.
- Advertisement case reference: **47-RJ/2026** (in advertisement reproductions); official PPSC job description filenames also use \`47J2026\`.
- Previous project screenshot transcription incorrectly labeled Secretary A as **BS-16**. The job catalog, screenshot-derived manifest and private database metadata have been reconciled to BS-17; **Secretary 'B' remains BS-16**, 15 advertised posts, case reference **46-RJ/2026**.
- Historical job posts are not evidence of **currently open** vacancies. Both catalog entries remain marked \`vacancy_status='unverified'\`.
- Source references (secondary reproductions of PPSC Advertisement 08/2026, not the authoritative original PDF):
  - https://jobs92.pk/job/ppsc-advertisement-no-08-2026-administrative-medical-and-technical-vacancies-in-punjab-government-departments
  - https://www.mcq-ai.com/posts/ppsc/secretary-a-class-market-committee
  - https://www.taleemguide.com/jobs/ppsc-secretary-a-class-market-committee-47j2026-2026
  - PPSC job description filename as linked by index: https://www.ppsc.gop.pk/Misc_Uploading/JD47J2026_26082112545.pdf
- Original official PDF could not be fetched for independent inspection. Eligibility, detailed syllabus and recruitment status should be checked on the official PPSC site before publishing admissions promises.

## Practice paper outline

- **Paper ID:** \`SAC-PAMRA-2026-P01\`
- **Job ID:** \`secretary-a-market-pamra\`
- **Question IDs:** \`SAC01-001\`–\`SAC01-100\`
- **100 original AI-assisted practice MCQs, 100 marks, 90 minutes.**
- **First 60 questions:** Qualification-related (60%). Original academy topic selection grounded in the relevant qualifying degrees — Agricultural Economics, Marketing & Agribusiness, Agribusiness Finance, Supply Chain, Research Methods and market institutions.
- **Final 40 questions:** General Ability (40%). Editorial distribution: General Knowledge 4, Pakistan Studies 4, Current Affairs 4, Geography 4, Everyday Science 5, Basic Mathematics 5, English 5, Urdu 4, Basic Computer Studies 5.
- The **approximate 60/40 ratio** is based on the advertised syllabus. The detailed allocation among these practice topics is **not an official PPSC weighting** and must not be advertised as such.
- Subject matter requires independent academic and fact checking; this is **not an official PPSC past paper** or an expert-approved bank.

## GitHub implementation

Four 25-question source files:
- \`papers/secretary-a-market-01-part1.js\`
- \`papers/secretary-a-market-01-part2.js\`
- \`papers/secretary-a-market-01-part3.js\`
- \`papers/secretary-a-market-01-part4.js\`

Registrar: \`papers/secretary-a-market-01-register.js\`.
The registrar verifies batch counts, unique IDs, distinct normalized stems and topics, four options, explanation length, 60/40 allocation, and a separate twenty-paper per-job limit. Answer options are rotated deterministically.

Exam and offline wiring:
- \`index.html\`, \`print.html\`, \`answer-key.html\`, \`sw.js\` and \`jobs.js\` updated.
- Printable question-only A4 two-column exam uses existing print layout; answer explanations appear in submitted attempt review.
- Offline shell includes the new scripts with a bumped PWA cache. PWA caching does not secure answer keys.
- \`validate-papers.cjs\` and \`test-uploaded-syllabi.cjs\` updated; older Assistant regression tests updated to reflect the expanded inventory and changing cache version.
- New \`test-secretary-a-market-paper1.cjs\` run in \`.github/workflows/ppsc-academy-checks.yml\`.
- **Verified successful** GitHub Actions PPSC Academy Quality Checks run **43056136345** (commit \`da2c305465290c7f75cd55ea56844186f092822d\`), including prior Assistant regressions, 60/40 paper test, uploaded syllabus checks and whole question bank validation.

## Total inventory after this integration

- **28 source practice papers / 2,800 practice question positions**:
  - 20 school-head papers;
  - 3 Information Officer;
  - 1 Junior Clerk Bahawalpur;
  - 1 Junior Clerk Faisalabad;
  - 1 Assistant Kot Addu;
  - 1 Assistant Faisalabad;
  - 1 Secretary 'A' Market Committee.
- **Supabase protected editor bank: 2,630 records**; specifically 100 \`SAC01-001\`–\`SAC01-100\` private Secretary A **draft** records.
- Database query confirmed 100 unique IDs, 60 specialist and 40 general items, 10 distinct registered subjects, **zero academically approved Secretary A items**.
- Existing RLS roles, candidate identities, subscriptions and previous editorial questions have not been changed by this question addition. No premium answer keys have been exposed through a new API.

## Outstanding

1. Independent subject-matter and official original-PDF syllabus review (including Urdu and current affairs).
2. Verify live domain/PWA cache refresh, mobile tests and real A4 print result. GitHub source integration alone is **not** confirmation of a live production release.
3. Do not advertise browser-side free practice as a tamper-resistant paid or proctored examination.
4. Next: Secretary **'B' Class Market Committee (BS-16)** — prepare its own **distinct** 60/40 question bank and IDs \`SBC01-001\` onwards; never reuse Secretary A's practice content without review.
