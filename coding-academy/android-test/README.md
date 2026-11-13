# LAMA Coding Academy — Android TEST APK

This project packages only the public Coding Academy browser lessons into a small Android WebView application for **private manual device testing**, without merging the main website or activating any cloud account.

## Download / installation

1. Open the successful **LAMA Coding Academy Android Test APK** GitHub Actions run on the feature PR.
2. Under **Artifacts**, download `LAMA-Coding-Academy-Android-Test`. GitHub may require you to sign into your account.
3. Extract the downloaded ZIP. It contains `LAMA-Coding-Academy-TEST-v0.12.apk` and `SHA256SUMS.txt`.
4. On a personal Android phone running Android 7 or later, open the APK in Files. Android may request permission for the Files app to install this one test APK. Enable that specific permission only if you trust the source and understand the risk.
5. Open **LAMA Code TEST v12** and try Foundation lessons, Industry Labs, Project Studio, My Progress, the backup/export + restore flow, Urdu switching, device System Check, and optional online real Python.
6. After testing, report the exact screen, action, and any error. No private school/student records or real passwords should be entered.

This is a **debug-signed, sideloaded test build**, not a verified Play Store release. It may produce an Android security warning. Never turn off Play Protect to install it, and do not distribute it as a finished academy app. Every GitHub runner may create a different debug signing certificate: later test APKs may require uninstalling the previous app before installation, which can delete local progress. Export a private backup before uninstalling.

## Runtime and storage

- The APK bundles the academy's static lesson pages, JavaScript, icons and Python test harness. Its on-device lessons and progress use Android WebView local storage.
- The real Python engine relies on an optional, potentially large first-use Pyodide CDN download. Learners must approve the download. Offline syntax exercises work without it.
- Account signup, cloud backup, password recovery, and cloud account deletion are **not enabled**. Do not put real login credentials into the test build.
- The application uses an Android HTTPS virtual origin `https://appassets.androidplatform.net/assets/coding-academy/`. The Android client serves those paths from its packaged assets, and external links open the user's default browser.
- The Android system document picker supports choosing a JSON backup file. Blob-based exports have a best-effort save-file bridge; verify it works on the actual phone before trusting it with the only copy of any learner data.
- The app banner permanently says **ANDROID TEST BUILD**. Its package ID is `pk.lamastudio.codingacademy.testing.v12`. It installs separately from the earlier v0.11 test app, which keeps older device-local progress intact. The new test app starts with its own fresh local progress; JSON backup/import is optional and should be tested carefully.
- No live LAMA Studio domain files, database schema, Supabase project, account settings, or Play Store application are changed.

## Building

The `.github/workflows/coding-academy-android-test.yml` workflow uses pinned JDK 17, Android 35 build tools, Android Gradle Plugin 8.9.2 and Gradle 8.11.1. It runs `package_assets.py` to copy the exact public static assets listed by the academy's PWA offline cache, builds an APK, verifies its debug signature, generates a SHA-256 checksum, and uploads a GitHub Actions artifact retained for 30 days.

**Important:** A successful APK build confirms that Android packaging compiled and is signed; it is **not** confirmation that all PWA service workers, WebAssembly downloads, file exports and local storage work on every physical Android device. Test these explicitly before any production rollout.
