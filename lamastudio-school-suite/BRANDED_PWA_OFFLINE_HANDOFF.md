# LAMA School Suite — Branded School PWA + Free Offline Attendance

Updated: 2026-11-09. **Status: development branch; NOT deployed, NOT production verified.**

## Confirmed product decisions

- All registered schools can use offline attendance **without paying for premium branding**.
- A school's own **installable PWA name/icon** is premium. Only authenticated **LAMA Super Admin** can grant/revoke it for an individual school. A school owner cannot turn it on by editing its school settings or a browser flag.
- After approval the school uses **Settings > Your School Mobile App**: (1) approval, (2) upload logo + save name, (3) open/share installation link. No source code, GitHub, or terminal needed.
- The branded app uses the same School Suite platform and existing portal credentials; it does not create a new independent native Android app.
- Neither pricing nor payment collection is automated by these changes. The Super Admin can grant/revoke access after applying a separate commercial policy.

## Source changes on feature/school-branded-pwa-offline-20261109

**Super Admin approval**
- `backend-api/school-pwa-approvals.gs`: extra Apps Script module, read-only/public school identity conditional on persisted Super Admin approval. Master Registry holds two new tabs: `SchoolPwaApprovals` and append-only `SchoolPwaApprovalAudit`. The default is disabled. No existing Schools rows are rewritten. Each approval write is lock-guarded.
- `backend-api/code.gs`: new actions `adminGetSchoolPwaAccess` (POST), `adminSetSchoolPwaAccess` (POST), `getSchoolPwaStatus` (POST, authenticated school), and `getPublicSchoolPwa` (GET, approved active school only). Deny privileged GET mutations. All non-public actions verify server credentials.
- `super-admin-app/app.js`: **Allow school icon / Revoke access** under an individual school's management screen. Server result must confirm approval; cannot toggle locally.
- `js/api-client.js`: authenticated school-status method and explicit teacher-scoped read/bulk attendance methods that do not fall back to a school-admin session.

**School installation**
- `settings.html`: permission-aware three-step guidance, approved school installation link, and one-tap copy/share link (hidden unless Super Admin approval and school logo are verified).
- `install-school.html`: dedicated school installer/launcher; manifest and icon link are placed in the document head for browser install discovery, but install CTA remains locked until approval response succeeds. Offline reopening displays previously verified public school name only, without promising reauthorization.
- `api/school-pwa.js`: Vercel Node serverless endpoint at `/api/school-pwa`, with `kind=profile|manifest|icon`, reading only the approved **public** Apps Script identity. `manifest` uses a stable school-specific `id` and `start_url`, with 192/512 PNG icons from the school's uploaded logo, rendered by `sharp`.
- Root `package.json` adds pinned `sharp`. Requires Node 20.9+ and a Vercel build check. This is not currently deployed.

**Free offline attendance**
- `attendance/offline-attendance.html`: school-admin and assigned-class teacher workspace for preparing, marking, reviewing and synchronizing.
- `js/offline-attendance.js`: encrypted, per-school IndexedDB vault (teacher-ID-specific; school administrators currently share the school-admin vault on that device with a separate offline password). PBKDF2-SHA256 key derivation (250k iterations), AES-GCM, offline password held only in memory. The service worker never caches private API responses or plaintext student records.
- Initial online preparation downloads a **minimal role-scoped snapshot** with school/teacher authorization and no passwords, CNICs, profile photos or other unrelated fields. Teacher reads and bulk writes use explicit teacher credentials with class/section scoping enforced on the server. The snapshot returns recent attendance (1–31 days, automatically scaled to roster size) plus up to 90 explicitly requested historical dates needed to verify pending drafts, instead of transferring all historical school records.
- When offline, mark Present, Absent or Leave for selected students/dates. Changes are encrypted locally before a saved confirmation is shown; no server success is falsely reported.
- Each teacher account has its own per-device encrypted vault. School administrators currently share one separate school-admin vault per school/device, protected by the offline password; individual school-admin isolation remains a hardening task before production. When online, synchronization rereads authorized server students and attendance and compares each queued record's `baseStatus` with the current server status. Changed school records are treated as conflicts rather than overwritten. Additionally, the bulk backend checks an optional `baseStatus` precondition **under the same lock as the write** so a second-device change between fetch and save rejects the whole stale batch. The existing `bulkAttendance` endpoint upserts and validates school/teacher scope; the offline client rereads attendance to confirm each write before removing it from its encrypted queue. Ambiguous server responses do not trigger blind retries.
- `backend-api/offline-attendance-snapshot.gs`: new read-only `offlineAttendanceSnapshot` handler. POST only, requires a verified school administrator or authenticated assigned-class teacher; limits students and returned attendance; no school data writes.
- `backend-api/bulk-attendance-backend.gs`: optional lock-held offline `baseStatus` check (legacy online callers unchanged).
- `backend-api/code.gs`: fixes the bulk-attendance audit actor for a verified teacher **before** the write, preventing a missing actor from falsely reporting an already-committed save as failed.
- `portals/teacher/index.html` links to the free offline attendance workspace using an explicit teacher role. The offline page offers a role switch when a shared device has both school-admin and teacher sessions.
- A queued local draft can be explicitly discarded after a confirmation; otherwise conflicts remain encrypted and are not silently overwritten.
- Offline daily register has a one-tap **Mark visible unmarked Present** action, up to 200 matching students, with a single encrypted local save. Existing Present/Absent/Leave and pending choices are preserved.
- User can download an **encrypted recovery backup** (JSON containing ciphertext and metadata, not plaintext roster) and restore it with the offline password on a device with no existing local vault. Import enforces exact school/role scope and refuses to overwrite any existing vault.
- The service worker `sw.js` caches only the static offline page and scripts, version `lama-school-static-v4`; network requests and school data remain out of SW Cache Storage.
- Both School Settings and administrator Dashboard include a link. Offline work is not premium.

- The browser client regression `test-offline-attendance-client.cjs` has been added and passed **12 mocked flow checks** against the current frontend source: one-tap bulk marking, encrypted storage shape, export/restore, wrong password, fail-to-overwrite protection, network failure, successful sync and readback. The test uses **deliberately simulated cryptography** and is **not** evidence of AES-GCM security, actual IndexedDB persistence, browser compatibility, or real school sync.
- `sharp@0.35.5` has been verified as a published package requiring Node.js 20.9+; actual Vercel build remains untested.

## Security boundaries / limitations

- This is **not** a fully audited secure offline system. The local encrypted vault protects cached records at rest against casual inspection but is not a substitute for device encryption and screen locks. Losing the offline password, clearing site data, browser eviction, uninstalling the PWA, or losing the device can destroy **unsynchronized** edits. Train schools to sync daily when possible.
- The offline password is per browser/device and vault; use a strong passphrase of 12 or more characters. A school must prepare each phone separately online. An authenticated school-admin or teacher session is required again for synchronization; offline entries are not server-validated until synced.
- Local sync currently covers **student attendance for school administrators and assigned-class teachers**. The teacher path and its audit-actor fix are only source-implemented: **not yet integration-tested**. Offline admissions, diary, finance, examinations and other record types require separate scoped queues, server idempotency/audit, conflict policies, and separate tests. Do NOT claim all modules are offline-ready.
- Browser `navigator.onLine` is only an availability hint; backend fetch/verification decides success. Automatic sync occurs while the page is open, unlocked and has an appropriate school-admin or teacher session. The **Sync now** control remains required; no promise of reliable background sync after closing the app.
- Offline queued records are not available in other portals until the backend verifies them.
- The publicly accessible premium app icon/name is intentionally public after Super Admin approval. No school emails, student data, keys or private registry fields are exposed by `getPublicSchoolPwa`.
- A Super Admin revocation prevents new authorized manifest/icon fetches; it cannot remotely remove an app icon already installed on an individual's phone.
- Every school icon is converted to a data URL under 30 KB by the **existing** Settings logo uploader. Unsupported external logo URLs must be replaced with an uploaded logo.
- Multiple installed PWAs on the same origin have distinct manifest IDs but share the `/lamastudio-school-suite/` scope; verify Android install behavior and active-window routing with two different schools before release. App-scoped browser storage still requires server-side tenant checks and user login.
- Premium icon availability is *not* enforced through existing subscription modules. Approval status is a separate Super Admin-only entitlement.

## Validation performed so far

- JavaScript syntax parsing passed for the changed `code.gs`, `super-admin-app/app.js`, `js/api-client.js`, new `api/school-pwa.js`, `js/offline-attendance.js`, `sw.js` and the inline `settings.html` scripts.
- Nine **in-memory mock tests** passed for Super Admin-only approval, default deny, per-school isolation, public-field redaction, revoke, wrong credentials and blocked schools. Six mocked serverless handler checks passed (manifest/identity/icon requests and invalid argument denial). These mocks are **not** end-to-end or live browser tests.
- Runnable Node mock tests: `node lamastudio-school-suite/backend-api/test-school-pwa-approvals.cjs` and `node lamastudio-school-suite/backend-api/test-offline-attendance-backend.cjs`. The latter's exact file passed an isolated mocked execution (teacher scope, stale-write prevention, role authorization, privacy and history filtering). **No live Apps Script or browser/device test.**
- **No Apps Script version deployment, production school record modification, Vercel build or real-device test occurred.**

## Release gates — all mandatory

1. Review branch diff and root package impact (Vercel Node runtime + `sharp`). Run Node syntax and mock tests after checking out branch; verify serverless manifest/PNG outputs with a safe non-production Apps Script deployment.
2. Back up the actual active Apps Script project, then **merge** the matching `code.gs` routes, `school-pwa-approvals.gs`, `offline-attendance-snapshot.gs` and updated `bulk-attendance-backend.gs` into that SAME project. Do not replace or reset other live modules. Publish a **new version of the existing web-app deployment**; never assume GitHub commits update Apps Script.
3. On a disposable test school, check Super Admin deny/allow/revoke and that a normal school cannot approve itself; verify that GET public branding returns 403-like application denial for an unapproved school and contains no secrets.
4. Deploy frontend/serverless only with owner approval and Vercel quota available; confirm installation page and PNG icons via real HTTPS requests. Do not independently trigger production deployment when quota is blocked.
5. On two Android phones and one iPhone, verify per-school app name/icon for two different schools, reinstallation behavior, scope/isolation, and role logins. Test missing/corrupt logos, revoked permission, and new vs existing installed apps.
6. Prepare an isolated test roster, disable network, mark attendance over multiple days, force-close/reopen, unlock, reconnect, sync, reload, and compare each row in actual Sheets. Include a deliberately racing second device and verify server-side baseline conflicts reject the whole stale batch. Test two-device conflicts, timeouts, rejected sessions, duplicated enrollment, blocked schools, and phone storage clearing.
7. Check encrypted IndexedDB is the only storage of offline records, and Cache Storage contains only static assets. Have a recovery policy for pending offline changes before schools rely on this in production.
8. Extend offline record types only after backend idempotency and role-scoped authorization are reviewed. Keep unsynced drafts visible until confirmed.

## Safe continuation

Use the feature branch and **draft PR** for review. Do not merge into `main` or claim the feature is live until server/backend/client versions are coordinated. Current school attendance stability has priority. Production student databases must never be used for destructive testing.

## 2026-11-09 continuation — optimized offline snapshot and installation safeguards

- New backend module `backend-api/offline-attendance-snapshot.gs` and a POST-only protected handler in `code.gs` return a minimal adaptive 1–31-day school/teacher-scoped attendance snapshot and explicit pending-date lookups (max 90 requested dates, 75,000 attendance statuses). The server still reads the relevant Google Sheet tabs; reducing the mobile response does not prove total backend latency is fixed.
- Offline client now uses this snapshot for initial preparation, conflict preflight and post-save verification, rather than downloading full attendance history into each rural phone.
- Explicit role links, in-page selector on shared devices, validation that a returned snapshot matches the logged-in school and role, and refusal to cache empty or incomplete rosters.
- PWA installer puts school-specific manifest and icons in the document head and shows the install CTA only on verified premium approval. Settings adds copy-link sharing.
- Vercel `vercel.json` includes a 25-second function duration limit for school icon generation; `sharp@0.35.5` is published and requires Node.js 20.9+. Vercel build/settings still need real verification.
- `test-offline-attendance-backend.cjs` passed in an isolated mocked runtime using the exact committed source, covering attendance write conditions and snapshot restrictions. A real device/browser + test-school end-to-end run is still outstanding.
- **This change remains draft PR #84. No merge, Apps Script deployment, Vercel production deployment, school data migration, or billing mutation.**

## 2026-11-09 continuation — recovery and quality controls

- Added school-side one-tap bulk attendance for visible unmarked students, retaining existing statuses and pending overrides.
- Added encrypted download/restore backup with school- and role-scoped validation. Restore refuses to overwrite a local vault and requires an offline passphrase (12+ characters). Never describe the backup as an automatic cloud backup.
- Added `backend-api/test-offline-attendance-client.cjs` and executed it against the exact current client source in an isolated JS test harness: 12 mocked cases passed. Mock encryption is used only for control-flow regression; real WebCrypto and IndexedDB/device tests remain mandatory.
- Administrator vault is per-school-per-device, not per individual admin account; school admins sharing a device could unlock the same vault if they share the offline password. Restrict shared-device access and evaluate per-admin vault identities before production.
- Existing draft PR #84 remains unmerged and undeployed. Main has advanced independently; reconcile conflicts before release.

## 2026-11-09 final continuation checks

- Centralized `validateVaultData` on both offline password unlock and encrypted backup restore. Requires matching school/role scope, an object attendance history, unique student IDs, valid pending dates/statuses, and bounded roster/queue sizes.
- `package.json` exposes `npm run test:school-suite`, running the three self-contained Node mock regression suites (PWA grants, backend attendance/snapshot, and browser-flow simulation).
- The exact committed frontend workflow regression was rerun after this validation hardening and **all 12 mocked scenarios passed**. No device, WebCrypto implementation, real Apps Script deployment or live database was involved.
- GitHub PR #84 remains **draft** and has substantial independent `main` branch divergence; do not use GitHub's merge button without reconciling the diff and running real integration tests.

## 2026-11-09 — Multi-tab integrity hardening (still draft)

- Offline IndexedDB writes now use **atomic compare-and-set** in a single `readwrite` transaction. The active tab retains the last encrypted vault ciphertext as its expected version; it refuses to overwrite a newer version saved by another open tab. On such a conflict, the current tab disables edits and requires **Lock** then **Unlock** to reload.
- The same CAS check also guards first-time encrypted backup restoration, preventing a race where a second tab creates a vault during restore. Successfully restored data now initializes the correct write version, so later attendance marks are saved normally. Bulk Present and backup download are disabled for stale vault state.
- Committed `lamastudio-school-suite/js/test-offline-vault-cas.cjs` with an isolated simulated IndexedDB transaction suite. It passed five mocked outcomes: first write, versioned write, stale write rejection, collision rejection, and a subsequent correct write. **This is not a real browser/IndexedDB integration result.**
- Updated `backend-api/test-offline-attendance-client.cjs` to simulate atomic `get`/nested `put`/abort semantics and reran its exact current frontend source: **12/12 mocked workflow checks passed**, including encrypted download/restore, offline bulk Present, failed sync retention and successful verified synchronization.
- The root `package.json` `npm run test:school-suite` now includes all four regression suites. Real Chrome device and school-record acceptance tests remain release blockers.

## 2026-11-09 continuation — long-offline queues and large-school response budgets

- The offline sync no longer fails when an encrypted queue spans **more than 90 unique attendance dates**. The client requests dated snapshots sequentially with a maximum of 90 days per call, deduplicates recent overlapping history and checks that the roster and statuses do not change between calls. If either changes or a request fails, all unverified drafts stay encrypted; no upload begins before preflight completes.
- The snapshot backend now scales its default recent-history window by the school roster (1–31 days; a 5,000-student roster receives about 6 days) to avoid returning excessively large payloads. The maximum explicit requested date count also scales by roster size, roughly `min(90, floor(30000 / studentCount))`. The client uses the same limit. Limits remain **90 requested days per API call** and **75,000 attendance statuses per response** as final server guards.
- Large same-day school registers are uploaded in sequential **500-record chunks**, below the Apps Script bulk-write limit of 1,500. Every chunk is read back from the server before the next is sent. After an uncertain response, later chunks are paused; remaining drafts stay encrypted and available for a controlled retry.
- New repeatable `js/test-offline-sync-batching.cjs` is included in the root `npm run test:school-suite` command (five mocked suites in total). It passed tests for 195 queued dates, 5,000-student adaptive 6-date windows, roster/status changes between snapshot pages, wrong-school responses, 502 same-day writes split 500+2, second-chunk rejection and lost acknowledgments.
- The updated `backend-api/test-offline-attendance-backend.cjs` passed its mock suite after verifying the 5,000-student budget, and the older browser workflow mock still passed **12 cases** after these changes.
- **Known limitations:** This reduces the amount sent to a rural phone, not the time needed for Apps Script to scan its underlying Google Sheets. The preflight requires multiple authenticated requests; a long queue may take time on unreliable mobile networks. A lock-held server-side baseline comparison still prevents stale offline writes. No real Android/browser/App Script/Google Sheet integration test was performed here.

## 2026-11-09 — Per-student offline sync review and safe recovery

- The offline client persists one of three review states per unsynchronized draft: `conflict` (cloud attendance changed since download), `student-changed` (student identity/enrollment no longer matches), or `unverified` (server write/readback was uncertain). None of these flags indicates the attendance was saved to the cloud.
- School admin and teacher mobile register now provide **All students / Pending sync / Needs review** filtering, red/amber attention styling and **Find next record needing review** navigation that sets the saved offline date and exact student ID. Bulk-marking Present is unavailable while filtered to avoid accidental changes.
- A conflict retains the encrypted local draft. School staff should inspect the latest official attendance online before choosing to discard or reconcile; there is deliberately **no force-overwrite cloud button**.
- `js/test-offline-sync-batching.cjs` now passes mocked tests for 195 offline dates, 502 same-day student changes in 500-record chunks, transport errors, retained cloud conflicts, persisted issue flags and direct review navigation.
- `backend-api/test-offline-attendance-client.cjs` was rerun with the current source and all **12 mocked recovery/sync scenarios passed**. Browser, device and deployed Apps Script tests are still release blockers.

## 2026-11-09 — Conflict review cycling and school-account isolation

- Fixed the **Find next record needing review** button to cycle deterministically through flagged drafts sorted by date/student ID, wrapping after the last record. Its cursor resets on locking or when all issues disappear. Previously it repeatedly opened the first flagged draft.
- Persisted the last observed server status alongside conflicting or uncertain local attendance, so staff can distinguish an offline **Present** mark from a cloud **Absent/Leave/Unmarked** value. A last-observed value is advisory and may have changed; this is not proof that the cloud was modified. Vault validation restricts accepted status values.
- Bound the offline writer to the school, teacher ID, teacher API key, and original school-admin token captured for that page. If another tab signs out, changes credentials, switches schools, or rotates an admin token, **future uploads stop**, and unresolved local drafts remain encrypted until staff re-open/unlock under the correct account.
- Added a fresh authorization check **before each 500-record write**, not merely at initial sync preflight. This prevents an account switch while earlier batches were being verified from sending the next batch under another school's credentials.
- New `js/test-offline-writer-binding.cjs` passed **10 mocked identity checks**; `js/test-offline-sync-batching.cjs` passed simulated teacher/school switching after the first 500 records, with the final two drafts retained. The existing offline-browser control-flow suite still passed **12 mocked cases**.
- Root `npm run test:school-suite` now invokes six mocked regression files. **No real Android browser/IndexedDB, Apps Script or live Google Sheet integration test was conducted.**
- Release gate: authenticate, prepare and sync on two devices against a disposable school; deliberately log out/switch teacher and school accounts mid-sync and verify the correct school's Sheets and pending encrypted queue remain isolated. Do not merge/deploy PR #84 before reconciling independent `main` work and validating the actual Apps Script project.

## 2026-11-09 — Prevent accidental sync-review dismissal

- Offline attendance choices are now disabled for drafts with `conflict`, `student-changed`, or `unverified` status. Calling the handler directly is also blocked. A repeated tap on an already-saved, non-conflicting choice is a no-op; it cannot rewrite a pending draft or clear the review marker.
- Review status remains encrypted with the draft, with the last observed cloud status shown for the administrator or teacher to compare against the offline choice. **Do not treat the observed status as necessarily current:** verification is required before discarding a local change or correcting online attendance. No forced cloud overwrite action was added.
- The **Find next record needing review** button cycles deterministically through the flagged drafts and wraps around rather than repeatedly opening the first student.
- Offline synchronization is now bound to the original school and teacher credentials, including the initial administrator token and API key; checks run before *each* upload batch. Cross-account switching stops writes and preserves unsent encrypted drafts.
- Added and ran `test-offline-writer-binding.cjs`: **10 mocked identity checks** passed. Extended `test-offline-sync-batching.cjs` to check a 502-record mid-sync account switch, conflict cycling, last-seen cloud status, and blocked unsafe edits; all mocked scenarios passed. Re-ran `test-offline-attendance-client.cjs`: **12 mocked browser-flow scenarios passed**.
- GitHub development only; **no** production deployment, full real-browser WebCrypto test, actual Apps Script synchronization, or edits to student records.
