# LAMA Coding Academy — Chromium Browser Smoke Tests

This folder adds **real headless Chromium interaction testing**, isolated from the
live website, Supabase, Vercel and the normal academy dependencies. These are
desktop Chromium tests with simulated phone-sized screens, **not physical Android
device tests**.

## Coverage

- Main page and real first foundation lesson: edit a draft, refresh, run sandboxed
  preview, answer the concept question, verify completion is persisted and shown
  in the unified 52-activity dashboard.
- Practice and Project Studio pages load the authored activity menus.
- Guest-account configuration disables sign-up, upload and permanent deletion
  until an approved dedicated backend is configured.
- English privacy notice and Urdu explanatory section are navigable.
- Python Lab first-run external-download permission can be dismissed. No Pyodide
  CDN fetch begins; current code is still saved after a refresh. Low-data practice
  remains available.
- Phone-sized Chromium viewports at 390px and 360px have no document-level
  horizontal overflow across the most important academy pages.
- System Check exports only anonymized diagnostic statuses.
- Actual browser service-worker activation and offline cached page navigation;
  fake recovery query URLs must not be stored in CacheStorage.

## Run locally

Requires Node.js 22+ and internet **only for installing the test browser**:

    cd coding-academy/browser-tests
    npm install
    npx playwright install chromium
    npm run smoke

The test starts a temporary HTTP server on 127.0.0.1 with a randomized free
port and serves the checked-out repository. It launches Chromium headlessly,
then closes the contexts, browser and local server. No real accounts,
real learner records, email messages, remote cloud copies or production data
are used.

The dedicated GitHub Actions workflow
.github/workflows/coding-academy-browser.yml runs these checks against draft
pull-request changes. The Playwright dependency is pinned to 1.65.0 for
test infrastructure, separate from the academy's production runtime.

## Not covered by these checks

- Physical Android hardware, RAM pressure, SIM/mobile-data availability,
  standalone PWA installation or real device accessibility testing.
- The first real Pyodide interpreter download and execution on a mobile device;
  those still require voluntary, network-aware hands-on testing.
- Supabase authentication, reset emails, database row-level access controls,
  protected account deletion or any end-to-end remote sync process. Those
  remain disabled in the academy until a dedicated project is approved.
- iOS Safari, WebKit, Firefox, licensed device testing or screen-reader testing.

A successful workflow verifies specified browser flows **on the GitHub runner**;
it does not mean the academy is production-ready or deployed.


## Phase 11 additional regression coverage

- The full backup lifecycle is exercised in actual Chromium with representative private dummy drafts for all four modules. The test downloads a JSON file, clears Coding Academy local data through its own UI, checks that other product data remains, previews/cancels a restore, confirms another restore and verifies exact round-trip values. Corrupted files are rejected.
- axe-core (pinned in the isolated test-only package) runs WCAG 2.0/2.1 A/AA checks in real mobile-viewport Chromium on all eight core Academy pages. Serious/critical findings fail CI; other findings still require review. This does not replace physical Android or real assistive-technology QA.
- The privacy table's horizontally scrollable region must be reachable by keyboard and visibly focused when active.
