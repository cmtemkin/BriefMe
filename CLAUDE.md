# BriefMe

Configurable morning intelligence dashboard. Aggregates weather, calendar, news, health, games, and fun facts into one personalized digest delivered via web, email, or push notification.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS v4 + shadcn/ui + Lucide icons
- **State:** Zustand
- **Database:** Supabase PostgreSQL + Drizzle ORM
- **Cache:** Upstash Redis
- **Auth:** Clerk (Google One-Tap, Apple, Microsoft SSO, Passkeys, Magic Link — NO passwords)
- **Email:** MJML + Postmark
- **Push:** Firebase Cloud Messaging
- **Payments:** Stripe
- **Hosting:** Vercel (webpack builds for serwist PWA support)
- **Monitoring:** Sentry + PostHog

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build (webpack, for serwist)
npm run start        # Start production server
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format all files
npm run type-check   # TypeScript type check
npm test             # Vitest unit tests
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright E2E tests
npm run test:screenshots  # Playwright screenshot capture
```

## Architecture

- **Widget plugin system:** Every module implements `Widget` interface in `src/lib/widgets/types.ts`
- **Widget registry:** `src/lib/widgets/registry.ts` — central registry all systems consume from
- **Route groups:** `(auth)`, `(dashboard)`, `(marketing)`, `(onboarding)`
- **API routes:** `src/app/api/` — widgets, cron, webhooks, auth

## Conventions

- Conventional commits required: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- Feature branches off main, PRs for all changes
- All file operations automated — no manual file management
- Release notes and user guide auto-update on merge to main
- Playwright auto-captures screenshots on merge to main

## Key Directories

```
src/lib/widgets/     # Widget data fetchers + registry
src/lib/db/          # Drizzle schema + Supabase client
src/lib/redis/       # Cache + rate limiting
src/lib/auth/        # Clerk helpers + OAuth tokens
src/lib/email/       # MJML render + send
src/lib/cron/        # Digest assembler + scheduler
src/lib/stripe/      # Plans, client, webhooks
src/components/ui/   # shadcn/ui primitives
src/components/widgets/  # Widget card components
scripts/             # Automation scripts (release notes, user guide, docs sync)
```

## Environment Variables

See `.env.local.example` for all required variables.
