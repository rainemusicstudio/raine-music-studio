-- Raine Music Studio — database tables (Phase 1)
-- Paste this into Supabase: SQL Editor → New query → Run.

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'trial',
  start_at timestamptz not null,
  minutes int not null,
  status text not null default 'pending',   -- pending | confirmed | released | canceled
  name text not null,
  email text not null,
  focus text,
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists bookings_start_idx on bookings (start_at);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  plan text,
  preferred_times text,
  policies_version text,
  policies_agreed_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'active',     -- active | paused | canceled
  joined_at timestamptz not null default now()
);

-- Only the website's server (service key) can read or write these for now.
alter table bookings enable row level security;
alter table students enable row level security;

-- Added 2026-09-30: extra trial booking details
alter table bookings add column if not exists lesson_type text;
alter table bookings add column if not exists for_child boolean default false;
alter table bookings add column if not exists student_name text;
alter table bookings add column if not exists student_age int;
alter table bookings add column if not exists experience text;
alter table bookings add column if not exists heard_from text;
