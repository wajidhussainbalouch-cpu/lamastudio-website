-- LAMA Coding Academy: optional learner cloud progress (review before applying).
-- Apply ONLY to a dedicated Coding Academy Supabase project. Not applied by ChatGPT.
-- Browser clients use a publishable key, a real Supabase Auth session and strict RLS.
-- Do not mix this table into an unrelated academy/school system without explicit review.
begin;

create table if not exists public.lama_coding_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default now(),
  constraint lama_coding_snapshot_is_object check (jsonb_typeof(snapshot) = 'object'),
  constraint lama_coding_snapshot_size_limit check (octet_length(snapshot::text) <= 262144)
);

alter table public.lama_coding_progress enable row level security;

-- Do not expose learner records to public or anonymous Data API clients.
revoke all on table public.lama_coding_progress from public, anon;
grant select, insert, update, delete on table public.lama_coding_progress to authenticated;

drop policy if exists "coding_learner_read_own" on public.lama_coding_progress;
create policy "coding_learner_read_own"
  on public.lama_coding_progress for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "coding_learner_create_own" on public.lama_coding_progress;
create policy "coding_learner_create_own"
  on public.lama_coding_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "coding_learner_update_own" on public.lama_coding_progress;
create policy "coding_learner_update_own"
  on public.lama_coding_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "coding_learner_delete_own" on public.lama_coding_progress;
create policy "coding_learner_delete_own"
  on public.lama_coding_progress for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Ensure that server-side update time is authoritative, not a browser timestamp.
create or replace function public.lama_coding_set_updated_at()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lama_coding_progress_updated_at on public.lama_coding_progress;
create trigger lama_coding_progress_updated_at
before update on public.lama_coding_progress
for each row execute function public.lama_coding_set_updated_at();

commit;

-- Review with:
-- select relrowsecurity from pg_class where oid = 'public.lama_coding_progress'::regclass;
-- select policyname, cmd, roles, qual, with_check from pg_policies
--   where schemaname = 'public' and tablename = 'lama_coding_progress';
-- Test cross-account isolation using two separate authenticated test learners.
