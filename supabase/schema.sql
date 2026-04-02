-- NexusIntegrity Phase 2 Project Tracker
-- Run this in the Supabase SQL Editor before seeding data

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Work items
create table if not exists work_items (
  id              text primary key,
  sort_order      integer not null default 0,
  title           text not null,
  category        text not null,
  group_label     text not null,
  quoted_hrs_lo   numeric(6,1),
  quoted_hrs_hi   numeric(6,1),
  quoted_value_lo numeric(10,2),
  quoted_value_hi numeric(10,2),
  status          text not null default 'pending'
                  check (status in ('pending','ready','blocked','uat','complete')),
  actual_hrs      numeric(6,1),
  completed_date  date,
  notes           text,
  blockers        text,
  prereq          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Status change history
create table if not exists status_history (
  id            uuid primary key default gen_random_uuid(),
  work_item_id  text not null references work_items(id) on delete cascade,
  from_status   text,
  to_status     text not null,
  note          text,
  changed_by    text,
  changed_at    timestamptz not null default now()
);

-- UAT checklist items (auto-generated per work item)
create table if not exists uat_items (
  id            uuid primary key default gen_random_uuid(),
  work_item_id  text not null references work_items(id) on delete cascade,
  description   text not null,
  is_complete   boolean not null default false,
  completed_at  timestamptz,
  completed_by  text,
  sort_order    integer not null default 0
);

-- Notes/comments per work item
create table if not exists item_notes (
  id            uuid primary key default gen_random_uuid(),
  work_item_id  text not null references work_items(id) on delete cascade,
  content       text not null,
  author_email  text,
  created_at    timestamptz not null default now()
);

-- Invoices
create table if not exists invoices (
  id             uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  category       text,
  amount         numeric(10,2) not null,
  status         text not null default 'draft'
                 check (status in ('draft','sent','paid')),
  issued_date    date,
  paid_date      date,
  notes          text,
  created_at     timestamptz not null default now()
);

-- RLS: enable row level security
alter table work_items    enable row level security;
alter table status_history enable row level security;
alter table uat_items     enable row level security;
alter table item_notes    enable row level security;
alter table invoices      enable row level security;

-- Policy: authenticated users can read/write everything
-- (Tighten to role-based after users are set up)
create policy "authenticated full access" on work_items
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on status_history
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on uat_items
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on item_notes
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on invoices
  for all to authenticated using (true) with check (true);
