create table if not exists dashboard_sessions (
  session_id text primary key,
  user_id text not null,
  username text,
  avatar text,
  access_token text,
  refresh_token text,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

create index if not exists idx_dashboard_sessions_user_id
on dashboard_sessions(user_id);

create table if not exists bot_guilds (
  guild_id text primary key,
  guild_name text,
  joined_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists guild_settings (
  guild_id text primary key,
  guild_name text,
  log_channel_id text,
  admin_role_id text,
  language text default 'ru',
  notifications_enabled boolean default true,
  nitrado_service_id text,
  nitrado_server_name text,
  setup_completed boolean default false,
  updated_by text,
  updated_at timestamptz default now()
);
