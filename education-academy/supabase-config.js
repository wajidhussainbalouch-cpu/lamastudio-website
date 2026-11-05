/* Safe default: no live Supabase project configured.
 * When the owner creates a free Supabase project, set URL and publishable key
 * via an approved public build-time configuration, not a private service key.
 * Keep enabled=false until migrations, email delivery, RLS and tests pass.
 */
window.LAMA_PPSC_SUPABASE=Object.freeze({
 enabled:false,
 url:'',
 publishableKey:''
});
