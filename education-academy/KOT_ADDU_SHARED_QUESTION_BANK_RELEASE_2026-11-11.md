# LAMA PPSC — Kot Addu Jobs & Reusable Question Bank
**Prepared 11 November 2026.** Source integration only; no new Vercel deployment was initiated.

## Screenshot intake
Six user-supplied PPSC-domain screenshots contained one already registered Junior Clerk Bahawalpur case (28J2026) and five **new**, separately registered tracks:

| Job | Office | Posts | Case visible | Assessment |
|---|---|---:|---|---|
| Junior Clerk BS-11 | DC Office, Kot Addu (BOR) | 10 (2 women-reserved) | Not legible | 100 MCQs / 90 min / approx. 80% General Ability + 20% MS Office; separate typing/proficiency |
| Stenographer BS-15 | DC Office, Kot Addu (BOR) | 2 | Not legible | English shorthand 70 WPM, English typing 35 WPM; subsequent Urdu shorthand 60 WPM + Urdu typing 25 WPM |
| Junior Clerk BS-11 | ADC (Revenue), Kot Addu (BOR) | 2 | 32J2026 | 100 MCQs / 90 min / approx. 80/20; typing/proficiency selection 1:20 |
| Stenographer BS-15 | ADC Office, Kot Addu (BOR) | 1 | Not legible | English shorthand 70 WPM and English typing 35 WPM; Urdu shorthand 60 WPM and Urdu typing 25 WPM specified for preference |
| Junior Computer Operator BS-12 | ADC Office, Kot Addu (BOR) | 2 | 34J2026 | 100 MCQs / 90 min / 100% MS Office & I.T.; separate typing/proficiency 1:20 |

Source: PPSC_KOT_ADDU_ADDITIONAL_SYLLABI_2026.json. Original PPSC PDFs and current vacancies have not been independently authenticated. Supabase marks all five positions with vacancy_status=unverified; published means preparation-track metadata, not an application opportunity.

## Reusable practice bank
The new shared-paper-bank.js composes original practice questions from the academy's already-authored source papers, without inserting or re-authoring duplicate questions in the protected database.

- Source Junior Clerk pool: 200 distinct questions: 160 General Ability and 40 MS Office/Computer Skills from existing Bahawalpur and Faisalabad papers.
- New DC Kot Addu Junior Clerk: JCKDC-2026-P01 and JCKDC-2026-P02, each 80 General Ability / 20 MS Office, with no source MCQ repeated between the two papers in that job.
- New ADC Revenue Kot Addu Junior Clerk: JCKADC-2026-P01 and JCKADC-2026-P02, following the same policy but independently seeded. Different jobs intentionally share original questions where the syllabus matches.
- New ADC Junior Computer Operator: JCOP-2026-P01, 100 MS Office/IT-related questions reused from the compatible existing public source bank (Office, Assistant Basic Computer, Secretary A Basic Computer, demo Computer and selected school-head ICT/IT questions). Subject-specific academic review remains required.
- Every derived paper is 90 minutes, has 100 distinct source questions, unique job-specific question IDs, original sourceQuestionId provenance, deterministic shuffle of question and option order, and separate saved attempts and scores.
- Papers with reused material must not be counted as 100 newly authored questions. The client is not a secured premium question service; answer keys are accessible.

**Inventory:** 28 original source papers / 2,800 original paper positions, plus five shared-bank **derived** papers / 500 reused positions, making 33 selectable papers / 3,300 paper positions, **zero newly written questions** in this task. The protected Supabase editorial bank remains at 2,630 private records, with no copied new question rows.

## Stenographer skills
The mobile-friendly stenography.html supports English/Urdu typing practice, a timer, estimated speed/accuracy, and a shorthand stopwatch for manually dictated and reviewed passages. It cannot grade handwritten shorthand accurately or issue official proficiency decisions. The DC and ADC tracks remain separate practical-assessment jobs, with the ADC Urdu preference wording preserved. The academy job cards link to the skills trainer rather than misleading candidates with a 100-MCQ examination.

## Integration & verification
- New: PPSC_KOT_ADDU_ADDITIONAL_SYLLABI_2026.json, shared-paper-bank.js, stenography.html, test-kot-addu-shared-bank.cjs.
- Updated: jobs.js, paper-library.js, library-ui.js, shell.js, index.html, print.html, answer-key.html, sw.js (offline cache v92), and the academy GitHub CI workflow.
- All five job records inserted into the existing RLS-enabled public.ppsc_job_catalog with is_published=true and vacancy_status=unverified, preserving owner and access policies. Current database: 17 public job tracks, including these five.
- **GitHub PPSC Academy Quality Checks run 43061087101: SUCCESS.** Tests cover all earlier 28 original papers, newly derived paper variants, source IDs, answer rotations, 80/20 and 100% IT allocation, and practical-job identity.
- Source is **not yet verified live** on lamastudio.pk or a real mobile PWA; no Vercel deployment was initiated. Subject-expert and current affairs review, PPSC PDF confirmation, device printing tests and non-Muslim General Knowledge alternative forms remain outstanding.

## Next
Expand shared original topic pools only where new independent question coverage is needed. For Junior Clerk and Junior Computer Operator, implement a distinct typing/proficiency trainer after verifying any exact official typing speed; do not invent a required WPM.
