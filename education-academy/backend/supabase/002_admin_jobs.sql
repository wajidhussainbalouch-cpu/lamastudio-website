-- LAMA PPSC Academy, applied migration: ppsc_super_admin_job_catalog_rls (2026-11-06)
-- Reviewable source snapshot only. Do not blindly reapply to production.
-- The Supabase migration history is authoritative. Never use this for School Suite.

CREATE TABLE public.ppsc_job_catalog (
 id text PRIMARY KEY CHECK(id ~ '^[a-z0-9][a-z0-9-]{1,63}$'),
 title text NOT NULL CHECK(char_length(btrim(title)) BETWEEN 4 AND 160),
 post text NOT NULL CHECK(char_length(btrim(post)) BETWEEN 3 AND 300),
 category text NOT NULL CHECK(char_length(btrim(category)) BETWEEN 2 AND 80),
 case_no text NOT NULL DEFAULT '' CHECK(char_length(case_no)<=60),
 listing_date date,
 subjects text[] NOT NULL DEFAULT '{}'::text[] CHECK(cardinality(subjects) BETWEEN 1 AND 25),
 priority boolean NOT NULL DEFAULT false,
 priority_order integer NOT NULL DEFAULT 99 CHECK(priority_order BETWEEN 1 AND 999),
 vacancy_status text NOT NULL DEFAULT 'unverified' CHECK(vacancy_status IN ('unverified','upcoming','open','closed')),
 official_url text CHECK(official_url IS NULL OR official_url ~* '^https://(www\.)?ppsc\.gop\.pk(/|$)'),
 is_published boolean NOT NULL DEFAULT false,
 created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT ppsc_job_open_has_official_source CHECK(vacancy_status<>'open' OR official_url IS NOT NULL)
);
CREATE INDEX ppsc_job_catalog_published_priority_idx
 ON public.ppsc_job_catalog(is_published,priority DESC,priority_order,created_at DESC);
ALTER TABLE public.ppsc_job_catalog ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ppsc_job_catalog FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.ppsc_job_catalog TO anon,authenticated;
GRANT INSERT ON public.ppsc_job_catalog TO authenticated;
GRANT UPDATE(title,post,category,case_no,listing_date,subjects,priority,priority_order,vacancy_status,official_url,is_published)
 ON public.ppsc_job_catalog TO authenticated;
CREATE POLICY ppsc_jobs_public_read ON public.ppsc_job_catalog FOR SELECT TO anon,authenticated USING(is_published=true);
CREATE POLICY ppsc_jobs_admin_read ON public.ppsc_job_catalog FOR SELECT TO authenticated
 USING(EXISTS(SELECT 1 FROM public.ppsc_admin_members m WHERE m.user_id=(SELECT auth.uid()) AND m.role='super_admin'));
CREATE POLICY ppsc_jobs_admin_insert ON public.ppsc_job_catalog FOR INSERT TO authenticated
 WITH CHECK(created_by=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.ppsc_admin_members m
 WHERE m.user_id=(SELECT auth.uid()) AND m.role='super_admin'));
CREATE POLICY ppsc_jobs_admin_update ON public.ppsc_job_catalog FOR UPDATE TO authenticated
 USING(EXISTS(SELECT 1 FROM public.ppsc_admin_members m WHERE m.user_id=(SELECT auth.uid()) AND m.role='super_admin'))
 WITH CHECK(EXISTS(SELECT 1 FROM public.ppsc_admin_members m WHERE m.user_id=(SELECT auth.uid()) AND m.role='super_admin'));
CREATE FUNCTION public.ppsc_job_catalog_touch() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $fn$
BEGIN NEW.updated_at=now(); RETURN NEW; END;
$fn$;
REVOKE ALL ON FUNCTION public.ppsc_job_catalog_touch() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER ppsc_job_catalog_updated BEFORE UPDATE ON public.ppsc_job_catalog
 FOR EACH ROW EXECUTE FUNCTION public.ppsc_job_catalog_touch();
COMMENT ON TABLE public.ppsc_job_catalog IS
'Public preparation-track metadata with Super-Admin-only writes. Not a PPSC vacancy feed; no private answer keys.';
