# LAMA Super Admin (private Android app)

Separate native Kotlin Android project, isolated from the School Suite website.
Branch: feature/lama-super-admin-android. Not published or deployed.

## Status
Initial Android project and private authentication/networking scaffold. **Not release ready.**
Requires validation of backend super-admin API action names and response formats,
full school/subscription/admin CRUD screens, audit and session security review,
Android CI build and installation testing. No APK has been built or verified.

## Security
No API keys are committed. Credential stays in app memory, cleared on sign-out.
The backend must enforce authorization for every read and mutation.
This initial version does not claim device binding or biometric protection.
