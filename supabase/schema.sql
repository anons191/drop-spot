-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  hashed_password text,
  created_at timestamptz default now()
);

-- Events
create table events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references users(id) on delete cascade,
  title text not null,
  description text,
  category text,
  reveal_strategy text not null,  -- e.g. 'countdown', 'geofence'
  reveal_time timestamptz,
  location_info jsonb,             -- { lat, lng, address }
  created_at timestamptz default now()
);

-- Subscriptions (RSVPs)
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  alias text,                      -- burner alias
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  type text not null,              -- 'push' or 'email'
  sent_at timestamptz default now()
);

