# Lama IQ Test — living development handover
Updated 2026-10-31. Final public brand: **Lama IQ Test** (one L). Legacy folder and URL remain `apps/lamaiqmaster/` for compatibility.

## Source of truth
Repository: `wajidhussainbalouch-cpu/lamastudio-website`
Development branch: `feature/lamaiqmaster-native-foundation`
Production branch: `main` (not modified by this work).
Website: `apps/lamaiqmaster/index.html`
Android: `apps/lamaiqmaster/android/`
Workflow: `.github/workflows/lama-iq-test-android.yml`

## Implemented on development branch
- Native Kotlin/Jetpack Compose Android foundation, package `pk.lamastudio.iqtest`.
- 50 original reasoning questions in `ChallengeBank.kt`, organized into five levels (10 each).
- Multiple-choice answers, explanations, per-level scores and offline best-score persistence.
- Next level unlocks at 7/10 correct. No account required.
- Product website display branding renamed to Lama IQ Test; Free and planned Pro descriptions added.
- GitHub Actions Gradle debug APK workflow configured.

## NOT YET VERIFIED / NOT READY FOR RELEASE
- GitHub Actions build has NOT been confirmed successful; no verified APK exists yet.
- No Android device installation, functional QA, automated tests or accessibility QA yet.
- AdMob SDK, consent management, ad unit IDs and actual ad displays are NOT implemented.
- Play Billing, secure entitlement backend, purchase restoration, subscription pricing are NOT implemented.
- App icon, release signing, privacy policy audit, Play Data Safety, store listing and AAB release are pending.
- Only logic/pattern categories currently have implemented questions; memory and timed reaction modes remain planned.
- Repository-wide legacy name audit and link compatibility review are not complete.
- Website changes are on a development branch and NOT live.

## Next steps
1. Confirm GitHub Actions workflow is discovered and trigger a build (workflow on feature branch may need default-branch registration); inspect logs and fix compilation errors.
2. Download debug APK from successful workflow artifact; install and test on Android phone.
3. Add automated question-bank tests, timed modes, memory exercises, accessibility and progress UX.
4. Review site links and branding, preserve old paths or implement redirects.
5. Add AdMob test ads with consent and policy compliance; no ads during timed challenges.
6. Add Google Play Billing with server-side purchase verification and restoration.
7. QA and publish only after signed AAB, privacy disclosures and Play Console approval.

## Working agreement
- User wants continuous progress tracked in this MD file in GitHub.
- Do not repeatedly present downloadable handover MD/ZIP links; create a packaged handover only when the user asks to close/transfer the chat.
- Preserve all other apps, school suite, student data and production deployment.
- Do not claim an APK, production deployment or release until verified.

## 2026-10-31 — Multilingual and visual reasoning increment
- Added `VisualPuzzleFactory.kt`: deterministic, seed-based offline shape/color/arrow/size sequence generator; up to 1,000 generated instances per invocation (not 1,000 guaranteed unique puzzles).
- Added `GameText.kt`: explicit UI translations for English, Urdu, Arabic, Hindi and Spanish.
- Added `VisualChallengeScreen.kt`: visual multiple-choice sequence screen, translated prompts, answers and explanations, integrated into Android home.
- Original 50 fixed logic/pattern questions remain in English; they are NOT yet fully translated. RTL layout, native-speaker translation review, image assets and advanced visual reasoning modes require further work.
- The generator currently repeats finite cyclic patterns; expand templates and add uniqueness testing before claiming a large nonrepeating question bank.
- Build still unverified; no installable APK or Play-ready release has been confirmed.

## 2026-10-31 — Approved monetization rules
- Free entitlement target: 100 questions in ten batches of ten.
- Progression threshold: at least seven correct answers per batch to unlock the next normal batch.
- Optional rewarded ads: proposed one bonus batch (10 questions) for a standard completed rewarded ad; two bonus batches (20 questions) for a distinct supported rewarded experience. Ad length is controlled by Google and cannot be promised as exactly 5 or 30 seconds.
- Reward only on verified SDK earned-reward callbacks; no ad availability guarantee; no mandatory ad to access the original 100 free questions.
- Proposed daily cap: six rewarded bonus batches per day, adjustable after testing.
- Pro: subscription for unrestricted content and no ads, subject to Google Play Billing implementation and verification.
- Added `AccessPolicy.kt` with access constants and pure rule functions. NOT integrated into existing UI, not persisted, and no AdMob SDK or Play Billing is yet connected.
- Current content remains 50 fixed text questions plus generated visual puzzles; the full curated 100 free questions are not yet built and verified.

## 2026-10-31 — Five generated question-bank batches
- Added five JSON files in `question-bank/`: number_logic, visual_patterns, memory, attention, advanced.
- Exactly 1,000 records per file, 10 levels x 100 records; total 5,000 distinct IDs and literal prompts generated.
- Commits: number 0a7afe34, visual 4cc91398, memory 3b37b83d, attention dc7fa5f8, advanced 8c3dd58e.
- IMPORTANT: these are generated drafts, not 5,000 independently reviewed unique brain puzzles. Several are formula variations; visual patterns can be semantically repetitive. Memory prompts need a separate concealed recall screen. All question bank records currently English-only.
- The bank is not yet integrated into the Android gameplay. No APK or successful build verified.
- See `question-bank/README.md` for validation gaps and release gates.

## 2026-10-31 — APK-first delivery sequence
1. **Build verification:** `QuestionValidationTest.kt` now tests fixed bank invariants, generated visual question validity, reproducibility and access rules. CI workflow now runs `:app:testDebugUnitTest` before `:app:assembleDebug`.
2. **First debug APK:** Trigger cloud build, inspect job logs, fix Kotlin/Gradle errors and obtain an actual successful APK artifact.
3. **Phone acceptance test:** Install on Android, verify navigation, 7/10 progression, visual puzzles, language display and offline scores.
4. **Content integration:** Validate generated JSON content and wire approved question packs into app. The 5,000 generated records are drafts and are NOT yet player-facing.
5. **Commercial release:** Complete full language support, AdMob rewarded flow, billing, signing, privacy and Play Store review.
Status: source/tests/workflow committed; **no successful cloud build or verified APK yet**. PR creation attempt was blocked, so do not claim GitHub Actions has run.

## 2026-11-04 — Mobile tester feedback and next build
User confirmed the 0.1.0 debug APK installs and opens on Android; visual-pattern UI renders. Requested: five-module drawer, per-module questions with no substantive repetition, green tick for correct answers, retry hints without answer reveal, privacy/about/version, app icon, LamaStudio website integration, and future policy-compliant ads.

Committed implementation on development branch: drawer lists Number Logic, Visual Patterns, Memory, Attention, Advanced Reasoning; visual and text practice use green correct feedback and hints/retry; in-app privacy/about/version and external LamaStudio link; original vector launcher icon; app listing on the development branch website homepage. **Memory, Attention, Advanced Reasoning remain explicitly marked under development, not falsely populated with unrelated questions.** Existing 5,000 draft questions remain unapproved; do not promise uniqueness. No AdMob SDK, Google Play Billing, or production deployment was added. A new GitHub Actions build is required to validate these changes. Mobile smoke test of this new build has not happened.

## 2026-11-06 — Final APK acceptance gate
The user explicitly requested NO final APK until the target 5,000 questions are genuinely varied, independently answer-verified, playable offline across all five modules, and the Android design closely matches the supplied reference image. The five JSON packs currently contain 5,000 draft records but are not approved or fully integrated. GitHub Actions now invokes `python3 ../question-bank/validate_bank.py` before unit tests and APK compilation; the existing drafts are expected to FAIL this gate. This is deliberate: do not publish or label any debug APK final until the validator passes and Android build plus physical-device smoke testing succeed. The validator alone cannot prove conceptual uniqueness or correctness; additional independent checks and editorial review remain necessary. No production deployment authorized.

## 2026-11-06 — Playable Attention module milestone
Added `AttentionChallengeScreen.kt` with 10 offline symbol-count challenges; answers are computed from each visible grid and validated in the `AttentionRound` constructor. Distractors are distinct valid nonnegative counts; wrong attempts give a hint without revealing the correct answer; green tick, score, and result screen included. Wired to sidebar in `MainActivity.kt`. Added `AttentionChallengeTest.kt` for 30 seeds x 10 rounds (300 generated puzzles) checking answer calculation and per-session grid uniqueness. This is a playable prototype, **not** integration of the 1,000 draft Attention JSON questions and not proof of 5,000 varied questions. Workflow quality gate for existing draft packs still needs passing before final APK. No deployment or APK validation claimed.

## 2026-11-06 — Advanced Reasoning module connected
Fixed duplicate distractor cases in `AdvancedReasoningScreen.kt` (modular cycle range, polygon diagonals, handshakes), connected module to sidebar, and added `AdvancedReasoningTest.kt` covering 500 deterministic seeds x 10 rounds for unique choices, valid indices, nonblank hints and explanations. These tests do **not** independently verify mathematical truth or conceptual uniqueness across 5,000 draft records. All five sidebar categories now have at least a gameplay path (Number Logic, Visual Patterns, Memory, Attention, Advanced Reasoning), but the 5,000 draft JSON question bank is still not integrated or approved. The question-bank quality gate remains a blocker; no final APK or deployment.

## 2026-11-06 — Number Logic candidate questions batch 1
Added `question-bank/number_logic_candidate_100.json` with 100 new questions across 10 mechanism families (reverse operations, handshakes, polygon diagonals, ratios, set union, arithmetic series, work rates, ranking, consecutive squares, clock arithmetic). Correct answers and distractors are calculated from explicit rules; each record has four distinct options, explanation, unique ID, and level. Added `validate_candidate_100.py` for structural checks. These are **candidate** questions, not independently editorial-reviewed, and are **not integrated into the Android app**. The existing 5,000 draft records remain unapproved. Do not claim 5,100 approved questions or build final APK yet. Next: independently verify answer semantics, expand variety across all five fields, replace drafts and integrate only approved offline assets.

## 2026-11-06 — Advanced candidate bank batch 1
Added `question-bank/advanced_candidate_100.json`: 100 candidate questions in ten families (combinations, odd sums, triangular sums, perimeter, means, reverse equations, simple probability, percentages, speed, complements). Expanded `validate_candidate_100.py` to audit both Number Logic and Advanced candidate packs (200 records total). Structural validation and rule-derived answers do not constitute independent editorial review. No APK build or Android integration yet. Existing 5,000 draft records remain blocked by quality gate.

## 2026-11-06 — Visual Patterns candidate batch 1
Added `question-bank/visual_patterns_candidate_100.json`: 100 symbolic pattern questions across 10 mechanisms (alternating shapes, three-symbol cycles, growing and shrinking rows, mirror reversal, odd-one-out, checker alternation, grid count, arrow rotations, triangular dot arrangements). Added this file to `validate_candidate_100.py`, now covering 300 candidate records across Number Logic, Advanced Reasoning and Visual Patterns. The data is original and generated with rule-derived answers and distinct choices; it is **not independently editorial-reviewed**, **not bundled into Android assets**, and **not a replacement for real illustrated visual puzzles**. Remaining: memory and attention candidate packs, independent checks, app integration, build and device test. Do not label final or release APK.

## 2026-11-06 — Memory candidate batch 1
Added `question-bank/memory_candidate_100.json`: 100 memory practice candidate records across ten recall task families. Each record separates a timed `stimulus` and later `prompt`, with `presentationSeconds` so the stimulus can be hidden before answering. Extended `validate_candidate_100.py` to check four candidate packs (400 candidate records total), including stimulus presence and duration for Memory. These records are **not integrated** into the Android memory gameplay yet and do not count as independently editorial-approved questions. One letter-count family uses 'None' answers and requires editorial difficulty review. No final APK built.

## 2026-11-06 — Attention candidate batch 1
Added `question-bank/attention_candidate_100.json` with 100 candidate records across ten mechanisms (target counting, singleton spotting, letter/digit scanning, pair comparison, position scanning, quantity comparison, missing number, grid lookup, uppercase scan). Removed repeated grid scenarios so 100 stimulus-plus-prompt pairs are distinct. Updated `validate_candidate_100.py` to check all five candidate packs, totaling **500 new candidate records** across the five modules. Important: this is not independent editorial verification or the promised 5,000 genuinely distinct and playable puzzles. Candidate packs remain separate from the Android app, and existing 5,000 generated draft records remain unapproved. Do not release final APK yet.

## 2026-11-06 — Number Logic candidate batch 2
Added `question-bank/number_logic_candidate_101_200.json` with 100 candidate records in ten further rule families, bringing new candidate packs to 600 records across six files (Number Logic 200; other four fields 100 each). Extended `validate_candidate_100.py` to check the new pack and enforce globally unique candidate IDs. These are rule-derived candidates, not independently reviewed or integrated into Android. The original 5,000 drafts remain unapproved; do not claim 600 approved questions or release an APK yet.

## 2026-11-06 — Advanced Reasoning candidate batch 2
Added `question-bank/advanced_candidate_101_200.json`: 100 more rule-derived candidate records across 10 additional families (conditional deduction, line ranking, combined work, subset deduction, balance equations, weekdays, set difference, counting codes, conservation, route combinations). This brings newly added candidate records to **700 across seven packs** (Number Logic 200, Advanced Reasoning 200, Visual Patterns 100, Memory 100, Attention 100). New pack generation checked distinct choices, 100 unique prompts, and balanced correct-option positions (25 each). Added the pack to `validate_candidate_100.py`; a successful Python execution, independent answer review, and Android integration are **not yet confirmed**. Existing 5,000 draft records remain unapproved and final APK remains blocked.

## 2026-11-06 — Visual Patterns candidate batch 2
Added `question-bank/visual_patterns_candidate_101_200.json` with 100 symbolic visual pattern candidate records spanning ten mechanisms (ABBA symmetry, grouped pairs, equal-row totals, missing matrix symbols, border dots, alternating tiles, symbol substitution, main diagonal, rotating arrows, corner counting). Distinct option check exposed and corrected a border-count distractor collision before committing. Updated `validate_candidate_100.py` to cover all eight candidate packs, totaling **800 new candidate records**: Number Logic 200, Advanced Reasoning 200, Visual Patterns 200, Memory 100, Attention 100. The validation script has not been confirmed executed successfully; these are not independently reviewed or integrated into Android. The original 5,000 generated drafts remain unapproved; no final APK build yet.

## 2026-11-06 — Memory candidate batch 2
Added `question-bank/memory_candidate_101_200.json` with 100 timed recall candidates in ten further families: penultimate word, before/after positions, digit sum and difference recall, color order, label-value pairing, word recognition, route stops and coordinate associations. Each has a separately presented stimulus and recall prompt, duration 6–9 seconds, four distinct options, explanation, and unique ID. The candidate validator now covers nine packs totaling **900 new candidate records** (Number Logic 200, Advanced Reasoning 200, Visual Patterns 200, Memory 200, Attention 100). Note that programmatic generation checks are not independent answer validation, and some records remain variations of a small number of patterns. Android integration, release QA and final APK are pending.

## 2026-11-06 — Attention candidate batch 2 / 1,000-candidate milestone
Added `question-bank/attention_candidate_101_200.json`: 100 candidate scanning and comparison items across ten families (exact pair matching, case-sensitive scanning, reversed pair, even number counts, grid coordinates, code differences, exact words, descending missing values, adjacent duplicate letters, symbol count comparison). Generated 100 distinct stimulus/prompt pairs and checked distinct answer options with evenly distributed correct positions. `validate_candidate_100.py` now covers ten packs and **1,000 new candidate records**, 200 per field. Important: these are formula-derived candidates, not independently reviewed, and many are variants of similar puzzle templates. Original 5,000 draft records remain unapproved. No Android asset integration or verified APK build yet. Next phase should focus on independent semantic QA, varied visual puzzles, integration and end-to-end gameplay rather than presenting candidate counts as release-ready questions.

## 2026-11-06 — Number Logic candidate batch 3
Added `question-bank/number_logic_candidate_201_300.json`: 100 further rule-derived candidate questions across ten families (geometric sequences, missing mean, sums of consecutive integers, percentage increase, inverse fractions, consecutive squares, 12-hour modular clock, two-number sums, fractions remaining, compound operations). Fixed a duplicate-answer bug in clock distractors before committing. The candidate validator now lists 11 packs, totaling **1,100 newly generated candidate records** (Number Logic 300, other four fields 200 each). These are not independently reviewed and are not yet bundled in Android; final APK remains pending QA and integration. Original 5,000 drafts remain unapproved.
