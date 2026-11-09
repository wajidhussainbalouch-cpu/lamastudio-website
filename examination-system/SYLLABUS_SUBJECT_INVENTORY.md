# Smart Syllabus Planner — textbook inventory and rollout

Updated: 2026-11-09. **Planning inventory, not an approved syllabus.**
Source: `QUESTION_BANK_HANDOFF.md` plus direct checks of four unresolved intake paths on GitHub `main`.

## Priority
Build the planner for **all registered subjects**, not only Class 5 English. Reuse textbook intake metadata from the Examination System but do not mistake a question-bank intake record for a verified chapter/exercise syllabus. Textbook PDF files remain on Google Drive. A subject is eligible for published scheduling only after a human verifies chapters, exercises, teaching-period estimates and school approval.

## Primary-school coverage
Status "registered (handoff)" means the question-bank handoff reports a textbook source; **individual PDF pages have not been verified in this inventory**.

| Class | Subject | PDF pages (handoff) | Planner exercise verification |
|---|---|---:|---|
| 1 | English | unknown | Pending; source details require verification |
| 1 | Urdu | 168 | Pending |
| 1 | Mathematics | 134 | Pending |
| 1 | General Knowledge | 54 | Pending |
| 1 | Islamiat | 44 | Pending |
| 1 | Tajweedi Qaida | 38 | Pending; oral/pronunciation teacher review |
| 2 | Urdu | 146 | Pending |
| 2 | English | 126 | Pending |
| 2 | Mathematics | 154 | Pending |
| 2 | General Knowledge | 96 | Intake missing on main; pending |
| 2 | Islamiat | 48 | Pending |
| 3 | Urdu | 166 | Pending |
| 3 | English | 126 | Pending |
| 3 | Mathematics | 174 | Pending |
| 3 | General Knowledge | 114 | Pending |
| 3 | Islamiat | 68 | Pending |
| 4 | Urdu | 158 | Intake missing on main; pending |
| 4 | English | 138 | Pending |
| 4 | Mathematics | 186 | Pending |
| 4 | Islamiat | 88 | Pending |
| 4 | Social Studies | 108 | Pending |
| 5 | English | 154 | **74 provisional strand lessons / 176 periods**, NOT exercise-verified or approved |
| 5 | General Science | 134 | **10 chapter titles/start pages visually verified** from PDF contents; exercise mapping pending |
| 5 | Islamiat | 96 | Pending |
| 5 | Social Studies | 114 | Pending |
| 5 | Urdu | unknown | No main-branch intake; source needed |
| 5 | Mathematics | unknown | No main-branch intake; source needed |

The 27 class/subject rows above follow the question-bank handoff's stated 27-subject scope. No row is marked exercise-approved.

## Pre-primary sources (stage assignment pending)
| Source | PDF pages | Assignment |
|---|---:|---|
| Mathematics Primer | 64 | Unassigned |
| English Primer | 64 | Unassigned |
| Urdu Primer | 64 | Unassigned |
| Qaida Primer | 32 | Unassigned |

Do not silently assign primer books to Playgroup, Nursery/KG or Prep.

## Main-branch gaps confirmed 2026-11-09
Direct GitHub file fetch returned 404 for:
- `examination-system/data/class2-general-knowledge-intake.json` (handoff records Drive ID `1zcFk3RFMgOqGpsZWtJi67kSAyDgC9kw_`)
- `examination-system/data/class4-urdu-intake.json` (handoff records Drive ID `1lmfd019QlRWK-ZBJr0Ze7eLPU1PxIbfs`)
- `examination-system/data/class5-urdu-intake.json` (no source ID in handoff)
- `examination-system/data/class5-mathematics-intake.json` (no source ID in handoff)

Missing **intake metadata on main** does not establish that the original PDF is unavailable elsewhere; check Drive and prior conversations before asking for re-upload.

## Safe delivery order
1. Verify source availability and textbook editions across all subjects; resolve the four metadata gaps without fabricating source details.
2. Capture chapter title, exact exercise identifier, printed/PDF page references, expected periods, and review evidence for each book.
3. Generate a **provisional undated division** for each subject; keep the division distinct from the timetable.
4. Require school approval before freezing lesson IDs, sequence and estimated periods.
5. Schedule with school-specific working days, holidays, subject periods and examination deadline; never compress unfinished work silently.
6. Connect published schedules to teacher diary and progress; completed teaching history stays immutable.

**Not deployed:** no production Apps Script or Vercel changes, no school records migrated. The current planner's Class 5 English division is a draft, not an approved template.

## Class 5 General Science verified source progress — 9 Nov 2026
- Retrieved the original 134-page PDF from its registered Google Drive file and visually inspected PDF page 3 (contents). Verified ten chapter titles and printed start pages; glossary starts on printed page 129.
- Added `catalogs/general-science-class-5-toc.json` with evidence and page references; each chapter's lessons array remains empty until actual exercise review. This is **not** an approved syllabus or automatically schedulable catalog.
- PDF page 4 displays printed textbook page 1, so the chapter PDF start page is printed start + 3 for this edition.

## Class 5 General Science Chapter 3 — 9 Nov 2026
- Original textbook printed pages 38–40 (PDF 41–43) visually reviewed. Five exercise groups: 5 MCQ, 5 short-answer, 2 constructed-response, 1 investigation and 2 project tasks.
- `catalogs/general-science-class-5-ch03-exercises.json` records the groups and source pages. In-chapter activity list and teaching-period estimates remain pending; this is not approved for scheduling.
