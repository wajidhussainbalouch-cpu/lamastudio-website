# Lama School Suite — Communication Center handover
Updated 30 October 2026. **Read this in the next chat.** Owner requests this MD be updated after each development session. Existing data must never be erased.

## Owner's firm requirements
- Multi-school SaaS: every school has its own WhatsApp Business account, token, phone number ID, consent, recipients, and costs. Never use the LamaStudio owner's personal token for school messaging.
- Guided onboarding for nontechnical school administrators.
- Secure school isolation; student/parent data preserved.
- One-click messaging, queues, audit, delivery reports, retries, consent checks and templates are the target architecture.

## Implemented in GitHub main (not yet deployed/tested end-to-end)
- `communication-center.html`: admin-protected Communication Center; recipient preparation, notices, per-school settings; new Meta credential setup, verification, disconnect and approved-template send UI.
- `js/api-client.js`: `whatsappSettings`, `whatsappConnect`, `whatsappDisconnect`, `whatsappSendTemplates` API methods.
- `backend-api/school-whatsapp.gs`: new Apps Script file. School-admin authentication; Meta token verification; credentials in server-side Script Properties keyed by school; approved template sends to max 20 recipients per request, with consent check and duplicate phone prevention. No tokens in Sheets or browser storage.
- `backend-api/code.gs`: added WhatsApp actions to request dispatcher; writes require school admin and POST.
- `dashboard.html`: improved responsive module alignment, larger labels and beginner quick actions.

## CRITICAL outstanding integration
- **The master file `backend-api/Lama_School_Suite_Master_Updated_30_Oct_2026.gs` has NOT been patched with WhatsApp dispatcher actions**. An attempted connector update was blocked. The owner uses this master for Apps Script. Until patched, the new UI cannot call WhatsApp backend actions.
- The new `backend-api/school-whatsapp.gs` MUST be copied into the same Apps Script project as the master and redeployed.
- Student consent columns `whatsappConsent` / `parentWhatsAppConsent` are NOT yet in the master schema. Send API intentionally skips students without explicit consent.
- Current Meta template send accepts no dynamic parameters; no webhook delivery verification, queue, retries, per-school delivery logs, or automatic attendance WhatsApp send yet.
- Script Properties isolate tokens by school key but are accessible to Apps Script project editors; production security should migrate to encrypted server-side secrets with restricted access.
- Never claim successful message delivery from Meta acceptance response. Never claim production deployment without verifying.
- WhatsApp credentials must be school-owned. Meta app/platform onboarding may still require platform-level app registration.

## Next session priorities
1. Safely patch master Apps Script dispatcher and student consent columns without overwriting existing data; deploy the new school-whatsapp.gs.
2. Create school-admin parent consent management UI and test a single opted-in parent using an approved Meta template.
3. Add idempotent queued broadcast, logs, webhooks, delivery statuses and retry limits.
4. Verify Vercel production dashboard/mobile design and school isolation.
5. Keep this handover Markdown current after each substantive development session.
