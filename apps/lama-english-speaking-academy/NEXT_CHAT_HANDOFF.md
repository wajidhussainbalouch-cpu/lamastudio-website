# Lama English Speaking Academy — Next Chat Handoff

Project: Native Android Kotlin / Jetpack Compose
Repository: wajidhussainbalouch-cpu/lamastudio-website
Branch: dev/lama-english-speaking-academy
Directory: apps/lama-english-speaking-academy/
Android application ID: pk.lamastudio.englishacademy

## Verified user device status
2026-11-07: User successfully installed and opened the app on Android and shared a screenshot of its original four-lesson screen. Previous Play Protect installation issue is resolved for this installation.

## Changes committed 2026-11-07
- Replaced basic screen with dark-navy/teal styled dashboard and side navigation drawer.
- Added Courses, Speaking Practice, Vocabulary, My Progress, Study Tips, Settings, Privacy Policy and About screens.
- Expanded bundled original lessons to 15 across CEFR A1, A2, B1, B2, C1 and C2; 73 quiz questions total. These are introductory samples, not complete CEFR courses.
- Preserved existing lesson IDs and local progress storage; retained text-to-speech, speaking recognition and quizzes.
- Created this handoff file for continuity.

## Outstanding
- GitHub commits and read-back verified, but Android compilation/CI and phone testing of the new UI are NOT yet verified.
- Need inspect GitHub Actions workflow, resolve any Kotlin/Compose errors, download new APK and verify on device.
- Expand every level with original pedagogically validated lessons, dialogues, vocabulary, grammar, comprehension and varied assessments. Current quiz expansion is small and some review items are simple.
- Improve accessibility, design polish, navigation, progress persistence, speech service fallback, error handling and testing.
- Create Android icon assets from approved official logo; logo was generated separately as an image in the conversation, NOT committed to repository or installed in APK.
- Draft and legally review a public privacy policy URL before Play distribution, and confirm speech-service data practices.
- No advertising SDK, payment or subscription is implemented; do not claim otherwise.
- Never merge into main, deploy Vercel, publish Play release, or replace user data without approval.

## Current workflow
.github/workflows/lama-english-academy-android.yml
GitHub Actions -> Android APK build -> artifact lama-english-academy-debug

## Working instructions
Continue on isolated dev branch. Preserve functioning app, existing data and other LamaStudio projects. Verify every write by fetching it back. Distinguish committed source from a verified APK. User wants practical speaking-first English/Urdu curriculum and professional mobile UI.
