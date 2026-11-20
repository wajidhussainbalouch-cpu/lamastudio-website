-- LAMA Coding Academy learner profile: STAGED, NOT APPLIED.
-- Execute only on a dedicated Coding Academy Supabase project after two-user RLS QA.
-- Separate from PPSC. No birth dates, telephone, location, school IDs or public profiles.
begin;

create table if not exists public.lama_coding_learners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default ''
    constraint lama_coding_name_length check (char_length(display_name) <= 60)
    constraint lama_coding_name_no_controls check (display_name !~ '[[:cntrl:]]'),
  preferred_language text not null default 'en'
    constraint lama_coding_language check (preferred_language in ('en','ur')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lama_coding_learners enable row level security;
revoke all on table public.lama_coding_learners from public, anon;
grant select, insert, update, delete on table public.lama_coding_learners to authenticated;

drop policy if exists "coding_profile_read_self" on public.lama_coding_learners;
create policy "coding_profile_read_self" on public.lama_coding_learners
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "coding_profile_insert_self" on public.lama_coding_learners;
create policy "coding_profile_insert_self" on public.lama_coding_learners
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "coding_profile_update_self" on public.lama_coding_learners;
create policy "coding_profile_update_self" on public.lama_coding_learners
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "coding_profile_delete_self" on public.lama_coding_learners;
create policy "coding_profile_delete_self" on public.lama_coding_learners
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.lama_coding_profile_updated_at()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lama_coding_profile_updated on public.lama_coding_learners;
create trigger lama_coding_profile_updated
before update on public.lama_coding_learners
for each row execute function public.lama_coding_profile_updated_at();

commit;

-- Verify RLS, grants and policies; test with TWO different auth.users sessions.
-- No user_metadata JWT claim is trusted for authorization.
-- Profile saved ONLY by signed-in learner action; no automatic signup profile writes.
-- Deleting auth.users cascades to profile and progress via separate foreign keys.
