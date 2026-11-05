-- LAMA PPSC Academy / Supabase Free — 001 candidate identity
-- NOT APPLIED. Run ONLY in a NEW, isolated Supabase project after review.
-- Uses public schema because Supabase REST exposes public with explicit RLS.
-- The app must never use a service_role key in the browser.
BEGIN;
CREATE TABLE IF NOT EXISTS public.ppsc_candidates (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(btrim(display_name)) BETWEEN 2 AND 120),
  occupation text CHECK (occupation IS NULL OR char_length(occupation)<=120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ppsc_candidates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ppsc_candidates FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.ppsc_candidates TO authenticated;
DROP POLICY IF EXISTS ppsc_candidate_select_self ON public.ppsc_candidates;
CREATE POLICY ppsc_candidate_select_self ON public.ppsc_candidates FOR SELECT TO authenticated USING ((select auth.uid())=id);
DROP POLICY IF EXISTS ppsc_candidate_insert_self ON public.ppsc_candidates;
CREATE POLICY ppsc_candidate_insert_self ON public.ppsc_candidates FOR INSERT TO authenticated WITH CHECK ((select auth.uid())=id AND (select auth.jwt()->>'email') IS NOT NULL AND (select auth.jwt()->>'email')=(select auth.jwt()->>'email'));
DROP POLICY IF EXISTS ppsc_candidate_update_self ON public.ppsc_candidates;
CREATE POLICY ppsc_candidate_update_self ON public.ppsc_candidates FOR UPDATE TO authenticated USING ((select auth.uid())=id) WITH CHECK ((select auth.uid())=id);
-- Prevent client updates to the identity/creation fields.
REVOKE UPDATE ON TABLE public.ppsc_candidates FROM authenticated;
GRANT UPDATE (display_name,occupation) ON TABLE public.ppsc_candidates TO authenticated;
COMMIT;
