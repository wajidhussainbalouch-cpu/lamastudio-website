# Junior Patrol Officer (BS-11) — PPSC Advertisement No. 13/2026

## Owner selection / intake policy

- **Source supplied:** PPSC Advertisement No. 13/2026, dated 22 November 2026, original session-based PDF URL provided by academy owner.
- Original official PDF could not be opened directly by the retrieval system. Details cross-referenced from independent reproductions published on and after 22 November 2026. Do not claim original-PDF verification.
- **Only selected post from this advertisement:** Junior Patrol Officer (BS-11), Punjab Ring Road Authority, Case **07-RK/2026**, **187 advertised vacancies**.
- Reported quota breakdown: 150 open merit + 28 women + 9 minorities = 187.
- Reported application closing date: **7 December 2026**; current vacancy status is held as **unverified** in academy database until direct official confirmation.
- The owner's **new policy: accept an individual post only when its own advertised vacancies are at least 10**, counting reserved seats within that post. Do not add vacancies from separate job titles/cases together. In Advertisement 13/2026, add **only Junior Patrol Officer** even if another job title has 10 or more seats.
- This policy governs **new selections**, not retroactive deletion of earlier completed academy job families or their candidates' preparation history. `ppsc-intake-policy.js` provides the reusable threshold-and-owner-scope helper; full future automatic advertisement import is not enabled.

## Preparation curriculum

- Written examination syllabus reported as **100% General Ability, 100 MCQs, 100 marks, 90 minutes**.
- Covered subjects: General Knowledge; Pakistan Studies; Current Affairs; Islamic Studies (general-knowledge alternative indicated for non-Muslim candidates); Geography; Basic Mathematics; English; Urdu; Everyday Science; Basic Computer Studies.
- Practice sample uses **10 questions per subject as an academy editorial balance**, not a PPSC-specified subject percentage.
- Separate advertised age, graduation, height, chest and eyesight requirements are important for eligibility but **must be verified with the original official PPSC advertisement**; passing academy papers is not a physical-standards or eligibility certification.

## Shared question bank implementation

- Job ID: `junior-patrol-officer-prra-2026` in `education-academy/jobs.js` and RLS-enabled `public.ppsc_job_catalog` (published as preparation, vacancy status unverified).
- Bank group: `general-ability-100`.
- Published sample variants: `JPO-2026-P01` and `JPO-2026-P02`, **100 MCQs each**, **90-minute** timed practice.
- The 200 question *positions* are **reused from the two original Assistant General Ability sources** `AKD-KOT-ADDU-2026-P01` and `AFSD-FAISALABAD-2026-P01`. **There are zero newly written source MCQs.**
- Each source is exactly 100 questions with ten topic areas. Two variants are partitioned with **no source-question overlap between JPO Paper 1 and Paper 2**, and each has 10 questions per subject.
- Deterministic question order and rotated answer options, stable job/paper IDs, `sourceQuestionId` provenance, separate attempt and score keys. Question reuse across different job families is intentional and disclosed.
- Generated practice is public-browser content, **not confidential premium question inventory**; independent academic review and additional GK alternative still pending.
- Source inventory remains **28 original practice papers / 2,800 original question positions**. Reused generated variants are **7 papers / 700 positions**, giving **35 selectable paper variants / 3,500 paper positions**, without growing private editorial source records.
- Existing five Kot Addu generated variants and all previous source papers are preserved. Stenographer remains practical skills training, not a fabricated 100-MCQ test.
- `education-academy/sw.js` cache version upgraded to v94 to refresh the public job and shared-paper scripts. Printing and answer review consume the shared bank via the existing `paper-library.js`.
- Added tests `test-ppsc-advert13-jpo.cjs`, updated `test-kot-addu-shared-bank.cjs`, and integrated CI check into `.github/workflows/ppsc-academy-checks.yml`.

## Evidence links (secondary, not the directly inspected original)

- https://docmcqs.com/jobs-portal/ppsc-jobs/punjab-public-service-commission-ppsc-advertisement-no-13-2026-225-posts-last-date-7-december-2026/
- https://asami.pk/jobs/ppsc-advertisement-13-2026-jobs-2026/
- https://propakistani.pk/2026/11/24/punjab-ring-road-authority-announces-junior-patrol-officer-jobs/

## Quality gates and follow-up

- Require GitHub Actions checks for both reusable-bank regressions and the new intake policy before calling code integration passed.
- Supabase database row insertion verified with 187 total, 10 subject categories and `is_published=true`.
- The connected Vercel project uses Git-triggered production builds; verify the latest deployed commit before claiming new features are live, and do not trigger an independent deployment without authorization.
- Current advertisement status is never inferred from an academy training card alone.
