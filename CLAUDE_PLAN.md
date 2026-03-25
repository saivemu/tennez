# Tennez — Implementation Plan

## Context

Tennez is a social tennis match rating platform inspired by Futez (futez.com.br), which does the same for football/soccer. The goal is full feature parity with Futez, adapted for tennis: fans rate matches and players, write reviews, follow other fans, and discover the best matches across ATP/WTA/Grand Slams. The reference screenshots and deep dive from Futez are in `futez_reference_screenshots/` and `futez_deepdive.md`.

**Tech stack**: Next.js 14+ (App Router, TypeScript) + Supabase (Postgres, Auth, Realtime, Storage) + Tailwind CSS + API-Sport for tennis data.

---

## Phase 1: Project Scaffold & Database Schema

### 1a. Initialize Next.js + Supabase

- `npx create-next-app@latest . --typescript --tailwind --app --src-dir`
- Install deps: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `date-fns`, `zustand`
- Set up Supabase project (remote or local via `supabase init`)
- Configure env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `API_SPORT_KEY`
- Set up Tailwind config with **Grand Slam Theme System** (see Phase 1d below)

### 1d. Grand Slam Theme System

4 themes based on Grand Slam tournaments, each with Light and Dark modes (8 total variants). Default: **Australian Open Dark**.

**Theme definitions** in `src/lib/themes/`:

```
themes/
  index.ts          — ThemeProvider (React context), theme types, CSS variable mapping
  australian-open.ts
  roland-garros.ts
  wimbledon.ts
  us-open.ts
```

| Theme | Primary | Accent | Surface | Vibe |
|-------|---------|--------|---------|------|
| **Australian Open** (default) | `#0A3B7E` (AO Blue) | `#FFD700` (Tennis Ball Yellow) | Blue hard court feel | Vibrant, electric, modern |
| **Roland Garros** | `#C84B31` (Terre battue red-orange) | `#2D5016` (Forest green) | Clay warmth | Earthy, classic, warm |
| **Wimbledon** | `#00573F` (Wimbledon green) | `#FFFFFF` (White), Secondary: `#44006B` (Wimbledon purple) | Grass elegance | Refined, traditional, clean |
| **US Open** | `#1A1A2E` (Night navy) | `#FF6B35` (US Open orange) | Night session energy | Bold, urban, high-energy |

Each theme defines these CSS custom properties (applied via `data-theme` attribute on `<html>`):

```
Dark mode:
  --bg-primary       — Main background
  --bg-card          — Card/panel background
  --bg-elevated      — Modal/dropdown background
  --text-primary     — Main text
  --text-secondary   — Muted text
  --accent           — Primary accent (buttons, highlights, rating rings)
  --accent-secondary — Secondary accent (Wimbledon purple, used for subtle highlights)
  --accent-hover     — Accent hover state
  --border           — Card borders
  --rating-low       — Red for low ratings
  --rating-mid       — Yellow/amber for mid ratings
  --rating-high      — Green for high ratings

Light mode:
  Same variables, inverted for light backgrounds with adjusted contrast
```

**Implementation**:
- **All 8 theme variants defined as CSS rulesets in `src/styles/themes.css`** using `[data-theme="ao-dark"]`, `[data-theme="ao-light"]`, etc. This keeps color definitions in CSS (clean separation) while the ThemeProvider just toggles the `data-theme` attribute on `<html>`
- `ThemeProvider` wraps the app in `layout.tsx`, reads theme preference from `localStorage` (key: `tennez-theme`) and `prefers-color-scheme` for light/dark
- Theme selector in Settings page: 4 Grand Slam cards to pick theme, plus a light/dark toggle
- All Tailwind classes use CSS variables: `bg-[var(--bg-primary)]`, `text-[var(--accent)]`, etc.
- Add `tailwind.config.ts` custom colors that reference the CSS variables so we get autocomplete: `colors: { primary: 'var(--bg-primary)', accent: 'var(--accent)', ... }`
- Store user preference in `profiles.theme_preference` column (nullable, defaults to `australian-open-dark`)
- Profiles table addition: `theme_preference text default 'australian-open-dark'`

### 1b. Supabase Database Schema

```sql
-- Core entities (synced from API)
players (id, api_id, name, country_code, country_flag_url, photo_url, ranking_atp, ranking_wta, tour, handed, birth_date, created_at, updated_at)
tournaments (id, api_id, name, country_code, surface, category, tour, logo_url, start_date, end_date, created_at)
matches (id, api_id, tournament_id FK, player1_id FK, player2_id FK, round, status [live|finished|upcoming|cancelled], scheduled_at, surface, sets_json, winner_id FK, player1_seed, player2_seed, court_name, created_at, updated_at)

-- User-generated content
profiles (id FK auth.users, username, display_name, avatar_url, bio, country_code, theme_preference text default 'australian-open-dark', created_at, updated_at)
match_ratings (id, user_id FK, match_id FK, overall_score 1-10, entertainment 1-10 nullable, level_of_play 1-10 nullable, umpiring 1-10 nullable, crowd 1-10 nullable, fan_of_player_id FK nullable, watching_on text nullable, created_at, UNIQUE(user_id, match_id))
player_match_ratings (id, user_id FK, match_id FK, player_id FK, score 1-10, comment text nullable, is_potm boolean, is_worst boolean, created_at, UNIQUE(user_id, match_id, player_id))
reviews (id, user_id FK, match_id FK, body text, created_at, updated_at)
review_votes (id, user_id FK, review_id FK, vote_type [up|down], created_at, UNIQUE(user_id, review_id))
match_comments (id, user_id FK, match_id FK, body text, score_context text nullable, created_at)
follows (follower_id FK, following_id FK, created_at, PRIMARY KEY(follower_id, following_id))
favorites_players (user_id FK, player_id FK, PRIMARY KEY)
favorites_tournaments (user_id FK, tournament_id FK, PRIMARY KEY)
favorites_matches (user_id FK, match_id FK, PRIMARY KEY)
watch_intents (user_id FK, match_id FK, created_at, PRIMARY KEY(user_id, match_id))
notifications (id, user_id FK, type [vote|comment|follow|match_reminder|upset_alert], reference_id text, message text, read boolean default false, created_at)

-- Materialized views / computed (via DB functions or triggers)
match_rating_aggregates (match_id, avg_overall, avg_entertainment, avg_level, avg_umpiring, avg_crowd, total_ratings, rating_distribution jsonb, fan_perspective jsonb)
player_match_aggregates (match_id, player_id, avg_score, total_votes, potm_votes, worst_votes)
```

**Row-Level Security (RLS)**:
- All tables: authenticated users can read; insert/update/delete restricted to own rows
- `profiles`: public read, owner update
- `match_ratings`, `player_match_ratings`, `reviews`: authenticated insert, owner update/delete
- `follows`, `favorites_*`: authenticated insert/delete on own rows
- `matches`, `players`, `tournaments`: public read, service_role insert/update (API sync)

**Key Indexes**: `matches(scheduled_at, status)`, `matches(tournament_id)`, `match_ratings(match_id)`, `match_ratings(user_id)`, `reviews(match_id)`, `follows(follower_id)`, `follows(following_id)`, `match_comments(match_id, created_at)`

### 1c. Supabase Edge Functions for Data Sync

- `sync-matches`: Runs on cron (every 5 min for live, every hour for upcoming). Calls API-Sport tennis endpoints, upserts matches/players/tournaments.
- `compute-aggregates`: Triggered after rating insert/update. Recomputes `match_rating_aggregates` and `player_match_aggregates`.
- `send-notifications`: Triggered by events (new follower, review vote, match about to start). Inserts into `notifications` table.

---

## Phase 2: Auth, Layout & Navigation

### 2a. App Router Structure

```
src/app/
  layout.tsx              — Root layout (ThemeProvider, Navbar, Supabase provider)
  page.tsx                — Home page
  matches/page.tsx        — Monthly matches view
  match/[id]/page.tsx     — Match detail page
  feed/page.tsx           — Feed (Following + Popular)
  profile/[username]/page.tsx — User profile
  settings/page.tsx       — Settings (includes theme picker)
  auth/
    login/page.tsx
    signup/page.tsx
    callback/route.ts     — OAuth callback
```

### 2b. Shared Components

```
src/components/
  layout/
    Navbar.tsx            — Top nav: logo, Home, Tournaments, Feed, GlobalSearchBar, Notifications, Profile
    GlobalSearchBar.tsx   — Inline search bar in navbar (always visible) with dropdown results panel
    NotificationDropdown.tsx
  match/
    MatchCard.tsx         — Featured carousel card (players, score, rating ring, counts)
    MatchListItem.tsx     — Row in match list (tournament grouped)
    MatchScoreCard.tsx    — Detail page header (names, flags, seeds, sets, surface)
    RatingPanel.tsx       — Average rating display + distribution chart + fan tabs
    IndicatorBadges.tsx   — Entertainment / Level / Umpiring / Crowd sub-scores
    PlayerOfMatch.tsx     — POTM + Underperformed cards
    SetBreakdown.tsx      — Per-set community sentiment
    RateMatchModal.tsx    — Multi-step rating flow (overall → indicators → players → review)
    PlayerRatingSlider.tsx — Individual player rating with POTM/Worst buttons
    MatchDiscussion.tsx   — Live comment thread with score context
    ReviewCard.tsx        — Written review with votes, streaming badge, fan filter
    RelatedMatches.tsx    — Sidebar of related matches
  feed/
    FeedCard.tsx          — Review in feed context (match header + review body + engagement)
  profile/
    ProfileHeader.tsx     — Avatar, name, handle, followers, edit/share
    OverviewTab.tsx       — Stats, charts, top players
    ReviewsTab.tsx        — User's written reviews
    PlayersTab.tsx        — Player votes with filters (tour/surface/tier/season)
    TournamentsTab.tsx    — Favorite tournaments + matches
    SurfaceStats.tsx      — Rating breakdown by surface
  settings/
    ThemePicker.tsx       — 4 Grand Slam cards + light/dark toggle
  ui/
    RatingRing.tsx        — Color-coded circular rating display (SVG)
    DateNavigator.tsx     — Prev/Today/Next day picker with calendar
    FilterPills.tsx       — Horizontal pill buttons for filter modes
    StatusBar.tsx         — Live/Finished/Upcoming counts
    Slider.tsx            — 1-10 rating slider with label
    SurfaceBadge.tsx      — Hard/Clay/Grass/Indoor chip
    StreamingBadge.tsx    — "TV · ESPN+" style badge
    Avatar.tsx
    UpvoteDownvote.tsx
```

### 2c. Auth Flow

- Supabase Auth with email/password + optional Google/Apple OAuth
- `src/lib/supabase/server.ts` — Server-side Supabase client
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/middleware.ts` — Auth middleware for protected routes
- Profile auto-created via DB trigger on `auth.users` insert

---

## Phase 3: Home Page

- **DateNavigator** at top: prev/next arrows, "Today, March 6th" center, calendar dropdown
- **Featured Match Carousel**: horizontal scroll of `MatchCard` components (top 5-6 by engagement)
- **Highlights of the Day**: top-rated player performances strip
- **Tab bar**: All / Your Matches
- **Filter pills**: Tournaments | Best | Electrifying | Most Discussed
- **Status bar**: Live (red dot) / Finished / Upcoming counts
- **Match list**: grouped by tournament (in Tournaments mode), or flat sorted list in other modes
- **Search box**: filter within today's matches by player/tournament name

Data fetching: Server component fetches matches for the selected date. Client components for interactivity (tabs, filters, date nav).

---

## Phase 4: Match Detail Page

The heart of the app. Route: `/match/[id]`

- Fetch match + ratings aggregate + player aggregates + comments + reviews on server
- **MatchScoreCard**: players, flags, seeds, set scores, surface badge, tournament/round
- **RatingPanel**: large score number + label + color ring + distribution bar chart + fan perspective tabs (All / P1 fans / P2 fans)
- **IndicatorBadges**: 4 sub-scores in a row
- **PlayerOfMatch**: POTM card (green border) + Underperformed card
- **SetBreakdown**: per-set sentiment cards (unique to tennis)
- **RateMatchModal**: triggered by "Rate Match" button
  - Step 1: Overall slider + indicator sub-sliders
  - Step 2: Rate Players (both players, each with slider + comment + POTM/Worst)
  - Step 3: Written review text box
  - Submit → inserts into `match_ratings`, `player_match_ratings`, optionally `reviews`
- **MatchDiscussion**: Supabase Realtime subscription for live comments, each stamped with score context
- **Reviews section**: paginated, filterable by fan perspective, sortable, with view toggles
- **Favorite Match** + **Share** buttons
- **RelatedMatches** sidebar: same players or tournament

---

## Phase 5: Matches (Monthly View) + Feed

### 5a. Monthly Matches (`/matches`)
- Month navigator (prev/next)
- "Most Watched" hero carousel
- "Best and Worst" section: filterable by Avg Rating / Entertainment / Level / Umpiring
- "Biggest Upsets" section (rank differential flagging)
- "Best Rivalries" section (most-discussed head-to-heads)

### 5b. Feed (`/feed`)
- Two tabs: Following / Popular
- Server-rendered with pagination (cursor-based)
- `FeedCard` shows match context + reviewer info + streaming badge + score + review excerpt + engagement counts
- Popular: sorted by vote count in recent window
- Following: reviews from followed users, chronological

---

## Phase 6: Search, Notifications, Profile, Settings

### 6a. Global Search Bar (in Navbar)
- **Always visible** in the main `layout.tsx` Navbar — a text input with a search icon, centered or right-aligned
- Typing opens a **dropdown results panel** below the bar with 3 sections: Players / Tournaments / Users
- Debounced search (300ms), min 2 chars to trigger
- Results grouped by type with icons: racket for players, trophy for tournaments, user icon for users
- Each result row is clickable → navigates to `/player/[id]`, `/tournament/[id]`, or `/profile/[username]`
- Keyboard navigation: arrow keys to move through results, Enter to select, Escape to close
- Cmd+K / Ctrl+K focuses the search bar from anywhere
- On mobile: search bar collapses to an icon, tapping it expands to full-width input overlay
- Backend: Supabase `ilike` search across `players.name`, `tournaments.name`, `profiles.username` + `profiles.display_name` in parallel, merged client-side
- Component: `src/components/layout/GlobalSearchBar.tsx`
- Hook: `src/hooks/useGlobalSearch.ts` — handles debounce, parallel queries, keyboard nav state

### 6b. Notifications
- Bell icon in nav with unread count badge
- Dropdown list of recent notifications
- Types: vote, comment, follow, match_reminder, upset_alert
- Supabase Realtime subscription for live notification updates
- Settings page controls which types are enabled

### 6c. Profile (`/profile/[username]`)
- **ProfileHeader**: avatar, name, handle, follower/following counts (clickable), Edit + Share
- **4 tabs**:
  - Overview: total matches rated, avg rating, matches/day bar chart (last 30 days), top players
  - Reviews: all written reviews, sortable by match date
  - Players: all player votes, filterable by Tour (ATP/WTA), Surface, Tournament Tier, Season, Min Rating
  - Tournaments: favorited tournaments + saved matches
- **SurfaceStats**: pie/bar chart of ratings by surface type

### 6d. Settings (`/settings`)
- **Theme Picker**: 4 Grand Slam cards (Australian Open / Roland Garros / Wimbledon / US Open) with visual preview swatches, plus a Light/Dark mode toggle. Selection saved to `profiles.theme_preference` and `localStorage`
- **Account Linking**: Link/unlink OAuth providers (Google, Apple) after account creation. Users who signed up with email can add Google login later, and vice versa
- Year Wrapped link (annual recap page)
- Language selector
- Notification preferences (toggles per type)
- Privacy Policy, Terms of Use, Community Policy links
- Logout

---

## Phase 7: Tennis-Specific Differentiators

### 7a. Rivalry Engine
- DB view: `rivalries` — pairs of players who have met 3+ times, with avg community rating per encounter
- On match detail page, show "Meeting #14 — Community rated their last 5 encounters" with mini history cards
- Route: `/rivalry/[player1_id]/[player2_id]` for full head-to-head page

### 7b. Grand Slam Tournament Mode
- During Grand Slams, activate bracket view at `/tournament/[id]/bracket`
- Visual bracket (R128 → R64 → R32 → R16 → QF → SF → F) with community rating on each match node
- Highlight "Match of the Round" per round

### 7c. Watch Intent
- "I'm watching this" button on upcoming matches
- Live viewer count shown on match cards and detail page
- Uses `watch_intents` table, count shown in real-time via Supabase Realtime

### 7d. Surface Identity
- All filter views support surface filtering (Hard/Clay/Grass)
- Profile shows surface preference breakdown
- Color-coded surface badges: green (grass), orange (clay), blue (hard), gray (indoor)

### 7e. Stat Overlays
- When API provides match stats (aces, double faults, first serve %, winners, unforced errors), display alongside community ratings on match detail page
- Toggle between "Fan View" (ratings) and "Stats View" (official data)

---

## Phase 8: Tennis Data Sync (API-Sport Integration)

### API-Sport Tennis Endpoints Used
- `GET /tennis/rankings/{type}` — ATP/WTA rankings → `players` table
- `GET /tennis/tournaments` — Tournament list → `tournaments` table
- `GET /tennis/fixtures?date={date}` — Day's matches → `matches` table
- `GET /tennis/fixtures/{id}` — Match detail/live scores → update `matches.sets_json`
- `GET /tennis/fixtures/{id}/statistics` — Match stats → stored in `matches` or separate table

### Sync Strategy
- **Supabase Edge Function** `sync-tennis-data` on pg_cron:
  - Every 2 minutes: poll live matches for score updates
  - Every 15 minutes: poll today's upcoming/finished matches
  - Daily at 00:00 UTC: sync rankings, upcoming tournaments
  - Weekly: full tournament/player refresh
- **Data mapping layer**: `src/lib/api-sport/` with typed mappers from API response to DB schema
- **Fallback**: if API-Sport is unavailable, matches show "Data unavailable" state gracefully

---

## File Structure Summary

```
src/
  app/                    — Next.js App Router pages
  styles/
    themes.css            — All 8 theme variants as [data-theme] CSS rulesets
  components/             — React components (see Phase 2b)
  lib/
    supabase/
      client.ts           — Browser Supabase client
      server.ts           — Server Supabase client
      middleware.ts        — Auth middleware
      types.ts            — Generated DB types (supabase gen types)
    api-sport/
      client.ts           — API-Sport HTTP client
      mappers.ts          — Transform API responses to DB models
      types.ts            — API-Sport response types
    themes/
      index.ts            — ThemeProvider context, useTheme hook, theme types
      australian-open.ts  — AO Blue + Yellow (default)
      roland-garros.ts    — Clay red-orange + Forest green
      wimbledon.ts        — Wimbledon green + Purple + White
      us-open.ts          — Night navy + US Open orange
    utils/
      ratings.ts          — Rating label/color helpers
      dates.ts            — Date formatting helpers
      surfaces.ts         — Surface color/label helpers
  hooks/
    useMatchRating.ts     — Rating submission logic
    useRealtimeComments.ts — Supabase Realtime subscription for match chat
    useNotifications.ts   — Realtime notification listener
    useTheme.ts           — Theme context consumer (current theme, setTheme, toggleDarkMode)
    useGlobalSearch.ts    — Debounced parallel search across players/tournaments/users + keyboard nav
  stores/
    dateStore.ts          — Zustand store for selected date
    authStore.ts          — Current user state
supabase/
  migrations/             — SQL migration files
  functions/
    sync-tennis-data/     — Edge function for API sync
    compute-aggregates/   — Edge function for rating aggregation
  seed.sql                — Development seed data
```

---

## Build Order

| Step | What | Depends On |
|------|------|------------|
| 1 | Project scaffold (Next.js + Supabase + Tailwind config) | Nothing |
| 2 | Grand Slam Theme System (4 themes x light/dark, ThemeProvider, CSS variables) | Step 1 |
| 3 | DB schema migrations + RLS policies | Step 1 |
| 4 | Auth flow (login, signup, profile creation) | Steps 1-3 |
| 5 | API-Sport sync function + seed data | Steps 1, 3 |
| 6 | Root layout + Navbar with GlobalSearchBar | Steps 2-4 |
| 7 | UI primitives (RatingRing, Slider, DateNavigator, FilterPills, SurfaceBadge) | Steps 1-2 |
| 8 | Home page (match list, carousel, highlights) | Steps 3, 5-7 |
| 9 | Match detail page (scorecard, ratings, indicators) | Steps 3, 5-7 |
| 10 | Rate match modal + player ratings | Steps 4, 9 |
| 11 | Match discussion (realtime comments) | Steps 4, 9 |
| 12 | Reviews + voting | Steps 4, 9 |
| 13 | Feed (Following + Popular) | Steps 4, 12 |
| 14 | Profile page (4 tabs) | Steps 4, 10, 12 |
| 15 | Notifications system | Steps 4, 11, 12 |
| 16 | Monthly matches page | Steps 3, 7-9 |
| 17 | Settings + theme picker + notification preferences | Steps 2, 4, 15 |
| 18 | Rivalry Engine | Steps 9, 14 |
| 19 | Grand Slam bracket view | Steps 9, 16 |
| 20 | Watch Intent + live viewer counts | Steps 4, 8 |
| 21 | Surface Stats + Stat Overlays | Steps 9, 14 |
| 22 | Year Wrapped | Steps 14, 17 |

---

## Verification & Testing

- **Build & lint gate**: `npm run build` + `npm run lint` must pass with zero errors before any PR. This is the first check for every change.
- **Unit tests**: Vitest for utility functions (rating helpers, date formatting, mappers)
- **Component tests**: React Testing Library for key components (RatingRing, RateMatchModal, MatchCard)
- **E2E tests**: Playwright for critical flows (sign up → rate a match → see it on profile → see it in feed)
- **WCAG AA contrast audit**: Verify all 8 theme variants (4 themes x light/dark) meet WCAG AA minimum contrast ratios (4.5:1 for text, 3:1 for large text/UI). Test with browser DevTools contrast checker or `axe-core` against MatchCard, Navbar, and RatingRing across every theme.
- **Manual verification**: Use Supabase local dev (`supabase start`) + seed data to test all pages
- **API sync verification**: Run sync function against API-Sport sandbox, verify data appears correctly
- **Realtime verification**: Open two browser tabs, post a comment in one, verify it appears in the other
- **Mobile responsive**: Test on mobile viewport (375px) — all pages should be usable on mobile
