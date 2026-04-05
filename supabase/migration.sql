-- AdmitGH — initial schema migration
-- Run this in: Supabase Dashboard → SQL Editor

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- One row per user. Stores all profile data as typed columns + JSON blobs
-- for sparse data (grades, applied). This avoids premature normalisation.

create table if not exists public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  name        text        not null default '',
  program     text,
  electives   jsonb       not null default '[]'::jsonb,
  grades      jsonb       not null default '{}'::jsonb,
  applied     jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Applications ─────────────────────────────────────────────────────────────
-- Normalised mirror of profiles.applied — useful for server-side queries,
-- analytics, and future admin dashboards. Kept in sync by the app on write.

create table if not exists public.applications (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users (id) on delete cascade,
  university_id  integer     not null,
  status         text        not null check (status in ('Applied', 'Pending', 'Accepted', 'Rejected')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, university_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.profiles     enable row level security;
alter table public.applications enable row level security;

-- profiles: each user can only see and modify their own row
create policy "profiles: owner full access"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- applications: each user can only see and modify their own rows
create policy "applications: owner full access"
  on public.applications for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();
