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
- `settings.html`: permission-aware guidance and link to `install-school.html?schoolId=...`, hidden when not approved.
- `install-school.html`: dedicated school installer/launcher; profile and link visible only if public approved endpoint succeeds.
- `api/school-pwa.js`: Vercel Node serverless endpoint at `/api/school-pwa`, with `kind=profile|manifest|icon`, reading only the approved **public** Apps Script identity. `manifest` uses a stable school-specific `id` and `start_url`, with 192/512 PNG icons from the school's uploaded logo, rendered by `sharp`.
- Root `package.json` adds pinned `sharp`. Requires Node 20.9+ and a Vercel build check. This is not currently deployed.

**Free offline attendance**
- `attendance/offline-attendance.html`: school-admin and assigned-class teacher workspace for preparing, marking, reviewing and synchronizing.
- `js/offline-attendance.js`: encrypted, per-school/per-account IndexedDB vault. PBKDF2-SHA256 key derivation (250k iterations), AES-GCM, offline password held only in memory. The service worker never caches private API responses or plaintext student records.
- Initial online preparation downloads a minimal student roster and attendance statuses using a verified **school administrator** or an authenticated **teacher session**. Teacher reads and bulk writes use explicit teacher credentials, with class/section scoping enforced by the existing backend.
- When offline, mark Present, Absent or Leave for selected students/dates. Changes are encrypted locally before a saved confirmation is shown; no server success is falsely reported.
- Each school admin and teacher account has its own separate per-device encrypted vault. When online, synchronization rereads authorized server students and attendance and compares each queued record's `baseStatus` with the current server status. Changed school records are treated as conflicts rather than overwritten. Additionally, the bulk backend checks an optional `baseStatus` precondition **under the same lock as the write** so a second-device change between fetch and save rejects the whole stale batch. The existing `bulkAttendance` endpoint upserts and validates school/teacher scope; the offline client rereads attendance to confirm each write before removing it from its encrypted queue. Ambiguous server responses do not trigger blind retries.
- `backend-api/bulk-attendance-backend.gs`: optional lock-held offline `baseStatus` check (legacy online callers unchanged).
- `backend-api/code.gs`: fixes the bulk-attendance audit actor for a verified teacher **before** the write, preventing a missing actor from falsely reporting an already-committed save as failed.
- `portals/teacher/index.html` links to the free offline attendance workspace.
- A queued local draft can be explicitly discarded after a confirmation; otherwise conflicts remain encrypted and are not silently overwritten.
- The service worker `sw.js` caches only the static offline page and scripts, version `lama-school-static-v4`; network requests and school data remain out of SW Cache Storage.
- Both School Settings and administrator Dashboard include a link. Offline work is not premium.

## Security boundaries / limitations

- This is **not** a fully audited secure offline system. The local encrypted vault protects cached records at rest against casual inspection but is not a substitute for device encryption and screen locks. Losing the offline password, clearing site data, browser eviction, uninstalling the PWA, or losing the device can destroy **unsynchronized** edits. Train schools to sync daily when possible.
- The offline password is per browser/device. A school must prepare each phone separately online. Admin session is required again for synchronization; offline entries are not server-validated until synced.
- Local sync currently covers **student attendance for school administrators and assigned-class teachers**. The teacher path and its audit-actor fix are only source-implemented: **not yet integration-tested**. Offline admissions, diary, finance, examinations and other record types require separate scoped queues, server idempotency/audit, conflict policies, and separate tests. Do NOT claim all modules are offline-ready.
- Browser `navigator.onLine` is only an availability hint; backend fetch/verification decides success. Automatic sync occurs while the page is open, unlocked and has an admin session. The **Sync now** control remains required; no promise of reliable background sync after closing the app.
- Offline queued records are not available in other portals until the backend verifies them.
- The publicly accessible premium app icon/name is intentionally public after Super Admin approval. No school emails, student data, keys or private registry fields are exposed by `getPublicSchoolPwa`.
- A Super Admin revocation prevents new authorized manifest/icon fetches; it cannot remotely remove an app icon already installed on an individual's phone.
- Every school icon is converted to a data URL under 30 KB by the **existing** Settings logo uploader. Unsupported external logo URLs must be replaced with an uploaded logo.
- Multiple installed PWAs on the same origin have distinct manifest IDs but share the `/lamastudio-school-suite/` scope; verify Android install behavior and active-window routing with two different schools before release. App-scoped browser storage still requires server-side tenant checks and user login.
- Premium icon availability is *not* enforced through existing subscription modules. Approval status is a separate Super Admin-only entitlement.

## Validation performed so far

- JavaScript syntax parsing passed for the changed `code.gs`, `super-admin-app/app.js`, `js/api-client.js`, new `api/school-pwa.js`, `js/offline-attendance.js`, `sw.js` and the inline `settings.html` scripts.
- Nine **in-memory mock tests** passed for Super Admin-only approval, default deny, per-school isolation, public-field redaction, revoke, wrong credentials and blocked schools. Six mocked serverless handler checks passed (manifest/identity/icon requests and invalid argument denial). These mocks are **not** end-to-end or live browser tests.
- Added a runnable Node mock test: `node lamastudio-school-suite/backend-api/test-school-pwa-approvals.cjs`. CI execution is not verified.
- **No Apps Script version deployment, production school record modification, Vercel build or real-device test occurred.**

## Release gates — all mandatory

1. Review branch diff and root package impact (Vercel Node runtime + `sharp`). Run Node syntax and mock tests after checking out branch; verify serverless manifest/PNG outputs with a safe non-production Apps Script deployment.
2. Back up the actual active Apps Script project, then **merge** the matching `code.gs` routes and the entire `school-pwa-approvals.gs` into that SAME project. Do not replace or reset other live modules. Publish a **new version of the existing web-app deployment**; never assume GitHub commits update Apps Script.
3. On a disposable test school, check Super Admin deny/allow/revoke and that a normal school cannot approve itself; verify that GET public branding returns 403-like application denial for an unapproved school and contains no secrets.
4. Deploy frontend/serverless only with owner approval and Vercel quota available; confirm installation page and PNG icons via real HTTPS requests. Do not independently trigger production deployment when quota is blocked.
5. On two Android phones and one iPhone, verify per-school app name/icon for two different schools, reinstallation behavior, scope/isolation, and role logins. Test missing/corrupt logos, revoked permission, and new vs existing installed apps.
6. Prepare an isolated test roster, disable network, mark attendance over multiple days, force-close/reopen, unlock, reconnect, sync, reload, and compare each row in actual Sheets. Include a deliberately racing second device and verify server-side baseline conflicts reject the whole stale batch. Test two-device conflicts, timeouts, rejected sessions, duplicated enrollment, blocked schools, and phone storage clearing.
7. Check encrypted IndexedDB is the only storage of offline records, and Cache Storage contains only static assets. Have a recovery policy for pending offline changes before schools rely on this in production.
8. Extend offline record types only after backend idempotency and role-scoped authorization are reviewed. Keep unsynced drafts visible until confirmed.

## Safe continuation

Use the feature branch and **draft PR** for review. Do not merge into `main` or claim the feature is live until server/backend/client versions are coordinated. Current school attendance stability has priority. Production student databases must never be used for destructive testing.
