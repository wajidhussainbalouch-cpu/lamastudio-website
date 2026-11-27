# LAMA Studio Mail v0.1 — owner-only pilot

No paid hosting, no additional database, no billing upgrades. This source contains no credentials and is NOT a deployed mailbox. Incoming mail remains in Gmail; outgoing individual business messages use the verified Brevo sender info@lamastudio.pk. This is not a marketing sender or bulk mail tool.

## Install in a NEW standalone Apps Script project
1. Sign in to the verified destination Gmail account at https://script.google.com/ and create New project named LAMA Studio Mail. Do not alter School Suite's existing script.
2. Paste Code.gs into Code.gs. Create HTML file named Index and paste Index.html. In Project Settings enable show appsscript.json and paste manifest. Keep project private.
3. Under Project Settings > Script Properties add OWNER_EMAIL with your verified Gmail address and BREVO_API_KEY with a new Brevo API key created in your authenticated Brevo account. Never share the key in chat or commit it to GitHub. Only the owner may edit this script. API keys may have broad privileges; use restricted keys if available and revoke unused ones.
4. Deploy > New deployment > Web app. Execute as user accessing the web app; Who has access: Only myself. Confirm Google permissions (GmailApp requests broad mailbox access, but code filters messages addressed to info and does not mutate Gmail). If Only myself is unavailable do not deploy. Open /exec while signed into owner account. Owner checks fail closed if Google withholds active identity. Do not weaken checks.
5. Test from another Google account or incognito: no access. Test owner sees only mail explicitly addressed to info, not personal messages in the same thread. Check no secrets in UI or browser network. Test first outgoing message only to an account you control. Inspect actual From, Reply-To, DKIM, DMARC and any personal address exposure; reply back to confirm routing. Inspect Brevo logs for delivered/bounced status. Do not use for customers until tests pass.
6. If send times out, do not retry blindly: inspect Brevo transactional logs and manually clear PENDING_SEND in script properties only after resolving uncertain delivery. Dashboard stores last 25 accepted send metadata records, not message bodies or delivery confirmation. No Gmail Sent integration. Reply uses Re: and recipient from original Reply-To; threading not guaranteed. Incoming plain text is rendered without links/images; attachments, CC/BCC, search, persistent full sent history and PWA are not implemented. Dashboard limits sends to 100/day; other projects share Brevo's free quota. Never auto-upgrade.

Official documentation: https://developers.google.com/apps-script/guides/web ; https://developers.brevo.com/reference/send-transac-email

Deployment and live sending require owner setup. Do not publish this application in the public LAMA Studio directory or sitemap. Keep public contact links unchanged.
