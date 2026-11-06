-- REVIEW-ONLY copy of the 2026-11-06 applied private_ppsc_question_bank_drafts_rls migration.
-- Do not reapply on the live project without migration reconciliation.
CREATE TABLE public.ppsc_question_bank (
 id text primary key check(id ~ '^[A-Z0-9][A-Z0-9-]{4,79}$'),
 job_id text not null references public.ppsc_job_catalog(id) on update cascade on delete restrict,
 subject text not null check(char_length(btrim(subject)) between 3 and 100),
 topic text not null check(char_length(btrim(topic)) between 3 and 120),
 question_text text not null check(char_length(btrim(question_text)) between 30 and 1500),
 options text[] not null check(cardinality(options)=4),
 answer_index smallint not null check(answer_index between 0 and 3),
 explanation text not null check(char_length(btrim(explanation)) between 40 and 2500),
 difficulty text not null default 'intermediate' check(difficulty in ('foundation','intermediate','advanced')),
 review_status text not null default 'draft' check(review_status in ('draft','in_review','approved')),
 source_notes text not null default 'Original academy practice; verify academically before publication',
 created_by uuid not null default auth.uid() references auth.users(id),
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint ppsc_approved_has_reviewer check(review_status<>'approved' or (reviewed_by is not null and reviewed_at is not null)),
 constraint ppsc_question_choices_populated check(
 char_length(btrim(options[1])) between 1 and 400 and char_length(btrim(options[2])) between 1 and 400
 and char_length(btrim(options[3])) between 1 and 400 and char_length(btrim(options[4])) between 1 and 400)
);
CREATE UNIQUE INDEX ppsc_question_unique_stem_per_track ON public.ppsc_question_bank(job_id,lower(btrim(question_text)));
CREATE INDEX ppsc_question_job_review_subject_idx ON public.ppsc_question_bank(job_id,review_status,subject);
ALTER TABLE public.ppsc_question_bank ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ppsc_question_bank FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.ppsc_question_bank TO authenticated;
GRANT UPDATE(subject,topic,question_text,options,answer_index,explanation,difficulty,review_status,source_notes,reviewed_by,reviewed_at)
 ON public.ppsc_question_bank TO authenticated;
CREATE POLICY ppsc_questions_admin_read ON public.ppsc_question_bank FOR SELECT TO authenticated
 USING(EXISTS(SELECT 1 FROM public.ppsc_admin_members m WHERE m.user_id=(SELECT auth.uid()) AND m.role='super_admin'));
CREATE POLICY ppsc_questions_admin_insert ON public.ppsc_question_bank FOR INSERT TO authenticated
 WITH CHECK(created_by=(SELECT auth.uid()) AND review_status='draft' AND reviewed_by IS NULL AND reviewed_at IS NULL
 AND EXISTS(SELECT 1 FROM public.ppsc_admin_members m WHERE m.user_id=(SELECT auth.uid()) AND m.role='super_admin'));
CREATE POLICY ppsc_questions_admin_update ON public.ppsc_question_bank FOR UPDATE TO authenticated
 USING(EXISTS(SELECT 1 FROM public.ppsc_admin_members m WHERE m.user_id=(SELECT auth.uid()) AND m.role='super_admin'))
 WITH CHECK(EXISTS(SELECT 1 FROM public.ppsc_admin_members m WHERE m.user_id=(SELECT auth.uid()) AND m.role='super_admin'));
CREATE TRIGGER ppsc_question_bank_updated BEFORE UPDATE ON public.ppsc_question_bank
 FOR EACH ROW EXECUTE FUNCTION public.ppsc_job_catalog_touch();
