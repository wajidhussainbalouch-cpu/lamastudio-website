# LAMA Studio — Release Checklist
Status: NOT RELEASE READY. No Vercel deployment or publication authorized.

## Baseline
- [x] Inspect uploaded ZIP inventory and key handoff documents.
- [x] Run ZIP scheduler and syllabus-progress unit tests (both passed on Node v22).
- [ ] Complete path-by-path comparison against latest GitHub main and resolve concurrent edits.
- [ ] Verify live Apps Script source, deployed API and persistent schema; backup before migration.

## Security
- [ ] Backend validates identity, school/campus tenancy, role, module entitlement and expiry for every operation.
- [ ] Prove cross-school isolation and deny-by-default permissions.
- [ ] Ensure answer keys and correct answers never reach student payloads.
- [ ] Verify exam timing, replay protection, attempts, concurrency and server-side grading.
- [ ] Validate signed marker IDs, duplicate-scan handling and human review.

## Functionality
- [ ] Manual syllabus works with management-only entitlement.
- [ ] Automated planner works only with examination entitlement.
- [ ] Examination-only and Marker-only onboarding have minimal shared roster support.
- [ ] A4 bilingual/RTL printing, secure answer-key printing and PDF verified.
- [ ] Immutable exam snapshots, audited scoring and parent-visible finalized results.
- [ ] Preserve old records and existing links; migration dry-run and rollback tested.

## Quality and approval
- [ ] Unit, integration, tenant isolation and end-to-end tests pass.
- [ ] Mobile/desktop accessibility and regression tests pass.
- [ ] Verify GitHub main commit and update master handoff.
- [ ] Obtain explicit deployment approval before Vercel publish.
