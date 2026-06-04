# Paceline Run Club

A mobile-first running tracker and club platform for logging runs, joining group challenges, earning badges, and competing on leaderboards — with Strava auto-import.

## Features

- **Run logging** — log distance, duration, type and notes manually, or auto-import from Strava
- **Group challenges** — join quests with distance or run-count targets; progress tracked automatically
- **Virtual route maps** — interactive SVG routes (e.g. Norfolk Coastal Challenge) with per-runner checkpoint progress
- **Badges & trophies** — auto-awarded patches for distance milestones and consistency streaks
- **Leaderboard** — monthly rankings across distance, most runs, longest run, and streak categories
- **Strava integration** — OAuth connect, 30-day back-fill, real-time webhook for new activities
- **Profile** — avatar upload or emoji preset, running level, bio, Spotify playlist link

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase (PostgreSQL + RLS + Auth) |
| SSR auth | `@supabase/ssr` |
| Deployment | Vercel |
| Testing | Vitest |

## Project structure

```
app/                  # Next.js App Router pages
  page.tsx            # Home dashboard (+ public landing for unauth users)
  log-run/            # Manual run logging form
  runs/               # Run history with edit/delete
  challenges/         # Browse and join quests
  route-challenge/    # Interactive SVG route map
  leaderboard/        # Monthly rankings
  trophies/           # Badge cabinet
  profile/            # User profile editor
  admin/              # Admin: create challenges, manage Strava webhook
  api/                # API routes (Strava OAuth, webhook, challenge join)
components/
  paceline-ui.tsx     # Core design system (nav, progress bar, medals, icons)
  avatar-circle.tsx   # Avatar with upload/preset/fallback support
lib/
  formatting.ts       # Shared formatters: pace, distance, duration, date
  achievements.ts     # Badge definitions, streak calculation, award logic
  progress.ts         # Leaderboard update and challenge progress recalculation
  supabase.ts         # Browser Supabase client
  supabase/server.ts  # Server Supabase client + Strava helpers
__tests__/            # Vitest unit tests
proxy.ts              # Vercel edge middleware (session refresh, auth redirect)
```

## Environment variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_VERIFY_TOKEN=any-random-string-for-webhook-verification

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Supabase setup

Required tables: `users`, `runs`, `badges`, `challenges`, `challenge_participants`, `leaderboard_entries`, `route_challenges`, `route_checkpoints`.

Key RLS policies needed on `challenge_participants`:

```sql
CREATE POLICY "Users can join challenges"
ON public.challenge_participants FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all participants"
ON public.challenge_participants FOR SELECT TO authenticated
USING (true);

ALTER TABLE public.challenge_participants
ADD COLUMN IF NOT EXISTS progress numeric DEFAULT 0;
```

## Local development

```bash
npm install
npm run dev        # starts on http://localhost:3000
npm test           # run unit tests with Vitest
npm run build      # production build
```

## Deployment

The app deploys to Vercel on push to `main`.

- Session refresh runs via `proxy.ts` (Vercel edge middleware)
- Strava webhook URL: `https://your-app.vercel.app/api/strava/webhook`
- Register the webhook from the admin panel after deploying

## Roadmap

- [ ] Activity feed — event timeline for runs, badges and challenge joins
- [ ] Push notifications — streak reminders, challenge milestones
- [ ] Social — follow runners, react to runs
- [ ] Pace zones — training zones based on recent runs
- [ ] Multi-club support — separate leaderboards per club
