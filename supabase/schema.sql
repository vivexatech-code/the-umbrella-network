-- Run this in the Supabase SQL editor.
-- The Next.js server uses the service role key, which bypasses RLS.
-- The anon key has no access to these tables.

create table if not exists public.batches (
  id text primary key,
  batch_number text not null,
  name text not null,
  start_date text not null,
  end_date text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  registration_deadline text not null,
  registration_deadline_at timestamptz not null,
  fee integer not null default 999,
  whatsapp_link text not null default '',
  drive_folder_id text not null default '',
  drive_folder_url text not null default '',
  session_info text not null default '',
  max_seats integer not null default 100,
  seats_booked integer not null default 0,
  status text not null default 'upcoming',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id text primary key,
  registration_number text not null unique,
  invoice_id text not null default '',
  batch_id text not null references public.batches(id),
  batch_number text not null,
  batch_name text not null,
  batch_date text not null,
  full_name text not null,
  email text not null,
  whatsapp_number text not null,
  qualification_level text not null,
  attempt_details text not null default '',
  amount integer not null,
  currency text not null default 'INR',
  razorpay_order_id text not null default '',
  razorpay_payment_id text not null default '',
  payment_status text not null default 'pending',
  registration_status text not null default 'pending',
  webhook_confirmed boolean not null default false,
  drive_access_status text not null default 'not_started',
  drive_access_error text not null default '',
  sheets_sync_status text not null default 'not_started',
  sheets_sync_error text not null default '',
  access_email_status text not null default 'not_started',
  access_email_error text not null default '',
  invoice_email_status text not null default 'not_started',
  invoice_email_error text not null default '',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  registration_id text not null references public.registrations(id) on delete cascade,
  razorpay_order_id text not null default '',
  razorpay_payment_id text not null default '',
  amount integer not null,
  currency text not null default 'INR',
  status text not null,
  payment_method text not null default 'razorpay',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.speakers (
  id text primary key,
  name text not null,
  firm text not null,
  domain text not null,
  image text,
  description text not null default '',
  linkedin_url text,
  status text not null default 'active'
);

create table if not exists public.testimonials (
  id text primary key,
  student_name text not null,
  designation text,
  firm text,
  domain text,
  testimonial text not null,
  image text,
  linkedin_url text,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists public.linkedin_posts (
  id text primary key,
  author_name text not null,
  avatar_url text not null default '',
  content text not null,
  media_url text not null default '',
  profile_url text not null default '',
  post_url text not null,
  posted_at timestamptz not null default now(),
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key,
  data jsonb not null
);

create table if not exists public.webhook_events (
  id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists registrations_email_batch_idx on public.registrations (email, batch_id);
create index if not exists registrations_order_idx on public.registrations (razorpay_order_id);
create index if not exists registrations_payment_idx on public.registrations (razorpay_payment_id);
create index if not exists payments_registration_idx on public.payments (registration_id);

create or replace function public.increment_batch_seats(p_batch_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.batches
  set seats_booked = seats_booked + 1, updated_at = now()
  where id = p_batch_id;
$$;

alter table public.batches enable row level security;
alter table public.registrations enable row level security;
alter table public.payments enable row level security;
alter table public.speakers enable row level security;
alter table public.testimonials enable row level security;
alter table public.linkedin_posts enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.webhook_events enable row level security;
alter table public.admins enable row level security;

revoke all on table public.batches from anon, authenticated;
revoke all on table public.registrations from anon, authenticated;
revoke all on table public.payments from anon, authenticated;
revoke all on table public.speakers from anon, authenticated;
revoke all on table public.testimonials from anon, authenticated;
revoke all on table public.linkedin_posts from anon, authenticated;
revoke all on table public.contact_messages from anon, authenticated;
revoke all on table public.site_settings from anon, authenticated;
revoke all on table public.webhook_events from anon, authenticated;
revoke all on table public.admins from anon, authenticated;
revoke all on function public.increment_batch_seats(text) from public, anon, authenticated;
