# LAMA Examination System — Question Bank Project Handoff
Last updated: 2026-11-04 (primary source intake complete; pre-primary structure agreed; handoff repaired)
Status: Living project document. **Read this first in every new chat.**

## Mission and scope
Build a commercial, curriculum-grounded question bank for the LAMA Examination System, supporting school examinations, online quizzes and printable papers. **This chat/project is the question bank, NOT the separate LAMA Smart Marker project.** Preserve all existing school data and code. Do not deploy, publish, or change Vercel without explicit approval. Use the existing GitHub repository and verify commits.

## Repository and working practices
- GitHub: `wajidhussainbalouch-cpu/lamastudio-website`
- Primary branch: `main`
- Subject intake metadata: `examination-system/data/`
- This handoff file: `examination-system/QUESTION_BANK_HANDOFF.md`
- For each new textbook link: access via Google Drive connector; verify filename, class, subject, PDF page count and, where possible, chapter contents; check for existing registration before creating a duplicate; commit source metadata; merge to main and verify. Report truthful status.
- **Update this Markdown handoff in GitHub on every substantive question-bank turn**, especially after source registration, question generation, review, architecture decisions, and unresolved problems. Never claim automatic background updates between chats.
- Avoid destructive file replacement and preserve historical student, teacher, and examination data.

## Question-bank product vision
- 1,500 **original, non-repetitive** questions per class/subject target, subject to textbook scope and quality review.
- Question types as applicable: MCQ, fill in the blank, true/false, matching, short answer, numerical answers, word problems, comprehension, picture-based, and oral/teacher-reviewed.
- Question records should have: stable ID, class, subject, unit/chapter, lesson, source PDF page and printed page (when verified), question type, question text, answer key, optional distractors, explanation, difficulty, marks, marking mode, review state, and version.
- Generate from the **actual supplied edition**, verify factual and numerical answers, review Urdu/Arabic diacritics and spelling, avoid near-duplicates. Drafts are NOT approved/live questions.
- Oral Tajweed/pronunciation should be teacher reviewed, not auto-scored as correct.
- Support online testing and printable exam papers. Keep answer keys access-controlled (not public static JSON). Commercial premium question-bank licensing separate from Examination System subscription; Super Admin manages school entitlements, expiry and permissions. Retain school-owned history after expiry.
- PWA first, Android later; no deployments without approval.

## Source register (as of 2026-11-04)
Targets are NOT completed question counts.

| Class | Subject | Google Drive file ID | PDF pages | Intake file | Source status |
|---|---|---|---:|---|---|
| 1 | English | Not yet recorded in this handoff | unknown | verify existing repository | Existing work/drafts may exist; verify |
| 1 | Urdu | `17o-AGE3z00m-z8Kih389pmAeWolTxA2N` | 168 | `data/class1-urdu-intake.json` | registered |
| 1 | Mathematics | `1c4x62XDG-TbhF2-Aj_VIxhnm-8t8e2Ua` | 134 | `data/class1-mathematics-intake.json` | registered; 100 Unit 1 **draft** questions reported in `data/class1-mathematics-unit1-draft.json`, not approved |
| 1 | General Knowledge | `1pyHTreo1lqtubCL0iGBZDNFwoRaebxAG` | 54 | `data/class1-general-knowledge-intake.json` | registered |
| 1 | Islamiat | `1wcbkbayvUt5nv_GSvHBdVBMplTuGwLVR` | 44 | `data/class1-islamiat-intake.json` | registered |
| 1 | Tajweedi Qaida | `1ohWq-zOojLu0vPut9zBqUUqoiyY1gFGF` | 38 | `data/tajweedi-qaida-intake.json` | registered; **explicitly assigned Class 1** |
| 2 | Urdu | `1cWaeH4aUC0xJi2kbYkmrENXmU-NnBx6L` | 146 | `data/class2-urdu-intake.json` | registered, merged PR #61 |
| 2 | English | `1mDTFzH_fwjl-ZA7peQpVAxE00C3GQ2MX` | 126 | `data/class2-english-intake.json` | registered, merged PR #62 |
| 2 | Mathematics | `11SMlZk9Z3mdAG49ewxxK0ge1DnvyKViZ` | 154 | `data/class2-mathematics-intake.json` | registered, merged PR #63 |
| 2 | General Knowledge | `1zcFk3RFMgOqGpsZWtJi67kSAyDgC9kw_` | 96 | `data/class2-general-knowledge-intake.json` | PR #64 merge unresolved; **not on main** at latest check |
| 2 | Islamiat | `1Z6_q9lf4H2zdXw_VInOMIUZRLFG_QL8X` | 48 | `data/class2-islamiat-intake.json` | registered, merged PR #65; no questions generated |
| 3 | Urdu | `1LNXCmSfpIBA2OgHSx1wn_FeOzvr-MKbn` | 166 | `data/class3-urdu-intake.json` | registered, merged PR #66; no questions generated |
| 3 | English | `11xsJrNr0ONZO8wJUSIq8p0SiK7tLyWZP` | 126 | `data/class3-english-intake.json` | registered, merged PR #67; no questions generated |
| 3 | Mathematics | `1C69gAPjeD2yKfyvDG97kZIiTGJwCbTr2` | 174 | `data/class3-mathematics-intake.json` | registered, merged PR #68; no questions generated |
| 3 | General Knowledge | `120tl2Vz_PhCAAqtivosUlnh9DOiQ3Fs8` | 114 | `data/class3-general-knowledge-intake.json` | registered, merged PR #69; no questions generated |
| 3 | Islamiat | `1aqVKG8-2-AIG3Y2K65C1KWZWB1R7XisG` | 68 | `data/class3-islamiat-intake.json` | registered, merged PR #70; no questions generated |
| 4 | Urdu | `1lmfd019QlRWK-ZBJr0Ze7eLPU1PxIbfs` | 158 | `data/class4-urdu-intake.json` | committed to feature branch, PR #71; **merge not verified on main**; no questions generated |
| 4 | English | `1YxAHOKvHXjdzQVy_RvoZeuugrHL3t0_e` | 138 | `data/class4-english-intake.json` | registered, merged PR #72; no questions generated |
| 4 | Mathematics | `1fpvfnz1sb6arKs8fcumu-Hgl4LjM34eh` | 186 | `data/class4-mathematics-intake.json` | registered, merged PR #73; no questions generated |
| 4 | Islamiat | `13HfdenXkBOLf_3kHQHV_VH4MzoalQqXX` | 88 | `data/class4-islamiat-intake.json` | registered, merged PR #74; no questions generated |
| 4 | Social Studies (SST) | `1EFPSWwGq32iIT-eDGKqtVjMsOeoMHUAD` | 108 | `data/class4-social-studies-intake.json` | registered, merged PR #75; no questions generated |
| 5 | English | `1jsODAQskQsmY_SUp_4xJS7_4VB2lEfat` | 154 | `data/class5-english-intake.json` | registered, merged PR #76; no questions generated |

| 5 | General Science | `1dwl4glSoZ2c1AYVKXH1IIkTSC4B3s97E` | 134 | `data/class5-general-science-intake.json` | registered, merged PR #77; no questions generated |
| 5 | Islamiat | `1xvIrc83nySxsysX5g6u7YN-yFeGe3QLb` | 96 | `data/class5-islamiat-intake.json` | registered, merged PR #78; no questions generated |
| 5 | Social Studies (SST) | `1FOp-kWZ_Z7hLcMsFaVxAkuzIdWVO56oe` | 114 | `data/class5-social-studies-intake.json` | registered, merged PR #79; no questions generated |
| Unassigned (primer) | Mathematics Primer | `19m8yrU20whmA7vVkEf6i6Ej7rbkPJBbv` | 64 | `data/mathematics-primer-intake.json` | registered, merged PR #80; class assignment pending; no questions generated |
| Unassigned (primer) | English Primer | `1G1H_iVUiKOmAY1MUWr4wSVJISbeoUB0Z` | 64 | `data/english-primer-intake.json` | registered, merged PR #81; class assignment pending; no questions generated |
| Unassigned (primer) | Urdu Primer | `1ZOzM3hFOXkTLzfbTJ3JSLnWcftxZ0mg3` | 64 | `data/urdu-primer-intake.json` | registered, merged PR #82; class assignment pending; no questions generated |
| Unassigned (primer) | Qaida Primer | `12eVQL6knNPkA3CVpJvNIXOYmeYK21Aws` | 32 | `data/qaida-primer-intake.json` | registered, merged PR #83; class assignment pending; no questions generated |

Current planned totals: Classes 1–5 = **27 subjects / 40,500 planned**; four primer sources = **6,000 planned**; grand total **31 sources / 46,500 planned**. These are targets, not completed or approved question counts. Class 2 GK, Class 4 Urdu, Class 5 Urdu and Class 5 Mathematics main-branch intake status remains unresolved.

## Known milestones
- Class 1 Urdu source: PR #55; Mathematics source PR #56; 100 Unit 1 math draft questions PR #57; General Knowledge source PR #58.
- Class 1 Islamiat source is on main.
- Class 1 Tajweedi Qaida source PR #60, then assignment corrected to Class 1 on main.
- Class 2 Urdu PR #61; English PR #62; Mathematics PR #63.
- Class 5 English PR #76: merged on main; 154-page scanned source registered, 0 questions generated.
- Class 4 Social Studies PR #75: merged on main; 108-page scanned source registered, 0 questions generated.
- Class 4 Islamiat PR #74: merged on main; 88-page source registered once despite repeated links; 0 questions generated.
- Class 4 Mathematics PR #73: merged on main; 186-page scanned source registered, 0 questions generated.
- Class 4 English PR #72: merged on main; 138-page scanned source registered, 0 questions generated.
- Class 4 Urdu PR #71: feature branch committed, merge attempt timed out and GitHub returned 'Merge already in progress'; **not verified on main**. Recheck before claiming merged.
- Class 3 Islamiat PR #70: merged on main; 68-page source registered, 0 questions generated.
- Class 3 General Knowledge PR #69: merged on main; 114-page source registered, 0 questions generated.
- Class 3 Mathematics PR #68: merged on main; 174-page source registered, 0 questions generated.
- Class 3 English PR #67: merged on main; 126-page scanned source registered, 0 questions generated.
- Class 3 Urdu PR #66: merged on main; 166-page source registered, 0 questions generated.
- Class 2 Islamiat PR #65: merged successfully on main; 48-page source registered, 0 questions generated.
- Class 2 General Knowledge PR #64: merge attempt timed out; later GitHub said "Merge already in progress"; file was **not** on main when checked. **Recheck and resolve before claiming merged.**

## Pre-primary and primary structure — decision 2026-11-04
- Primary level: Classes 1–5. Textbook source intake considered complete by user, subject to unresolved GitHub merges and a final audit.
- Pre-primary sequence: Playgroup/Basic → Nursery/KG → Prep → Class 1. The user associates the primer books with early childhood education and suggests English and Mathematics Primer for Nursery/KG, with Prep as the next stage. **Exact allocation of Urdu Primer and Qaida Primer, and whether all primers span more than one level, remains to be confirmed.** Do not silently assign them to a class.
- Pre-primary 1,500 items per primer is a **maximum content-development target, not a student workload or requirement**. Prioritize small visual/oral/teacher-graded sets, developmentally appropriate activities and quality over quantity.
- GitHub Free can hold text question banks and version history within applicable size and usage limits. Store PDFs on Drive, not GitHub; never expose protected answer keys or student records in public repository files. Use an access-controlled database/API for live assessments.
- **Important**: source metadata is saved for most subjects, but 46,500 questions have NOT been authored. Only the reported 100 Class 1 Mathematics Unit 1 draft items are known; audit before claiming counts.
- Handoff rows and summary were reconciled after earlier updates appended table rows below the new-chat instructions.

## Immediate next steps
1. Resolve outstanding intake merges for Class 2 GK, Class 4 Urdu, Class 5 Urdu and Class 5 Mathematics, and verify the full source inventory.
2. Confirm pre-primary primer-to-stage mapping, then implement age-appropriate question specifications.
3. Audit existing question files and actual approved/draft counts before making progress claims.
4. Begin substantive lesson-by-lesson, visually verified question development and automated QA; commit batches with truthful draft/approval status.
5. Keep this handoff current with new links, completed batches, unresolved issues, and decisions.

## How to resume in a new chat
User can say: **"Continue LAMA Examination System question bank. Read examination-system/QUESTION_BANK_HANDOFF.md in my GitHub repository first, then process the next textbook link. Update the handoff file after each substantive step. No deployment."**








## Live GitHub audit — 2026-11-04

- Inspected `main` directory `examination-system/data/`: 27 JSON files, comprising 26 intake metadata files and one Class 1 Mathematics Unit 1 draft file. Directory inventory is not a full-repository question-file search.
- Open textbook registration PRs: #64 (Class 2 General Knowledge) and #71 (Class 4 Urdu). Neither intake file is currently present in the `main` data directory. Do not mark merged until verified.
- Class 5 Urdu and Class 5 Mathematics intake files are also absent from this directory; source registration remains unresolved.
- Verified Class 1 Mathematics Unit 1 draft: 100 question records, 100 unique IDs, 100 distinct normalized question texts, 0 approved, 0 online-ready, 0 missing answer fields. Question types: short_answer, mcq. These checks are structural only, not textbook correctness or pedagogical approval.
- Next: resolve PR #64/#71 safely after mergeability checks; confirm Class 5 source links; visually review textbook chapters and draft answers before approving questions. Do not deploy.

## Category specification — 2026-11-04

- Added `examination-system/QUESTION_CATEGORY_SPEC.md` with a 1,500-question primary-subject allocation (350 MCQ, 200 blanks, 150 true/false, 250 short answer, 150 matching/ordering, 250 application/comprehension/numerical, 150 picture/oral/teacher-reviewed), adaptable by subject.
- This is a development specification, **not 1,500 generated questions**. Existing verified baseline remains 100 Class 1 Mathematics Unit 1 drafts, zero approved. Remaining content requires source-by-source generation and independent answer review.
- Do not deploy or publish; keep answer keys access-controlled before any online release.

## Question QA development — 2026-11-04

- Added read-only `examination-system/audit_questions.py` to check missing fields, duplicate IDs/text, MCQ answer membership, approval-state consistency, and numeric-template repetition. Script does not change student records or publish questions.
- Existing Class 1 Mathematics Unit 1 draft has 100 items, but structural uniqueness alone is insufficient. Numeric-template repetition audit identified 9 patterns with at least five variants; most repeated: `what number comes immediately after #?` (10); `what number comes immediately before #?` (10); `write # as tens and ones.` (10); `which digit is in the tens place of #?` (10). These are review flags, not confirmed invalid questions.
- No additional questions were generated in this audit step; total remains 100 drafts, zero approved. Next content authoring must use verified textbook page images and varied learning outcomes, rather than inflate counts with number substitutions.

## New question content batch — 2026-11-04

- Added `data/class1-mathematics-unit1-varied-draft.json` containing **30 additional original supplementary drafts** (7 MCQ, 11 short answer, 5 fill-blank, 4 true/false, 3 matching). The questions cover counting, number order, place value, patterns, contextual arithmetic, and equal grouping.
- These 30 are **not textbook-page verified**, and page fields are deliberately null rather than invented. They remain draft, unapproved, offline-only. Some outcomes (e.g. odd/even and sharing) require scope confirmation against the actual Unit 1 textbook pages before inclusion in Unit 1.
- Verified repository file counts now: **130 draft questions** across two Class 1 Mathematics Unit 1 files; **0 approved**, **0 online-ready**. The 46,500 overall target remains unfinished.
- Before publication: visually confirm textbook learning outcomes, review each answer and marking rubric, screen for near duplicates, and move protected answer keys out of public repository assets.

## Bulk 500-question generation — 2026-11-04

- Created `data/class1-mathematics-unit1-batch500-draft.json` in one GitHub commit with 500 unique IDs and 500 distinct question texts, across ten learning-skill families (50 each): addition, subtraction, number bonds, comparison, place value, counting on, counting back, ordering, skip-counting, part-whole.
- **Caution:** Unique text does not mean non-repetitive pedagogy: each skill family uses related templates. These are generated **drafts**, not independently textbook-verified, semantically deduplicated, teacher-approved, or online-ready. Page references intentionally null. Check whether all skill families belong in the actual Unit 1; reassign or reject out-of-scope items.
- Class 1 Mathematics total now **630 draft records** (100 original + 30 varied + 500 bulk), **0 approved**, **0 online-ready**; 870 remain to the 1,500 draft target. Count is file-record total; cross-file semantic uniqueness and correctness have not been certified.
- No deployment. Never serve public-repository answer keys as secure live assessment data.

## Next-step quality gate — 2026-11-04

- Added `examination-system/audit_semantic_templates.py` to detect repeated numerical patterns even when object/context nouns change. This supplements `audit_questions.py`; both are read-only and use the Python standard library.
- Inspected the 500-item bulk batch: ten `learningOutcome` families, **50 records in each**, all based on related question constructions. Unique text/ID is **not evidence of 500 distinct pedagogical ideas**. These records remain drafts pending semantic and textbook review.
- No further bulk batch was added in this step: generating another 500 by changing names and numbers would violate the user's explicit non-duplication requirement. Continue with chapter/source-grounded, genuinely distinct content after scope verification; do not approve or publish any unverified answers.
- Draft inventory remains **630 records** for Class 1 Mathematics, zero approved and zero online-ready. No deployment.

## Second 500-question batch — 2026-11-04

- Committed `data/class1-mathematics-batch2-500-draft.json` with 500 additional Class 1 Mathematics practice draft records and 500 unique record IDs. GitHub commit `fbf87f879cba03f6b77120b453537fe0f97f9f97`.
- 25 skill categories represented, including number names, order, place value, number bonds, addition/subtraction, skip-counting, doubles and halves. Some questions repeat mathematical structures and some include practice-card suffixes for distinct text; **do not equate unique text with non-duplicate learning content**. Remove repeated templates and any out-of-scope items before approval.
- Class 1 Mathematics inventory: 100 original drafts + 30 varied drafts + 500 first bulk drafts + 500 second bulk drafts = **1,130 draft records**; **0 approved, 0 online-ready**. 370 records to the numeric 1,500 draft target, but quality-reviewed count remains zero.
- Textbook-page verification, semantic deduplication, independent answer checking, age appropriateness, and safe answer-key storage remain outstanding. No deployment.

## Draft target reached and online practice preview — 2026-11-04

- Created `data/class1-mathematics-batch3-370-draft.json` (370 records, unique IDs and distinct texts), bringing Class 1 Mathematics to **1,500 total draft records** across five files: 100 + 30 + 500 + 500 + 370. **0 approved and 0 online-ready**; 1,500 is a numeric draft inventory target only, not a quality or curriculum completion certificate.
- Created `examination-system/practice-preview.html`: mobile-friendly browser-based practice with selectable question batch, randomized 5/10/20 questions, typed answers or multiple choice, answer feedback and score. The page loads JSON via relative paths and must be served by an HTTP static server, not opened as a local file.
- **Security:** This preview loads public draft JSON with correct answers. It is **not** a secure online examination, must not collect student identity or persist scores, and is not integrated with school grades. Production needs authenticated server-side question delivery without answer keys, server-side grading, permission/entitlement checks, and audit logging.
- **Quality:** Generated questions still have repeated patterns and are not independently verified against textbook pages or educational scope. No live publication, approval, or Vercel deployment performed.

## Examination scope, portals, print and Smart Marker — 2026-11-04

- Added `exam-blueprint.js`: pure chapter-scope resolver for selected chapters (including 1+2+5), half, quarter and full; filters unapproved/non-online-ready/duplicate records; deterministic paper assembly; answer-free student payload; illustrative entitlement/role checks. **Not integrated with backend or portals.** Quarter/half equal-split fallback requires curriculum/term mapping before release.
- Added `print-preview.html`: A4 school-header print/Save-as-PDF prototype with student details, paper fields and QR placeholder. **No working QR, real PDF generator or OMR layout yet.**
- Added `EXAM_SMART_MARKER_INTEGRATION.md`: secure online exam lifecycle, Super Admin entitlement controls, teacher/admin publish workflow, student portal access, server-side grading, signed paper IDs, Smart Marker OMR/handwritten review, idempotent result posting and release blockers.
- Existing 1,500 Class 1 Mathematics records remain **draft/unapproved** and lack verified chapter mapping. The new generator deliberately cannot treat them as live exam-ready questions. No production portal integration, deploy or data mutation performed.

## Smart Syllabus Planner — 2026-11-04

- Committed `syllabus-scheduler.js` (pure JS, no backend mutation): configurable start date/duration, weekly-off-day policies, school/public holiday exclusions, monthly/two-term/three-term/quarterly/custom divisions, lesson-period scheduling, capacity validation, revision/assessment reserves and date-specific teacher diary suggestions.
- Committed `test-syllabus-scheduler.js` with Node assertions for government/private weekend differences, holiday skipping, divisions, diary output, cross-year dates and capacity/overlap failures. **Tests are committed, not yet executed in a CI environment.**
- Committed `SMART_SYLLABUS_PLANNER.md`: basic manual syllabus planning belongs to Management; automated plan and teacher diary suggestions belong to Examination entitlement; Smart Marker remains separately licensed. Includes future APIs, permissions, persistence, approvals, audit and replan rules.
- **Not yet live:** no teacher diary UI integration, no school settings UI, no verified textbook lesson catalog, no backend persistence, no deployment. Existing student/school data untouched.


## Syllabus planner development continuation — 2026-11-04
- Added `syllabus-progress.js` as a standalone read-only companion to the existing scheduler. Tracks completed, pending and delayed lesson periods using stable composite schedule-entry keys; provides diary suggestions and chapter coverage for exam scoping.
- Added `test-syllabus-progress.js` covering completion/delay classification, diary suggestions, chapter coverage, invalid keys and invalid dates.
- Coverage is advisory only: chapter tests still require teacher approval and separately verified question-bank questions. This helper does not publish papers or modify grades.
- Existing scheduling engine, textbook metadata, school records, portals and Apps Script were not modified. New files committed directly to `main`.
- **Still outstanding:** execute tests in CI, connect real verified chapter/lesson catalogs, manual Management UI, automated Examination UI, backend tenant/entitlement checks, versioned persistence, teacher diary writeback, calendar exceptions/make-up days, and approved exam scope. No Vercel deployment.

## Subject transition gate — 2026-11-04

- User authorized moving to the next subject **only after** Class 1 Mathematics manual papers and online examinations are complete.
- Current status: 1,500 **draft** records, zero approved/online-ready; chapter mapping, semantic deduplication, independent answer checks, secure online attempts, actual printable papers, and PDF visual QA are outstanding. Do not label subject complete.
- Added `check_math_release.py`, a read-only fail-closed structural readiness check for all five Mathematics draft files. It checks count, IDs, exact texts, answer presence, chapter mapping and approval flags; it is not a replacement for pedagogical or runtime validation. Script committed, execution not yet verified.
- Next subject once Maths is genuinely ready: Class 1 Urdu (source intake registered); verify textbook chapters before drafting. No new Urdu questions added this turn, no deployment.


## Continuation — verified catalog and manual checklist (2026-11-04)
- Added `examination-system/syllabus-catalog.js`: standalone verified textbook lesson catalog normalization, globally unique lesson IDs, positive teaching-period validation and basic manual lesson checklist output.
- Added `examination-system/test-syllabus-catalog.js`: Node assertions for verified catalog normalization, completed manual checklist, rejection of unverified catalogs, unknown lesson IDs and duplicate chapter IDs.
- **Important:** textbook intake registration is not equivalent to a verified chapter/lesson catalog. Automatic scheduling must not invent chapter names or lesson content; verified lesson metadata remains a prerequisite.
- The catalog/checklist functions are pure and read-only; no school data or production portal changes. Tests are committed but execution not confirmed.
- Pending: integration with real school settings and teacher diary, authenticated backend persistence and entitlement enforcement, approved chapter-wise exam scope, live catalog verification and end-to-end testing. No Vercel deployment.

## Class 1 Urdu started — 2026-11-04

- User explicitly authorized moving question-content work to Class 1 Urdu; system integration remains in separate master chat.
- Verified Google Drive source metadata: `urdu 1  2024 water mark.pdf` (application/pdf, 76,959,624 bytes), ID `17o-AGE3z00m-z8Kih389pmAeWolTxA2N`; repository intake reports 168 pages and 0 questions.
- Retrieved source text via Drive connector; Urdu text extraction is badly garbled and cannot ground chapter titles, quotations or exact page mappings. **Visual PDF review required before drafting textbook-grounded questions.**
- Added `examination-system/CLASS1_URDU_QUESTION_PLAN.md` with source review workflow, question schema, Urdu-specific marking rules, duplicate checks and release criteria.
- Current Urdu counts: 0 drafted, 0 approved, 0 online-ready. Do not imply 1,500 questions have been generated. No deployment or production database changes.


## Class 1 General Knowledge — 2026-11-06 new subject started
- Selected as next subject after Class 1 Urdu; source `G.K 1 r.pdf`, Drive ID `1pyHTreo1lqtubCL0iGBZDNFwoRaebxAG`, 54 pages, Urdu, image-only.
- Confirmed source accessible through connected Drive; extracted text empty. **No textbook lesson/page mapping has been verified.**
- Added `data/class1-general-knowledge-supplemental-starter-draft.json`: **40 original supplemental MCQ drafts**. These are general age-appropriate practice prompts, **not textbook-derived or approved**; each has null chapter/lesson/page, `approved=false`, `onlineReady=false`.
- Target remains three verified batches of 500 (1,500 total), not yet generated. Do not misreport these 40 as the first complete batch.
- Next: visually inspect source table of contents and lesson pages; build grounded chapter map; author varied source-specific questions with manual answer review; no deployment.


## Class 1 GK batch 1 — 500 drafts committed (2026-11-06)
- `data/class1-general-knowledge-batch1-500-draft.json`, commit `59f2f48677e55d0dd43f204445a729da8d141cbb`: 500 draft records, 500 unique IDs, 100 core concepts in 10 themes, 5 assessment formats per concept (MCQ, fill-blank, matching, true/false, short answer).
- Automated construction checks: no missing answers; 2 exact repeated prompt occurrences (due to overlapping action phrases). **These require correction**. Five formats for each fact also create intentional conceptual repetition; this is **not** 500 unique concepts.
- All 500 are supplemental practice, not derived from verified textbook pages; chapter/lesson/page are null; `approved=false`, `onlineReady=false`. Do not expose to live exams. 40 separate earlier starter drafts exist and may overlap with batch 1; do not combine without deduplication.
- Source `G.K 1 r.pdf` (54-page image-only PDF) accessible via Drive but contents not visually inspected. Next: visually verify chapter map, remove duplicates, review answers/distractors and class-level suitability, add genuinely different source-based questions, then batch 2.


## Class 1 GK batch 2 — 500 additional drafts (2026-11-06)
- `data/class1-general-knowledge-batch2-500-draft.json`, commit `0fd45a9a8d57ab1f9f9d041aa29411d808e05cbb`: 500 new records with IDs `C1-GK-B2-0501` through `C1-GK-B2-1000` (separate from batch 1).
- Source PDF `G.K 1 r.pdf` (54 pages) retrieved from Drive and visually inspected PDF pages 3–5, including contents and first lesson `میرا تعارف`. These pages do **not** validate each drafted fact or page mapping.
- 100 core fact prompts repeated in five assessment formats; 478 unique literal prompts (22 repeated occurrences). Some topic labels are paraphrased rather than exact textbook headings. Requires editorial correction and textbook lesson verification before release.
- No verified chapter/lesson/page per question. All `approved=false`, `onlineReady=false`; supplemental practice only. 1,000 questions in two 500-record draft batches, not 1,000 textbook-approved questions. Earlier separate 40-question starter file may overlap and is excluded from the 1,000 total.
- Next: correct repeated/ambiguous items, diversify concepts, inspect remaining textbook pages, verify answers and source links, then draft batch 3 without deploying.


## Class 1 GK batch 3 — 500 additional drafts (2026-11-06)
- `data/class1-general-knowledge-batch3-500-draft.json`, commit `f0e73012b0543268a9a1c3bfb91d081b38175ea9`: IDs 1001–1500, 500 unique IDs, 125 core concepts, four formats per concept; 5 repeated literal prompt occurrences flagged. No missing answers in construction check.
- GK total: three separate 500-record batches = **1,500 supplemental draft questions**, NOT 1,500 unique facts or textbook-approved questions. Earlier 40 starter questions are separate and excluded from count.
- Book `G.K 1 r.pdf` Drive ID `1pyHTreo1lqtubCL0iGBZDNFwoRaebxAG` (54 pages) remains source reference; individual chapter/lesson/page mappings are null and all questions `approved=false`, `onlineReady=false`.
- IMPORTANT QA: Across batches, multiple formats revisit the same fact and subjects overlap. Review cross-batch semantic duplicates, answer ambiguity, age appropriateness, distractor quality, exact Urdu textbook chapter names, and page grounding. Do not activate questions for students. No Vercel deployment.
- Next subject after GK: Class 1 Islamiat (registered source) subject to source verification and content accuracy review; do not represent any batch as textbook-derived until pages inspected.
