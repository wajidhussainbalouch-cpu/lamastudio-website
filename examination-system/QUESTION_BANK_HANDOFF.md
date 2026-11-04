# LAMA Examination System — Question Bank Project Handoff
Last updated: 2026-11-04 (Class 3 General Knowledge source intake)
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

Current planned totals: Class 1 = 6 subjects × 1,500 = **9,000**; Class 2 = 5 subjects × 1,500 = **7,500**; Class 3 = 4 subjects × 1,500 = **6,000**; total **22,500 planned**, not generated/approved. Do not imply 22,500 questions exist.

## Known milestones
- Class 1 Urdu source: PR #55; Mathematics source PR #56; 100 Unit 1 math draft questions PR #57; General Knowledge source PR #58.
- Class 1 Islamiat source is on main.
- Class 1 Tajweedi Qaida source PR #60, then assignment corrected to Class 1 on main.
- Class 2 Urdu PR #61; English PR #62; Mathematics PR #63.
- Class 3 General Knowledge PR #69: merged on main; 114-page source registered, 0 questions generated.
- Class 3 Mathematics PR #68: merged on main; 174-page source registered, 0 questions generated.
- Class 3 English PR #67: merged on main; 126-page scanned source registered, 0 questions generated.
- Class 3 Urdu PR #66: merged on main; 166-page source registered, 0 questions generated.
- Class 2 Islamiat PR #65: merged successfully on main; 48-page source registered, 0 questions generated.
- Class 2 General Knowledge PR #64: merge attempt timed out; later GitHub said "Merge already in progress"; file was **not** on main when checked. **Recheck and resolve before claiming merged.**

## Immediate next steps
1. When the user pastes another textbook URL, identify its real class/subject and register it safely.
2. Verify Class 2 GK PR #64 merge and main branch state.
3. Audit existing question files and actual approved/draft counts before making progress claims.
4. Begin substantive lesson-by-lesson, visually verified question development and automated QA; commit batches with truthful draft/approval status.
5. Keep this handoff current with new links, completed batches, unresolved issues, and decisions.

## How to resume in a new chat
User can say: **"Continue LAMA Examination System question bank. Read examination-system/QUESTION_BANK_HANDOFF.md in my GitHub repository first, then process the next textbook link. Update the handoff file after each substantive step. No deployment."**
