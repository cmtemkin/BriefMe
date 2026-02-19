# BriefMe Roadmap

Last updated: 2026-02-19

## Current Status

BriefMe has a complete v1 foundation:

- 6 widgets (weather, calendar, news, health, games, history)
- Full auth (Clerk), payments (Stripe), email (Postmark), push (FCM)
- Dashboard, settings, onboarding, marketing/SEO pages
- PWA support, caching (Upstash Redis), error monitoring (Sentry)

**Build, lint, and type-check all pass.** No unit tests existed prior to this milestone.

---

## Phase 1: Test Coverage & Stability (done)

- [x] Fix production build (local fonts instead of Google Fonts)
- [x] Unit tests for widget registry (register, get, filter by tier, defaults)
- [x] Unit tests for Stripe plan logic (module limits, channel access, health gating)
- [x] Unit tests for cron scheduler (`isInCurrentWindow` time-window logic)
- [x] Unit tests for digest assembler (parallel fetch, error isolation)
- [x] Unit tests for email subject line generator (rotation, truncation, fallback)
- [x] Unit tests for games widget (pure data, no external API)
- [x] Unit tests for weather/news/history notification rendering
- [x] Unit tests for `fetchWithRetry` (retry, backoff, 4xx skip, timeout)
- [x] Unit tests for Zod validation schemas (all 7 schemas, 23 tests)
- [ ] Integration tests for API routes (with mocked DB/Redis)
- [ ] E2E smoke tests for critical user flows (onboarding, dashboard load)

## Phase 2: Data & Reliability (in progress)

- [ ] Add real database migrations (run `drizzle-kit generate` + `drizzle-kit migrate`)
- [x] Add health checks endpoint (`GET /api/health` — checks DB + Redis)
- [x] Implement retry logic for external API calls (`fetchWithRetry` with exponential backoff)
- [x] Input validation on all API route handlers (Zod schemas on 8 routes)
- [x] Server-side analytics tracking (PostHog HTTP API for onboarding + digest delivery)
- [ ] Add structured logging (pino or similar)
- [ ] Rate limiting on public API routes

## Phase 3: Feature Gaps (defined in plan tiers but not yet built)

- [ ] **RSS Feed widget** — custom RSS/Atom feed aggregator (Pro tier)
- [ ] **AI Summary** — LLM-generated digest summary across all widgets (Pro tier)
- [ ] **Team Digest** — shared digest for teams/orgs with role-based access (Business tier)
- [ ] **Public API** — RESTful API for programmatic digest access (Business tier)
- [x] **Analytics module** — server-side PostHog tracking + client SDK integration (done)
- [ ] **Analytics dashboard events** — wire client-side tracking into dashboard/settings UI

## Phase 4: Polish & Growth

- [ ] MJML email templates (replace inline CSS rendering)
- [ ] Proper OAuth token refresh flows (currently stores tokens but no refresh logic)
- [ ] Widget drag-and-drop reordering on dashboard
- [ ] Notification preferences (quiet hours, frequency controls)
- [ ] Onboarding A/B testing via PostHog feature flags
- [ ] Landing page conversion tracking
- [ ] Internationalization (i18n) support

## Phase 5: Scale

- [ ] Edge runtime for widget API routes (faster cold starts)
- [ ] Background job queue for digest assembly (replace cron polling)
- [ ] Multi-region Redis caching
- [ ] CDN-cached widget responses for public/shared digests
- [ ] Database connection pooling (pgBouncer or Supabase pooler)

---

## Architecture Decisions

| Decision        | Choice                     | Rationale                                              |
| --------------- | -------------------------- | ------------------------------------------------------ |
| Font loading    | `next/font/local`          | Avoids build-time network dependency on Google Fonts   |
| Test framework  | Vitest + jsdom             | Fast, native ESM, compatible with React components     |
| Widget system   | Plugin registry + metadata | Enables adding widgets without touching core code      |
| Cron approach   | Vercel cron → API route    | Simple, serverless-native, no infrastructure to manage |
| Email rendering | Inline CSS templates       | Works now; MJML upgrade planned for Phase 4            |
