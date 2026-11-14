# LAMA Coding Academy — Android TEST APK

This project packages only the public Coding Academy browser lessons into a small Android WebView application for **private manual device testing**, without merging the main website or activating any cloud account.

## Download / installation

1. Open the successful **LAMA Coding Academy Android Test APK** GitHub Actions run on the feature PR.
2. Under **Artifacts**, download `LAMA-Coding-Academy-Android-Test`. GitHub may require you to sign into your account.
3. Extract the downloaded ZIP. It contains `LAMA-Coding-Academy-TEST-v0.17.apk` and `SHA256SUMS.txt`.
4. On a personal Android phone running Android 7 or later, open the APK in Files. Android may request permission for the Files app to install this one test APK. Enable that specific permission only if you trust the source and understand the risk.
5. Open **LAMA Code TEST v17** and try Foundation lessons, Industry Labs, Project Studio, My Progress, the backup/export + restore flow, Urdu switching, device System Check, and optional online real Python.
6. After testing, report the exact screen, action, and any error. No private school/student records or real passwords should be entered.

This is a **debug-signed, sideloaded test build**, not a verified Play Store release. It may produce an Android security warning. Never turn off Play Protect to install it, and do not distribute it as a finished academy app. Every GitHub runner may create a different debug signing certificate: later test APKs may require uninstalling the previous app before installation, which can delete local progress. Export a private backup before uninstalling.

## Runtime and storage

- The APK bundles the academy's static lesson pages, JavaScript, icons and Python test harness. Its on-device lessons and progress use Android WebView local storage.
- The real Python engine relies on an optional, potentially large first-use Pyodide CDN download. Learners must approve the download. Offline syntax exercises work without it.
- Account signup, cloud backup, password recovery, and cloud account deletion are **not enabled**. Do not put real login credentials into the test build.
- The application uses an Android HTTPS virtual origin `https://appassets.androidplatform.net/assets/coding-academy/`. The Android client serves those paths from its packaged assets, and external links open the user's default browser.
- The Android system document picker supports choosing a JSON backup file. Blob-based exports have a best-effort save-file bridge; verify it works on the actual phone before trusting it with the only copy of any learner data.
- The app banner permanently says **ANDROID TEST BUILD**. Its package ID is `pk.lamastudio.codingacademy.testing.v14`. It installs separately from the earlier v0.11 test app, which keeps older device-local progress intact. The new test app starts with its own fresh local progress; JSON backup/import is optional and should be tested carefully.
- No live LAMA Studio domain files, database schema, Supabase project, account settings, or Play Store application are changed.

## Building

The `.github/workflows/coding-academy-android-test.yml` workflow uses pinned JDK 17, Android 35 build tools, Android Gradle Plugin 8.9.2 and Gradle 8.11.1. It runs `package_assets.py` to copy the exact public static assets listed by the academy's PWA offline cache, builds an APK, verifies its debug signature, generates a SHA-256 checksum, and uploads a GitHub Actions artifact retained for 30 days.

**Important:** A successful APK build confirms that Android packaging compiled and is signed; it is **not** confirmation that all PWA service workers, WebAssembly downloads, file exports and local storage work on every physical Android device. Test these explicitly before any production rollout.


## v0.14 Question Practice

The v0.14 APK bundles `quiz.html`, `quiz-data.js`, `quiz-core.js`, and `quiz.js`. It includes 150 original questions (HTML, CSS, JavaScript, Python, SQL), 10 per subject/level, 30 interactive code-piece puzzles, 35 output-prediction questions, immediate feedback and review of previous mistakes. Question progress is device-local under `lama-coding-questions-v1` and **separate** from the established 62 hands-on activity counter. Offline tests and real-device touch testing are required. v0.14 uses a new test-only package ID to install independently of older v0.11 and v0.12 APKs, preserving those older apps' stored records.


## v0.14 Question Score Portability

This test build adds explicit **Export Question Scores** and **Import Saved Scores** on the Practice Questions page. A download is a JSON file with only the 150-question scores and round history (limit: 200 KB). An imported file is validated and PREVIEWED without changing anything; restoring requires confirmation and replaces only the question-score data. A separate, confirmed clear option also affects only quiz results. Other learning module drafts, projects and cloud records are untouched.

Android's file-save bridge uses the system document picker when the WebView's blob download callback fires. Test actual save/import on your phone before relying on the only copy of any data. This build has a separate application ID to avoid overwriting prior v0.13 data, and its local storage does not automatically transfer from older test packages. Existing v0.13 apps have no built-in question-score export, so previously accumulated question scores cannot be promised to migrate automatically. Your v0.13 lessons remain in that older app unless you voluntarily export those lesson records through their separate backup feature.


## v0.15 acceptance: moving all academy learning data in one file

The Android v0.15 test APK adds a local, single-file **Complete Academy Backup**. Open **My Journey → Download complete backup**, save the JSON using Android's system file picker, and confirm it exists. In another test app install, open **My Journey → Restore complete backup**, select that file, review the preview and explicitly confirm.

This file includes all four course modules plus 150-question scores. Prior four-course backups and question-only backups remain supported through their respective original restore controls.

**Do not uninstall the older test app until you have verified the backup can be saved and restored.** A successful GitHub APK build does not prove Android's blob download/file picker works on every handset. The app remains debug-signed and separate from the live website.


## v0.16: actionable help after a wrong answer

The independent v0.16 Android TEST build introduces offline, English/Urdu lesson recommendations. Start Practice Questions, answer one question incorrectly, and tap the Practise this idea link to open a relevant lesson. The home screen lists outstanding mistakes by topic. A lesson still locked in the foundation course redirects to the next unlocked lesson, so recommendations never bypass course progression. After a correct retry, the weak-area entry disappears. No login or remote analysis is involved. Test links on a real phone before any production release.
