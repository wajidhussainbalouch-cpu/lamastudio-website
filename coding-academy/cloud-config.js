/* Public browser configuration only. Do not put a service_role key or password here.
 * A separate Coding Academy Supabase project and owner-reviewed SQL setup are required.
 * Until configured, every offline/local learning feature remains usable without signing in.
 */
window.LAMA_CODING_CLOUD_CONFIG = Object.freeze({
  enabled: false,
  accountDeletionEnabled: false, // Enable ONLY after the protected Edge Function passes end-to-end QA.
  url: "",
  publishableKey: "",
  table: "lama_coding_progress"
});
