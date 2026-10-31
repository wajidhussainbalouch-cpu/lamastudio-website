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
