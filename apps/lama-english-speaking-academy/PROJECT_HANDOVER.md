# Lama English Speaking Academy — Project Handover
Updated: 2026-10-31
Status: Phase 1 source implementation underway; APK not yet built or verified.

## Isolation
Repository: wajidhussainbalouch-cpu/lamastudio-website
Development branch: dev/lama-english-speaking-academy
Project root: apps/lama-english-speaking-academy/
Do not merge, deploy, publish, or modify existing school suite files without approval. Vercel is prohibited for this project.

## Product
Android English learning app for Urdu-speaking students, teachers, job seekers, and professionals. Beginner to advanced curriculum; speaking, grammar, vocabulary, listening, quizzes, offline progress, achievements, certificates, free and optional Premium.

## Architecture decision
Kotlin, Jetpack Compose, Material 3, MVVM, Room, DataStore, Media3, Android TTS, optional on-device/system speech recognition, WorkManager, Google Play Billing. Offline-first, no required backend. AI speaking assistant is optional, opt-in and cost-gated.

## Phases
1. Foundation: Android Gradle scaffold, app navigation, themes, offline database, initial lesson schema, CI.
2. Curriculum: original CEFR-inspired lessons A1-C1/C2, Urdu explanations, editorial review and no repeated content.
3. Speaking: conversation scripts, TTS, speech recognition with clear offline capability detection, practice scoring.
4. Engagement: quizzes, challenges, rewards, progress and local certificates.
5. Monetization: free and premium entitlements, billing, privacy and optional cloud AI.
6. QA: unit/instrumented tests, accessibility, security, offline testing, build APK, device test and Play compliance review.

## Data models planned
Course, Level, Unit, Lesson, VocabularyItem, Dialogue, Exercise, QuizAttempt, LearningProgress, Reward, Certificate, Entitlement.

## Privacy and safety
No child-directed ads or unnecessary personal data; age-appropriate design, parental safeguards where applicable, privacy disclosure, consent for microphone and any cloud audio transfer, data minimization, Play Billing for digital premium features, clear ad disclosures.

## Current verified progress
- GitHub account repository list reviewed: lamastudio-website, lamaSky, lamaPhotoResizer.
- Dedicated branch created from main.
- Initial Android Gradle project, manifest and Compose activity committed.\n- Two original A1 lessons, JSON asset parser, offline quiz UI and local completion tracking committed.\n- Branch-scoped GitHub Actions APK build workflow committed at repository root; now invokes testDebugUnitTest before assembleDebug.\n- Added lesson-content validator and three JVM unit tests. These tests are committed but not yet executed.\n- This handover remains the canonical status file.
- No Gradle compilation, automated tests, APK or deployment has been performed yet.

## Next work
Verify GitHub Actions Gradle build and resolve any compile errors; note the GitHub connector cannot dispatch workflows directly; add Gradle wrapper for reproducibility, migrate progress storage to Room, extend lesson quality and tests. No APK-ready claim until build verified. No APK-ready claim until build verified.
