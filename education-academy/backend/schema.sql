-- LAMA PPSC Academy — PostgreSQL schema draft, NOT DEPLOYED.
-- Execute only after choosing an auth provider and mapping verified user IDs.
-- This script deliberately creates NO public client grants or permissive RLS policies.
BEGIN;
CREATE SCHEMA IF NOT EXISTS ppsc_academy;

CREATE TABLE IF NOT EXISTS ppsc_academy.candidates (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  display_name text NOT NULL CHECK (length(trim(display_name)) BETWEEN 2 AND 120),
  occupation text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS candidates_email_unique ON ppsc_academy.candidates (lower(email));

CREATE TABLE IF NOT EXISTS ppsc_academy.job_tracks (
  id text PRIMARY KEY,
  title text NOT NULL,
  grade text,
  official_case_ref text,
  syllabus_source_url text,
  syllabus_verified_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','retired'))
);

CREATE TABLE IF NOT EXISTS ppsc_academy.papers (
  id uuid PRIMARY KEY,
  job_track_id text NOT NULL REFERENCES ppsc_academy.job_tracks(id),
  paper_number integer NOT NULL CHECK (paper_number>0),
  version integer NOT NULL DEFAULT 1 CHECK (version>0),
  duration_seconds integer NOT NULL CHECK (duration_seconds BETWEEN 60 AND 14400),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','retired')),
  is_free_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_track_id,paper_number,version)
);

CREATE TABLE IF NOT EXISTS ppsc_academy.questions (
  id uuid PRIMARY KEY,
  paper_id uuid NOT NULL REFERENCES ppsc_academy.papers(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position BETWEEN 1 AND 200),
  subject text NOT NULL,
  topic text,
  stem text NOT NULL,
  options jsonb NOT NULL CHECK (jsonb_typeof(options)='array' AND jsonb_array_length(options)=4),
  answer_index integer NOT NULL CHECK (answer_index BETWEEN 0 AND 3),
  explanation text NOT NULL,
  difficulty text CHECK (difficulty IN ('easy','medium','hard')),
  provenance text,
  review_status text NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft','needs_review','approved','rejected')),
  reviewed_at timestamptz,
  UNIQUE (paper_id,position)
);

CREATE TABLE IF NOT EXISTS ppsc_academy.payment_requests (
  id uuid PRIMARY KEY,
  candidate_id uuid NOT NULL REFERENCES ppsc_academy.candidates(id),
  amount_pkr integer NOT NULL CHECK (amount_pkr>0),
  reference text NOT NULL CHECK (length(reference) BETWEEN 4 AND 150),
  evidence_private_key text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status='approved' AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL) OR status<>'approved')
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_requests_reference_unique ON ppsc_academy.payment_requests (lower(reference));
CREATE INDEX IF NOT EXISTS payment_requests_status_idx ON ppsc_academy.payment_requests(status,created_at);

CREATE TABLE IF NOT EXISTS ppsc_academy.subscriptions (
  id uuid PRIMARY KEY,
  candidate_id uuid NOT NULL REFERENCES ppsc_academy.candidates(id),
  payment_request_id uuid NOT NULL UNIQUE REFERENCES ppsc_academy.payment_requests(id),
  starts_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL CHECK (expires_at>starts_at),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscriptions_candidate_dates_idx ON ppsc_academy.subscriptions(candidate_id,expires_at);

CREATE TABLE IF NOT EXISTS ppsc_academy.attempts (
  id uuid PRIMARY KEY,
  candidate_id uuid NOT NULL REFERENCES ppsc_academy.candidates(id),
  paper_id uuid NOT NULL REFERENCES ppsc_academy.papers(id),
  paper_version integer NOT NULL CHECK (paper_version>0),
  started_at timestamptz NOT NULL DEFAULT now(),
  deadline_at timestamptz NOT NULL,
  submitted_at timestamptz,
  state text NOT NULL DEFAULT 'in_progress' CHECK (state IN ('in_progress','submitted','expired','void')),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(answers)='object'),
  score_correct integer CHECK (score_correct>=0),
  score_total integer CHECK (score_total>=0),
  subject_breakdown jsonb,
  CHECK (deadline_at>started_at),
  CHECK (submitted_at IS NULL OR submitted_at>=started_at)
);
CREATE INDEX IF NOT EXISTS attempts_candidate_started_idx ON ppsc_academy.attempts(candidate_id,started_at DESC);

CREATE TABLE IF NOT EXISTS ppsc_academy.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON ppsc_academy.audit_log(created_at DESC);

-- Defense-in-depth: block direct table access unless provider-specific
-- policies and server roles are deliberately configured later.
ALTER TABLE ppsc_academy.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppsc_academy.job_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppsc_academy.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppsc_academy.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppsc_academy.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppsc_academy.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppsc_academy.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppsc_academy.audit_log ENABLE ROW LEVEL SECURITY;

COMMIT;
