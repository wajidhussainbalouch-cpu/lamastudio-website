# Lama Studio School Suite — production deployment checklist

## Current state (2026-10-26)
- GitHub main is the current baseline. Do not replace it with an older ZIP.
- Backend source: `lamastudio-school-suite/backend-api/code.gs` plus the other `.gs` files in that directory.
- Frontend API endpoint is defined in `lamastudio-school-suite/js/api-client.js`.
- No production Apps Script publishing is configured by this change. This branch adds syntax checks only.
- No school rows or spreadsheets are modified by these checks.

## Before enabling automatic Apps Script publishing
1. Identify the **existing** Apps Script Script ID, the active web-app deployment ID, and the owner account. These are distinct from spreadsheet IDs.
2. Verify the deployed project's full file list and compare it against the repository. Do not run `clasp push --force` until the comparison is complete: it can replace files absent from the local project.
3. Back up the existing Apps Script project and Master Registry. Confirm `MASTER_SHEET_ID` points to the actual registry with all existing schools.
4. Verify access to Drive folder `02 — School Databases` and configure its folder ID as a script property. Do not create a new Master Registry to solve a missing-registration issue.
5. Move hard-coded credentials out of source and rotate any exposed credentials. Store deployment OAuth credentials in GitHub Actions secrets, never in code or logs.
6. Implement idempotent registration with a lock, verified registry write, and recovery of partially created school sheets; never delete orphaned sheets without an audit.
7. Add tests for registration, existing-school login, superadmin visibility, and role-specific logout.
8. Only after these checks, configure an approval-gated deployment workflow targeting the existing Apps Script deployment and verify its URL remains unchanged.

## Website deployment
Check which Vercel project/domain is connected to this repository and whether `main` automatically deploys to `lamastudio.pk`. Do not assume the repository homepage URL is the production domain.

## Data preservation rule
Never overwrite, clear, truncate, or recreate the Master Registry or school spreadsheets during code deployment. Deploy code only. Recover the three missing registrations through an audit of existing script properties, spreadsheets, and registry records before considering any account recreation.
