-- REVIEW-ONLY copy of 2026-11-06 applied ppsc_registration_status_secure_sync migration.
-- Uses a private SECURITY DEFINER trigger in non-exposed schema; no candidate can override confirmation.
CREATE SCHEMA IF NOT EXISTS ppsc_private;
REVOKE ALL ON SCHEMA ppsc_private FROM PUBLIC,anon,authenticated;
CREATE TABLE public.ppsc_candidate_registrations(
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text not null,display_name text,email_confirmed_at timestamptz,
 auth_created_at timestamptz not null,last_sign_in_at timestamptz,synced_at timestamptz not null default now()
);
ALTER TABLE public.ppsc_candidate_registrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ppsc_candidate_registrations FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.ppsc_candidate_registrations TO authenticated;
CREATE POLICY ppsc_registration_admin_read ON public.ppsc_candidate_registrations FOR SELECT TO authenticated
 USING(EXISTS(SELECT 1 FROM public.ppsc_admin_members m WHERE m.user_id=(SELECT auth.uid()) AND m.role='super_admin'));
CREATE FUNCTION ppsc_private.sync_auth_user_registration() RETURNS trigger
 LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE full_name text;
BEGIN
 IF NEW.email IS NULL OR btrim(NEW.email)='' THEN RETURN NEW; END IF;
 full_name:=btrim(coalesce(NEW.raw_user_meta_data->>'full_name',''));
 INSERT INTO public.ppsc_candidate_registrations(user_id,email,display_name,email_confirmed_at,auth_created_at,last_sign_in_at,synced_at)
 VALUES(NEW.id,NEW.email,nullif(full_name,''),NEW.email_confirmed_at,NEW.created_at,NEW.last_sign_in_at,now())
 ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name,
 email_confirmed_at=excluded.email_confirmed_at,last_sign_in_at=excluded.last_sign_in_at,synced_at=now();
 IF NEW.email_confirmed_at IS NOT NULL AND char_length(full_name) BETWEEN 2 AND 120 THEN
  INSERT INTO public.ppsc_candidates(id,display_name,occupation)
  VALUES(NEW.id,full_name,left(coalesce(NEW.raw_user_meta_data->>'occupation',''),120))
  ON CONFLICT(id) DO NOTHING;
 END IF;
 RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION ppsc_private.sync_auth_user_registration() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER ppsc_sync_registration_after_auth_change
 AFTER INSERT OR UPDATE OF email,email_confirmed_at,last_sign_in_at,raw_user_meta_data ON auth.users
 FOR EACH ROW EXECUTE FUNCTION ppsc_private.sync_auth_user_registration();
