-- Fix & Fresh production baseline
-- This file documents the production schema created for qidtxbkuyjsmbnldhyiv.
-- Apply only to a fresh Supabase project; the live project already has this schema.

create extension if not exists pgcrypto;

create type public.user_role as enum ('customer','provider','admin');
create type public.provider_status as enum ('pending','approved','suspended','rejected');
create type public.job_status as enum ('requested','matching','scheduled','en_route','in_progress','completed','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.providers (
  id uuid primary key references public.profiles(id) on delete cascade,
  status public.provider_status not null default 'pending',
  bio text,
  service_area text,
  verification_notes text,
  rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  completed_jobs integer not null default 0 check (completed_jobs >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  base_price numeric(12,2) not null default 0 check (base_price >= 0),
  market_price numeric(12,2),
  category text,
  service_type text,
  unit text,
  frequency text,
  is_add_on boolean not null default false,
  bundle_services text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  provider_id uuid references public.providers(id),
  service_id uuid references public.services(id),
  status public.job_status not null default 'requested',
  title text not null,
  description text,
  address text not null,
  scheduled_at timestamptz,
  quoted_amount numeric(12,2) not null default 0 check (quoted_amount >= 0),
  platform_fee numeric(12,2) not null default 0 check (platform_fee >= 0),
  provider_amount numeric(12,2) not null default 0 check (provider_amount >= 0),
  completion_photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_status_history (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  status public.job_status not null,
  changed_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.jobs(id) on delete cascade,
  customer_id uuid not null references public.profiles(id),
  provider_id uuid not null references public.providers(id),
  rating integer not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  body text not null check (length(trim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index jobs_customer_id_idx on public.jobs(customer_id);
create index jobs_provider_id_idx on public.jobs(provider_id);
create index jobs_status_idx on public.jobs(status);
create index jobs_customer_provider_status_idx on public.jobs(customer_id,provider_id,status);
create index jobs_service_id_idx on public.jobs(service_id);
create index messages_recipient_id_idx on public.messages(recipient_id);
create index messages_job_id_idx on public.messages(job_id);
create index messages_sender_id_idx on public.messages(sender_id);
create index job_status_history_job_id_idx on public.job_status_history(job_id);
create index job_status_history_changed_by_idx on public.job_status_history(changed_by);
create index reviews_customer_id_idx on public.reviews(customer_id);
create index reviews_provider_id_idx on public.reviews(provider_id);

alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.services enable row level security;
alter table public.jobs enable row level security;
alter table public.job_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
