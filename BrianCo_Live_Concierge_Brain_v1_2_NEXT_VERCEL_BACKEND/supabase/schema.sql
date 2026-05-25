create table if not exists customer_profiles (
  id text primary key,
  first_name text,
  profile_image_url text,
  preferred_language text,
  region text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists customer_preferences (
  customer_id text primary key references customer_profiles(id) on delete cascade,
  preferred_language text,
  region text,
  accessibility jsonb default '{}'::jsonb,
  shopping_preferences jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists conversation_turns (
  id uuid primary key default gen_random_uuid(),
  customer_id text null references customer_profiles(id) on delete set null,
  session_id text not null,
  user_message text not null,
  assistant_message text not null,
  locale text,
  region text,
  created_at timestamptz default now()
);

create index if not exists conversation_turns_session_idx on conversation_turns(session_id);
create index if not exists conversation_turns_customer_idx on conversation_turns(customer_id);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  customer_id text null references customer_profiles(id) on delete set null,
  session_id text,
  event_type text not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists analytics_events_type_idx on analytics_events(event_type);
create index if not exists analytics_events_customer_idx on analytics_events(customer_id);

create table if not exists founder_approvals (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  risk_level text not null default 'medium',
  payload jsonb not null,
  status text not null default 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
