# Lama English Speaking Academy — Project Handover
Updated: 2026-10-31 (curriculum UI and CI refinement)
Status: Development prototype; no verified APK or revenue integration.

## Isolation
Repository: wajidhussainbalouch-cpu/lamastudio-website
Branch: dev/lama-english-speaking-academy
Root: apps/lama-english-speaking-academy/
No production merge, Vercel deployment or Play publication without authorization.

## Verified source inventory
- Native Kotlin, Jetpack Compose starter Android application.
- Four original A1 lessons (greetings, daily routine, classroom, shopping), with Urdu explanations and two quiz questions each.
- JSON lesson parser, basic local SharedPreferences completion tracking and >=70% pass rule.
- Android TextToSpeech dialogue playback source; not device-tested.
- Microphone permission declared; speech recognition UI is not implemented.
- LessonValidator and three tests; AcademyPolicy and four policy tests.
- GitHub Actions workflow source exists, but successful build and APK have not been verified.

## Deep audit findings
1. Only four lessons and eight quiz questions; insufficient for production curriculum.
2. Current level selector and data model do not provide a full A1-C2 course map.
3. Vocabulary now appears in the lesson UI; speaker labels are still lost in the parser.
4. Dialogues lose speaker labels in the parser.
5. No robust offline speech recognition, proficiency assessment, spaced repetition or Room database.
6. No AdMob SDK, real ad placements, subscription billing or verified premium entitlements.
7. TTS initialization/device availability and lifecycle need build/device validation.
8. CI pins Gradle 8.9 and installs Android SDK 35; Gradle wrapper and successful CI run are outstanding.
9. UI needs accessibility, responsive layout and commercial design review.
10. Existing lessons require editorial expansion and review for progression, accuracy and variety.

## Commercial learning architecture
- Easy A1-A2: accessible beginner courses with free ad-supported lessons.
- Medium B1-B2: free introduction and premium expansion.
- Hard C1-C2: selected free previews and premium professional modules.
- CEFR bands are curriculum alignment goals, not accredited proficiency certificates.
- Premium: ad-free experience, advanced modules and enhanced practice.
- Ads: only eligible non-child free accounts on home or lesson-completion screens; never during speaking, quizzes or certificates.
- Advertising must remain disabled until consent, age suitability, real SDK integration, testing and policy review are complete.
- Google Play Billing required for digital subscriptions; entitlement validation must not rely on a local toggle.
- No hardcoded real ad IDs, billing secrets or cloud AI keys.

## Latest committed changes
- Parsed vocabulary items and CEFR level into the lesson data model, preserving backwards-compatible constructor defaults for existing tests.
- Displayed vocabulary words, Urdu meanings and usage examples in lesson cards.
- Added beginner course completion progress bar.
- Pinned CI Gradle 8.9 and Android SDK platform 35. Builds and tests remain unverified.

## Next engineering gates
1. Establish reproducible Gradle build, run JVM tests, fix failures and verify debug APK.
2. Expand schema to include level, module, vocabulary, speaker labels and practice types.
3. Add polished course map and unlock logic, with no fake premium purchases.
4. Add AdMob test-mode integration and age-appropriate consent architecture.
5. Add Play Billing integration with entitlement verification, then professional curriculum and speaking improvements.
6. Record build/test outcomes here; do not declare release ready until verified.
