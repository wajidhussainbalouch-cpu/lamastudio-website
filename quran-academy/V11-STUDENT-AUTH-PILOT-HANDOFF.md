# LAMA Quran & Islamic Learning Academy — Version 11 student identity pilot

**Development branch only — NOT DEPLOYED. Keep the product name unchanged.**

## Deliverables
- Shared School Suite backend `lamastudio-school-suite/backend-api/code.gs`: generic student/teacher responses redact credentials; new student auth only for schools explicitly selected by a server-side pilot flag; student login via HTTP POST only; generic student creation in pilot schools cannot set default enrollment-number password; protected credential fields cannot be updated through generic student CRUD.
- `quran-academy/backend/school-suite-student-auth-v11.gs`: opt-in shared student authentication addon for the SAME existing School Suite student IDs, Students sheet and existing student login UI. Does not create another student registry, app-wide identity provider, or public registration.
- `lamastudio-school-suite/js/api-client.js`: short-lived student tokens use POST, not URL query parameters; optional server-side logout.
- Both student portal pages invoke acknowledged server logout.
- `quran-academy/tests/v11-pbkdf2-sanity.test.cjs`: dependency-free Node cryptography sanity check.

## Configuration (DISPOSABLE TEST SCHOOL ONLY)
Set these in Apps Script **Script Properties**, never GitHub or client HTML:
- `QURAN_V11_STUDENT_AUTH_ENABLED=true`
- `QURAN_V11_STUDENT_AUTH_SCHOOLS=<one fictional test-school ID>`
- `QURAN_V11_STUDENT_AUTH_PEPPER=<new strong random 40+ character secret>`
- `QURAN_V11_PBKDF2_ROUNDS=60000` (allowed 20000–150000; benchmark on Apps Script before use)

If the enabled flag or allowlist is absent, the normal existing student login is preserved. When a specific school IS enabled, its student login **fails closed** if the add-on or secret is missing. **Do not add real schools to the pilot allowlist.**

## Pilot provisioning
Existing School Suite school administrator must authenticate using the school-admin token and explicitly attest in-person or verified-school-record identity verification. Call POST action `quranV11ProvisionStudentAuth` for an existing fictional student's ID with a 12–128 character new password. It writes per-student salt and derived verifier in **that school's existing Students tab**, clears that student's legacy plaintext password and persistent API key, increments credential version, and writes an audit event. The child uses the **existing** School Suite student login form and receives a short-lived 15-minute cache-backed token in the existing client session field.

**Destructive migration warning:** Provisioning clears the old credential. Switching off the flag after provisioning does NOT restore the old login. Only use a disposable test sheet with backup and a tested reset strategy.

## Pilot authorization
Every student request in an enabled school must present that 15-minute token, match the authenticated school and original student ID, and pass the current credential version from the server's Students sheet. A new password provision invalidates existing sessions. The POST `quranV11StudentLogout` action invalidates one token. Failed logout during a network outage is not confirmed; the client shows an error.

The add-on uses peppered PBKDF2-HMAC-SHA256, random per-student salt and server-side secret. Google Apps Script supports HMAC byte-array calls; cache entries may expire or be evicted early. This is a **pilot design**, not an audited production identity system.

## Verification achieved
- 14/14 generic-record credential-redaction focused mock checks in prior Version 11 step.
- 23/23 simulated student-auth workflow checks run against the actual development-branch add-on and shared login/authorization source. HMAC itself was mocked for workflow tests; **do not** claim they validate production cryptography.
- Backend, addon, API client JavaScript parsed successfully. Checked POST-only student-login and pilot routes.
- A reproducible Node crypto test with an independently computed public test vector is committed, but has **not been executed in this environment**.

## Important remaining blockers
1. Run the Node test `node quran-academy/tests/v11-pbkdf2-sanity.test.cjs` and full browser tests in a cloned repository.
2. Verify actual Apps Script PBKDF2 performance at selected iteration counts. Production should be evaluated by an identity-security specialist; Argon2id or a managed shared identity provider is preferable to an unreviewed custom implementation.
3. Test real Apps Script login, practice, logout, guardian flows and multi-school isolation against **two separate disposable school spreadsheets**, never production children or their records.
4. Audit rate limiting and brute-force resilience under concurrent requests; CacheService is best effort and not sufficient by itself for production anti-abuse.
5. Audit every School Suite API response, file export and Apps Script log for legacy credentials. Rotating or revoking old persistent keys requires coordinated migration.
6. Test student record import/update, deletion, recovery, guardian consent, sign-out when offline, token expiry, reset, existing sessions and rollback.
7. Complete Quran/Tajweed/Salah content scholarly approval, licensed human recitations, children's privacy/retention policy and Android testing.
8. Obtain explicit approval before any real-school pilot or production deployment.

**Production main, Vercel, live Apps Script and school data remained unchanged by this branch.**
