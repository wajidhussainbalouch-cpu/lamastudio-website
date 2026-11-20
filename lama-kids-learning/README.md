# Lama Kids Learning

Native Android, Kotlin and Jetpack Compose. Offline-first prototype under development.

## Project boundaries
This project lives only in the `lama-kids-learning/` folder of branch `develop/lama-kids-learning`. Do not merge or deploy without approval. Vercel is not required to build an Android APK.

## Build prerequisites
JDK 17, Android SDK Platform 35, Android build tools, Gradle compatible with Android Gradle Plugin 8.7.3. The Gradle wrapper has not yet been committed; run with a compatible local Gradle installation after checking dependencies.

From this directory, run `gradle :app:testDebugUnitTest :app:assembleDebug`. Only share an APK after the build actually succeeds. Never treat a GitHub commit as proof of compilation.

## Current capabilities
Grade and subject selection, selected original starter lessons, simple quiz interactions, locally stored star progress, arithmetic parent gate, math practice game. Curriculum catalog describes 40 grade-subject combinations but is NOT 40 completed courses.

## Known limitations
No verified APK, incomplete lesson coverage, basic parental gate only, no premium billing, limited game variety, no device accessibility review. No internet permission or ad SDK.

See `PROJECT_HANDOVER.md` for the maintained project status.
