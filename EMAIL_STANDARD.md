# LAMA Studio official email standard
Updated 27 November 2026.

## Approved sender and proposed support address
- Automated transactional mail: `no-reply@lamastudio.pk` (exact spelling; existing active Brevo sender, ID 2).
- Brevo reports `lamastudio.pk` DNS authenticated and verified, with Cloudflare as DNS provider.
- Customer support/business: `info@lamastudio.pk` is the proposed address, not yet verified for incoming mail. Do not publish it as working or set Reply-To until the route/mailbox passes a receiving and reply test.
- Keep owner Google account for private admin, recovery, internal notification destinations and forwarding. Do not blindly replace admin identities, account IDs, OAuth identities, or internal notification recipients.
- Do not use personal Gmail as the customer-facing sender once each project migration has passed its tests.

## Project sender display names
| Project | From display name |
|---|---|
| School Suite (including Smart Marker) | LAMA School Suite |
| PPSC Preparation Academy | LAMA PPSC Preparation Academy |
| Bazar | LAMA Bazar |
| Coding App | LAMA Coding |
| Quran learning app | LAMA Studio / final product name |
| Main website and other active tools | LAMA Studio or actual product name |

Only configure email for tools that need it. Never add unnecessary signup or collect user email just for branding.

## Provider and rollout
1. Brevo SMTP: smtp-relay.brevo.com, port 587; use the authenticated dashboard's SMTP login and a project-specific SMTP key where supported. Never store credentials in Git, browser code, email templates, or chat. Supabase projects: enable custom SMTP and use the exact verified From address with project display name. Verify site/redirect allowlists, preserve email confirmation and existing accounts, and test actual deliveries and links. Review rate limits and disable link rewriting if it interferes with single-use auth links.
2. School Suite: Google Apps Script MailApp cannot set an arbitrary From address. Migrate customer-facing activation/recovery/approval mail to a server-side Brevo transactional integration using Script Properties for a scoped API key. Preserve internal super-admin recipient and existing recovery/activation security. Do not email plaintext passwords. Test on a separate deployment before promoting; the repository may not include all current live backend modules.
3. Cloudflare Email Routing (or existing mail host): create info@lamastudio.pk to a verified owner inbox without disturbing existing MX/DNS or website configuration. Test inbound delivery. Configure an authorized outbound mailbox/SMTP identity separately for professional replies; forwarding alone does not configure send-as. Then update public support links, privacy/contact pages and reply-to addresses, and test again.
4. Verify actual From name and address, DKIM/SPF alignment/DMARC, inbox delivery, confirm/reset links, expiry, failure handling and no exposed secrets, separately for every live project. Do not claim launch complete before this.

## Current evidence
Brevo sender and domain verified on 27 November 2026. Bazaar has an existing active sender identity, but end-to-end live authentication mail not independently tested in this audit. School Suite source uses MailApp and personal Gmail on the contact page; academy SMTP configuration is not exposed by the connected database tools. Support address receiving and send-as remain unverified. This standard does not itself change live SMTP or email routing.

References: https://supabase.com/docs/guides/auth/auth-smtp ; https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP ; https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/
