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
