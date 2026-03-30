-- =============================================================
-- Tennez: Initial Database Schema
-- Migration: 001_initial_schema
-- =============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =============================================================
-- CORE ENTITIES (synced from API-Sport)
-- =============================================================

create table players (
  id              uuid primary key default uuid_generate_v4(),
  api_id          integer unique not null,
  name            text not null,
  country_code    text,
  country_flag_url text,
  photo_url       text,
  ranking_atp     integer,
  ranking_wta     integer,
  tour            text check (tour in ('ATP', 'WTA', 'Challenger', 'ITF')),
  handed          text check (handed in ('Right', 'Left', 'Unknown')),
  birth_date      date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table tournaments (
  id           uuid primary key default uuid_generate_v4(),
  api_id       integer unique not null,
  name         text not null,
  country_code text,
  surface      text check (surface in ('Hard', 'Clay', 'Grass', 'Indoor Hard', 'Carpet')),
  category     text,
  tour         text check (tour in ('ATP', 'WTA', 'Grand Slam', 'Challenger', 'ITF')),
  logo_url     text,
  start_date   date,
  end_date     date,
  created_at   timestamptz not null default now()
);

create table matches (
  id             uuid primary key default uuid_generate_v4(),
  api_id         integer unique not null,
  tournament_id  uuid references tournaments(id) on delete set null,
  player1_id     uuid references players(id) on delete set null,
  player2_id     uuid references players(id) on delete set null,
  round          text,
  status         text not null default 'upcoming'
                   check (status in ('live', 'finished', 'upcoming', 'cancelled')),
  scheduled_at   timestamptz,
  surface        text check (surface in ('Hard', 'Clay', 'Grass', 'Indoor Hard', 'Carpet')),
  sets_json      jsonb,
  winner_id      uuid references players(id) on delete set null,
  player1_seed   integer,
  player2_seed   integer,
  court_name     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- =============================================================
-- USER-GENERATED CONTENT
-- =============================================================

create table profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  username         text unique not null,
  display_name     text,
  avatar_url       text,
  bio              text,
  country_code     text,
  theme_preference text not null default 'ao-dark',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table match_ratings (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id) on delete cascade,
  match_id         uuid not null references matches(id) on delete cascade,
  overall_score    integer not null check (overall_score between 1 and 10),
  entertainment    integer check (entertainment between 1 and 10),
  level_of_play    integer check (level_of_play between 1 and 10),
  umpiring         integer check (umpiring between 1 and 10),
  crowd            integer check (crowd between 1 and 10),
  fan_of_player_id uuid references players(id) on delete set null,
  watching_on      text,
  created_at       timestamptz not null default now(),
  unique (user_id, match_id)
);

create table player_match_ratings (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  match_id   uuid not null references matches(id) on delete cascade,
  player_id  uuid not null references players(id) on delete cascade,
  score      integer not null check (score between 1 and 10),
  comment    text,
  is_potm    boolean not null default false,
  is_worst   boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, match_id, player_id)
);

create table reviews (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  match_id   uuid not null references matches(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table review_votes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  review_id   uuid not null references reviews(id) on delete cascade,
  vote_type   text not null check (vote_type in ('up', 'down')),
  created_at  timestamptz not null default now(),
  unique (user_id, review_id)
);

create table match_comments (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  match_id      uuid not null references matches(id) on delete cascade,
  body          text not null,
  score_context text,
  created_at    timestamptz not null default now()
);

create table follows (
  follower_id  uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

create table favorites_players (
  user_id    uuid not null references profiles(id) on delete cascade,
  player_id  uuid not null references players(id) on delete cascade,
  primary key (user_id, player_id)
);

create table favorites_tournaments (
  user_id       uuid not null references profiles(id) on delete cascade,
  tournament_id uuid not null references tournaments(id) on delete cascade,
  primary key (user_id, tournament_id)
);

create table favorites_matches (
  user_id  uuid not null references profiles(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  primary key (user_id, match_id)
);

create table watch_intents (
  user_id    uuid not null references profiles(id) on delete cascade,
  match_id   uuid not null references matches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

create table notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  type         text not null check (type in ('vote', 'comment', 'follow', 'match_reminder', 'upset_alert')),
  reference_id text,
  message      text not null,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

-- =============================================================
-- AGGREGATE TABLES (maintained by triggers / edge functions)
-- =============================================================

create table match_rating_aggregates (
  match_id             uuid primary key references matches(id) on delete cascade,
  avg_overall          numeric(4,2),
  avg_entertainment    numeric(4,2),
  avg_level            numeric(4,2),
  avg_umpiring         numeric(4,2),
  avg_crowd            numeric(4,2),
  total_ratings        integer not null default 0,
  rating_distribution  jsonb,
  fan_perspective      jsonb,
  updated_at           timestamptz not null default now()
);

create table player_match_aggregates (
  match_id    uuid not null references matches(id) on delete cascade,
  player_id   uuid not null references players(id) on delete cascade,
  avg_score   numeric(4,2),
  total_votes integer not null default 0,
  potm_votes  integer not null default 0,
  worst_votes integer not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (match_id, player_id)
);

-- =============================================================
-- INDEXES
-- =============================================================

create index on matches (scheduled_at, status);
create index on matches (tournament_id);
create index on matches (status);
create index on match_ratings (match_id);
create index on match_ratings (user_id);
create index on player_match_ratings (match_id);
create index on player_match_ratings (user_id);
create index on reviews (match_id);
create index on review_votes (review_id);
create index on match_comments (match_id, created_at);
create index on follows (follower_id);
create index on follows (following_id);
create index on notifications (user_id, read, created_at);

-- =============================================================
-- TRIGGERS
-- =============================================================

-- Auto-update updated_at columns
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_updated_at before update on players
  for each row execute function update_updated_at();

create trigger matches_updated_at before update on matches
  for each row execute function update_updated_at();

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger reviews_updated_at before update on reviews
  for each row execute function update_updated_at();

-- Auto-create profile on new auth user
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  _username text;
  _suffix   integer := 0;
begin
  -- Derive username from email (before @), make unique
  _username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  if _username = '' then _username := 'user'; end if;

  loop
    begin
      if _suffix = 0 then
        insert into public.profiles (id, username, display_name)
          values (new.id, _username, coalesce(new.raw_user_meta_data->>'full_name', _username));
      else
        insert into public.profiles (id, username, display_name)
          values (new.id, _username || _suffix::text, coalesce(new.raw_user_meta_data->>'full_name', _username));
      end if;
      exit;
    exception when unique_violation then
      _suffix := _suffix + 1;
    end;
  end loop;

  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table players               enable row level security;
alter table tournaments           enable row level security;
alter table matches               enable row level security;
alter table profiles              enable row level security;
alter table match_ratings         enable row level security;
alter table player_match_ratings  enable row level security;
alter table reviews               enable row level security;
alter table review_votes          enable row level security;
alter table match_comments        enable row level security;
alter table follows               enable row level security;
alter table favorites_players     enable row level security;
alter table favorites_tournaments enable row level security;
alter table favorites_matches     enable row level security;
alter table watch_intents         enable row level security;
alter table notifications         enable row level security;
alter table match_rating_aggregates  enable row level security;
alter table player_match_aggregates  enable row level security;

-- Public read for core data
create policy "Public read players"       on players        for select using (true);
create policy "Public read tournaments"   on tournaments    for select using (true);
create policy "Public read matches"       on matches        for select using (true);
create policy "Public read aggregates"    on match_rating_aggregates   for select using (true);
create policy "Public read player agg"   on player_match_aggregates   for select using (true);

-- Profiles: public read, owner update
create policy "Public read profiles"      on profiles for select using (true);
create policy "Owner update profile"      on profiles for update using (auth.uid() = id);

-- Match ratings: authenticated insert, owner update/delete
create policy "Authenticated insert match_ratings"
  on match_ratings for insert with check (auth.uid() = user_id);
create policy "Public read match_ratings"
  on match_ratings for select using (true);
create policy "Owner update match_ratings"
  on match_ratings for update using (auth.uid() = user_id);
create policy "Owner delete match_ratings"
  on match_ratings for delete using (auth.uid() = user_id);

-- Player match ratings
create policy "Authenticated insert player_match_ratings"
  on player_match_ratings for insert with check (auth.uid() = user_id);
create policy "Public read player_match_ratings"
  on player_match_ratings for select using (true);
create policy "Owner update player_match_ratings"
  on player_match_ratings for update using (auth.uid() = user_id);
create policy "Owner delete player_match_ratings"
  on player_match_ratings for delete using (auth.uid() = user_id);

-- Reviews
create policy "Authenticated insert reviews"
  on reviews for insert with check (auth.uid() = user_id);
create policy "Public read reviews"
  on reviews for select using (true);
create policy "Owner update reviews"
  on reviews for update using (auth.uid() = user_id);
create policy "Owner delete reviews"
  on reviews for delete using (auth.uid() = user_id);

-- Review votes
create policy "Authenticated insert review_votes"
  on review_votes for insert with check (auth.uid() = user_id);
create policy "Public read review_votes"
  on review_votes for select using (true);
create policy "Owner delete review_votes"
  on review_votes for delete using (auth.uid() = user_id);

-- Comments
create policy "Authenticated insert match_comments"
  on match_comments for insert with check (auth.uid() = user_id);
create policy "Public read match_comments"
  on match_comments for select using (true);
create policy "Owner delete match_comments"
  on match_comments for delete using (auth.uid() = user_id);

-- Follows
create policy "Authenticated insert follows"
  on follows for insert with check (auth.uid() = follower_id);
create policy "Public read follows"
  on follows for select using (true);
create policy "Owner delete follows"
  on follows for delete using (auth.uid() = follower_id);

-- Favorites
create policy "Authenticated manage favorites_players"
  on favorites_players for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Authenticated manage favorites_tournaments"
  on favorites_tournaments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Authenticated manage favorites_matches"
  on favorites_matches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Watch intents
create policy "Authenticated manage watch_intents"
  on watch_intents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read watch_intents"
  on watch_intents for select using (true);

-- Notifications: owner only
create policy "Owner read notifications"
  on notifications for select using (auth.uid() = user_id);
create policy "Owner update notifications"
  on notifications for update using (auth.uid() = user_id);

-- Service role bypasses RLS for API sync inserts
create policy "Service role manage players"
  on players for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manage tournaments"
  on tournaments for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manage matches"
  on matches for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manage aggregates"
  on match_rating_aggregates for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manage player agg"
  on player_match_aggregates for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role insert notifications"
  on notifications for insert with check (auth.role() = 'service_role');
