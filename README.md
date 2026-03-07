# Tennez

A social tennis match rating platform where fans rate matches and players, write reviews, and discover the best tennis across ATP, WTA, and Grand Slams.

Inspired by [Futez](https://futez.com.br) (the same concept for football/soccer).

## What is Tennez?

Tennez sits at the intersection of a live tennis scores tracker and a social review platform. Think **Letterboxd, but for tennis matches.**

**What fans can do:**
- **Rate matches** on a 1-10 scale with sub-indicators: Entertainment, Level of Play, Umpiring, and Crowd
- **Rate individual players** per match, vote for Player of the Match or Underperformed
- **Write reviews** with upvote/downvote, filtered by fan perspective (Player A fans / Player B fans / Neutrals)
- **Follow other fans** and see their ratings in a social feed
- **Track matches** across all tournaments with live, finished, and upcoming match views
- **Discover** the best-rated matches monthly, biggest upsets, and top rivalries

**Tennis-specific features:**
- **Rivalry Engine** — Historical head-to-head ratings (e.g., "This is Alcaraz vs Sinner meeting #14")
- **Grand Slam Bracket View** — Visual tournament bracket with community ratings on every match node
- **Surface Identity** — Filter everything by Hard / Clay / Grass; see your personal surface rating preferences
- **Watch Intent** — Mark "I'm watching this" on upcoming matches with live viewer counts
- **Stat Overlays** — Toggle between Fan View (community ratings) and Stats View (official match data)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router, TypeScript)
- **Backend/DB**: Supabase (Postgres, Auth, Realtime, Storage)
- **Styling**: Tailwind CSS with a Grand Slam Theme System
- **Data Source**: API-Sport for live tennis scores, rankings, and stats

## Grand Slam Theme System

4 themes based on the Grand Slam tournaments, each with Light and Dark modes (8 variants total):

| Theme | Vibe | Default |
|-------|------|---------|
| **Australian Open** | Vibrant blue + tennis ball yellow | Yes (dark) |
| **Roland Garros** | Earthy clay orange + forest green | |
| **Wimbledon** | Classic green + purple + white | |
| **US Open** | Night navy + bold orange | |

## Project Status

**Planning phase** — the implementation plan is in [`CLAUDE_PLAN.md`](./CLAUDE_PLAN.md). Reference material from Futez is in `futez_deepdive.md` and `futez_reference_screenshots/`.

## Getting Started

Coming soon. The project scaffold (Next.js + Supabase + Tailwind) will be set up as the first build step.

## License

TBD
