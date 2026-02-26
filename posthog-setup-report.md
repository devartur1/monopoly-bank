<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your Monopoly Bank Next.js App Router application. Here is a summary of all changes made:

## New files created

| File | Purpose |
|------|---------|
| `instrumentation-client.ts` | Client-side PostHog initialisation via Next.js 15.3+ instrumentation hook. Enables automatic pageview tracking, session replay, and exception capture. |
| `lib/posthog-server.ts` | Server-side PostHog singleton client using `posthog-node`. Used by all API routes for server-side event capture. |

## Modified files

| File | Changes |
|------|---------|
| `next.config.ts` | Added reverse proxy rewrites (`/ingest/*` → EU PostHog hosts) and `skipTrailingSlashRedirect: true` to improve tracking reliability. |
| `app/create/page.tsx` | Added `posthog.identify()`, `game_created`, `game_creation_failed`, and `captureException` on network error. |
| `app/game/[id]/join/page.tsx` | Added `posthog.identify()`, `game_joined`, `game_join_failed`, and `captureException` on network error. |
| `app/game/[id]/page.tsx` | Added `transfer_initiated`, `bank_issue_initiated`, `transfer_completed`, `transfer_failed`, and `captureException` on network error. |
| `app/api/games/route.ts` | Added server-side `game_created_server` event via `posthog-node`. |
| `app/api/games/[id]/transactions/route.ts` | Added server-side `transaction_created` event, with `X-POSTHOG-DISTINCT-ID` header support for client–server correlation. |
| `app/api/games/[id]/players/route.ts` | Added server-side `player_joined_server` event. |

## Packages installed

- `posthog-js` — client-side analytics SDK
- `posthog-node` — server-side analytics SDK

## Environment variables set

Added to `.env.local`:
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

## Events instrumented

| Event name | Description | File |
|------------|-------------|------|
| `game_created` | User successfully creates a new Monopoly game | `app/create/page.tsx` |
| `game_creation_failed` | Game creation fails (API error or network error) | `app/create/page.tsx` |
| `game_joined` | A player successfully joins an existing game | `app/game/[id]/join/page.tsx` |
| `game_join_failed` | A player fails to join a game (e.g. name taken, network error) | `app/game/[id]/join/page.tsx` |
| `transfer_initiated` | A player opens the keyboard to initiate a transfer to another player | `app/game/[id]/page.tsx` |
| `bank_issue_initiated` | The game creator opens the keyboard to issue money from the bank | `app/game/[id]/page.tsx` |
| `transfer_completed` | A money transfer between two players completes successfully | `app/game/[id]/page.tsx` |
| `transfer_failed` | A money transfer fails (API or network error) | `app/game/[id]/page.tsx` |
| `game_created_server` | Server-side: Game successfully created and stored in MongoDB | `app/api/games/route.ts` |
| `transaction_created` | Server-side: Transaction successfully recorded in the database | `app/api/games/[id]/transactions/route.ts` |
| `player_joined_server` | Server-side: Player successfully added to a game in the database | `app/api/games/[id]/players/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- 📊 **Dashboard — Analytics basics**: https://eu.posthog.com/project/132484/dashboard/542772
  - 🔻 **Game Activation Funnel** (game created → player joined → transfer completed): https://eu.posthog.com/project/132484/insights/XByKh6AV
  - 📈 **Games & Players Over Time** (daily new games and players): https://eu.posthog.com/project/132484/insights/w2f3tBde
  - 💸 **Transfer Volume Over Time** (completed vs failed transfers): https://eu.posthog.com/project/132484/insights/5olv0nNb
  - ⚠️ **Game Creation Errors** (successes vs creation/join failures): https://eu.posthog.com/project/132484/insights/r9nfPz9E
  - 🏦 **Bank Issue vs Player Transfer** (breakdown of transfer types): https://eu.posthog.com/project/132484/insights/AieqWavq

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
