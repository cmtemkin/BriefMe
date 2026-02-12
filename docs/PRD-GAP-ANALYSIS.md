# BriefMe — PRD Gap Analysis & Strategic Recommendations

**Date:** February 12, 2026
**Based on:** BriefMe PRD v1.0 vs. Current Codebase

---

## 1. Executive Summary

BriefMe has a solid architectural foundation. The widget plugin system, database schema, auth flow, multi-channel delivery pipeline, and monetization infrastructure are all in place. The codebase implements ~89 TypeScript files across 18 API routes, 13 page routes, 6 widgets, and a full Stripe/Clerk/Postmark/FCM integration.

However, significant gaps exist between the PRD's MVP requirements and the current implementation — primarily around **live data integration** (the dashboard uses hardcoded demo data), **test coverage** (zero unit tests), and **several P0 features** that are structurally present but not yet wired end-to-end.

**Overall PRD Completion Estimate: ~65% of Phase 1 MVP**

---

## 2. Test Suite Results

| Check                      | Status         | Details                                                          |
| -------------------------- | -------------- | ---------------------------------------------------------------- |
| **TypeScript type-check**  | PASS           | `tsc --noEmit` clean — zero errors                               |
| **ESLint**                 | PASS           | No lint errors or warnings                                       |
| **Unit tests (Vitest)**    | NO TESTS       | Pattern `tests/unit/**/*.test.{ts,tsx}` matches 0 files          |
| **E2E tests (Playwright)** | FRAMEWORK ONLY | `tests/screenshots.spec.ts` exists but no functional E2E tests   |
| **Production build**       | BLOCKED        | Google Fonts network dependency fails in offline/CI environments |

### Test Coverage Assessment

- **Unit tests: 0/89 files covered.** The test infrastructure (Vitest + Testing Library + jsdom) is correctly configured, but no test files have been written.
- **E2E tests: 0 functional tests.** Only a screenshot capture spec exists for visual regression.
- **Critical gap:** The PRD does not explicitly mandate test coverage metrics, but for a production app handling OAuth tokens, payment webhooks, and personal health data, this is a significant risk.

---

## 3. PRD P0 Requirements — Detailed Gap Analysis

### P0-1: Weather module with feels-like temperature

| Aspect                     | Status  | Notes                                                                                    |
| -------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| Widget data fetcher        | DONE    | `src/lib/widgets/weather.ts` — Open-Meteo API integration                                |
| Dashboard card UI          | DONE    | `src/components/widgets/weather-card.tsx`                                                |
| Email rendering            | DONE    | `src/lib/email/render.ts` includes weather section                                       |
| Push notification          | DONE    | `src/lib/widgets/weather.ts` includes `renderNotification()`                             |
| API route                  | DONE    | `/api/widgets/weather`                                                                   |
| **Live data on dashboard** | **GAP** | Dashboard page uses hardcoded `DEMO_WIDGETS` — never calls the API                       |
| Location auto-detect       | **GAP** | PRD specifies IP geolocation auto-detect; current implementation requires manual lat/lon |
| AQI display                | N/A     | PRD lists as optional (default: false)                                                   |

**Verdict: Structurally complete, but not wired to live data on the dashboard.**

---

### P0-2: Unified calendar showing Google + Outlook events

| Aspect                     | Status  | Notes                                                      |
| -------------------------- | ------- | ---------------------------------------------------------- |
| Google Calendar OAuth      | DONE    | `/api/auth/google-calendar` callback handler               |
| Outlook OAuth              | DONE    | `/api/auth/outlook` callback handler                       |
| Calendar data fetcher      | DONE    | `src/lib/widgets/calendar.ts` — merges both sources        |
| OAuth token storage        | DONE    | `oauthTokens` table with provider-scoped tokens            |
| Dashboard card UI          | DONE    | `src/components/widgets/calendar-card.tsx`                 |
| **Live data on dashboard** | **GAP** | Same hardcoded demo data issue                             |
| Apple Calendar (CalDAV)    | N/A     | P1, not P0                                                 |
| Conflict detection         | **GAP** | PRD mentions showing conflicts; not implemented in card UI |
| Color-coding by source     | PARTIAL | Demo data includes `source` field; card UI may use it      |

**Verdict: OAuth + API layer complete. Dashboard not consuming live data.**

---

### P0-3: News headlines from 2+ configurable sources

| Aspect                     | Status  | Notes                                                                                                       |
| -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| Guardian API integration   | DONE    | `src/lib/widgets/news.ts`                                                                                   |
| Multiple sources           | **GAP** | Only Guardian API implemented. PRD requires 2+ sources. NYT Top Stories and Newsdata.io are not integrated. |
| Category filtering         | DONE    | Configurable categories array                                                                               |
| Dashboard card UI          | DONE    | `src/components/widgets/news-card.tsx`                                                                      |
| **Live data on dashboard** | **GAP** | Hardcoded demo data                                                                                         |

**Verdict: Single-source only. Needs at least one more news API (NYT or Newsdata.io) for P0 compliance.**

---

### P0-4: NYT Games reminder with direct links

| Aspect                     | Status  | Notes                                                      |
| -------------------------- | ------- | ---------------------------------------------------------- |
| All 5 game links           | DONE    | Wordle, Connections, Strands, Mini Crossword, Spelling Bee |
| Dashboard card UI          | DONE    | `src/components/widgets/games-card.tsx`                    |
| Motivational quip          | DONE    | Rotates daily                                              |
| **Live data on dashboard** | **GAP** | Hardcoded demo data (though this widget is largely static) |

**Verdict: Functionally complete. Minimal gap — just needs live wiring.**

---

### P0-5: This Day in History fun fact

| Aspect                     | Status  | Notes                                     |
| -------------------------- | ------- | ----------------------------------------- |
| Wikimedia API integration  | DONE    | `src/lib/widgets/history.ts`              |
| Events + birthdays         | DONE    | Both fetched and rendered                 |
| Dashboard card UI          | DONE    | `src/components/widgets/history-card.tsx` |
| **Live data on dashboard** | **GAP** | Hardcoded demo data                       |

**Verdict: Structurally complete. Needs live wiring.**

---

### P0-6: User account creation and authentication

| Aspect                    | Status | Notes                                            |
| ------------------------- | ------ | ------------------------------------------------ |
| Clerk integration         | DONE   | `@clerk/nextjs` with middleware                  |
| Sign-in page              | DONE   | Google One-Tap, Apple, Microsoft, Passkeys       |
| Sign-up page              | DONE   | Same providers                                   |
| Clerk webhook (user sync) | DONE   | `/api/webhooks/clerk` creates DB user on signup  |
| Middleware protection     | DONE   | Dashboard, settings, onboarding routes protected |
| Demo mode fallback        | DONE   | Allows all routes when Clerk keys absent         |

**Verdict: Fully complete.**

---

### P0-7: Module selection and basic configuration

| Aspect                    | Status  | Notes                                                    |
| ------------------------- | ------- | -------------------------------------------------------- |
| Onboarding module picker  | DONE    | 4-step flow: modules → config → delivery → preview       |
| Module enable/disable     | DONE    | `userModules` table with enabled flag                    |
| Basic config per module   | DONE    | JSONB config column, configurable in onboarding          |
| Settings page             | DONE    | Full settings page with widget management                |
| Zustand state management  | DONE    | `preferences-store.ts` + `widget-store.ts`               |
| **Drag-and-drop reorder** | **GAP** | P1, but `reorderModules()` in store is ready. No DnD UI. |
| Preferences API           | DONE    | `/api/user/preferences` GET/PUT                          |

**Verdict: Core P0 complete. DnD is P1.**

---

### P0-8: Responsive web dashboard

| Aspect                  | Status  | Notes                                            |
| ----------------------- | ------- | ------------------------------------------------ |
| Responsive layout       | DONE    | Tailwind responsive grid in `dashboard-grid.tsx` |
| Mobile nav              | DONE    | `mobile-nav.tsx` with sheet component            |
| PWA manifest            | DONE    | `src/app/manifest.ts`                            |
| Service worker          | DONE    | Serwist integration in `src/app/sw.ts`           |
| **Live data rendering** | **GAP** | Dashboard renders demo data only                 |

**Verdict: UI shell is responsive and production-quality. Not yet a live dashboard.**

---

### P0-9: Email digest delivery

| Aspect                | Status | Notes                                                     |
| --------------------- | ------ | --------------------------------------------------------- |
| Postmark integration  | DONE   | `src/lib/email/send.ts`                                   |
| HTML email template   | DONE   | `src/lib/email/render.ts` — all 6 widgets                 |
| Text fallback         | DONE   | Plain text version included                               |
| Dynamic subject lines | DONE   | `src/lib/email/subjects.ts` — weather/sleep-aware         |
| Cron digest pipeline  | DONE   | `/api/cron/digest` — assembles + delivers per user        |
| Delivery logging      | DONE   | `digestLogs` table tracks channel, modules, opens, clicks |
| Delivery preferences  | DONE   | `deliveryPreferences` table + API                         |

**Verdict: Fully complete pipeline. End-to-end email delivery is architecturally ready.**

---

## 4. P0 Requirement Summary Scorecard

| Req ID | Requirement              | Status       | Completion |
| ------ | ------------------------ | ------------ | ---------- |
| P0-1   | Weather module           | Partial      | 85%        |
| P0-2   | Unified calendar         | Partial      | 80%        |
| P0-3   | News from 2+ sources     | Partial      | 60%        |
| P0-4   | NYT Games reminders      | Partial      | 95%        |
| P0-5   | This Day in History      | Partial      | 90%        |
| P0-6   | Auth (Clerk)             | **Complete** | 100%       |
| P0-7   | Module configuration     | **Complete** | 95%        |
| P0-8   | Responsive web dashboard | Partial      | 75%        |
| P0-9   | Email digest delivery    | **Complete** | 95%        |

**P0 overall: ~86% structurally built, ~65% end-to-end functional**

The dominant gap is a single architectural issue: **the dashboard page does not fetch live widget data** — it renders hardcoded demo data. Fixing this one issue would unlock most partially-complete P0 items.

---

## 5. P1 Requirements Status

| Req ID | Requirement                  | Status      | Notes                                                                                                                    |
| ------ | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| P1-1   | Oura Ring health integration | **DONE**    | OAuth + API + widget complete                                                                                            |
| P1-2   | Module drag-and-drop         | NOT STARTED | Store ready, no DnD library or UI                                                                                        |
| P1-3   | Push notification delivery   | **DONE**    | FCM integration in `src/lib/notifications/fcm.ts`                                                                        |
| P1-4   | Custom RSS feed support      | NOT STARTED | No RSS parser or custom feed widget                                                                                      |
| P1-5   | Apple Calendar (CalDAV)      | NOT STARTED | Complex; may need Nylas                                                                                                  |
| P1-6   | Configurable delivery time   | **DONE**    | Wake time in user table, scheduler respects it                                                                           |
| P1-7   | Dark mode                    | PARTIAL     | `next-themes` installed, theme provider in layouts, settings page has toggle. Needs verification of full widget theming. |

**P1 overall: 3/7 complete, 1 partial, 3 not started**

---

## 6. Technical Debt & Risks

### Critical Issues

1. **Dashboard uses hardcoded demo data** (`src/app/(dashboard)/dashboard/page.tsx:4-240`)
   - The entire dashboard is a static page with `DEMO_WIDGETS` array
   - No `useEffect`, no API calls, no `useWidgetStore` consumption
   - This is the single biggest blocker to a functional MVP

2. **Zero unit test coverage**
   - No files match `tests/unit/**/*.test.{ts,tsx}`
   - Critical paths untested: digest assembler, widget fetchers, cron scheduler, Stripe webhook handler, email rendering
   - Risk: Regressions during rapid feature development

3. **Build fails without network access**
   - `next/font` depends on Google Fonts CDN at build time
   - CI/CD pipelines without external network access will fail
   - Fix: Use local font files or add fallback fonts

### Moderate Issues

4. **No error boundaries around widget cards**
   - If one widget API fails, it could affect the entire dashboard render
   - PRD user story explicitly mentions graceful degradation for expired OAuth tokens

5. **No rate limiting on widget API routes**
   - `src/lib/redis/rate-limit.ts` exists but is not applied to any route
   - Risk: API abuse, upstream rate limit exhaustion

6. **OAuth token refresh not implemented**
   - `oauthTokens` table has `refreshToken` and `expiresAt` columns
   - No token refresh logic found — expired tokens will silently fail

7. **Streaks table unused**
   - `streaks` table defined in schema but no code reads or writes to it
   - PRD mentions streak milestones in analytics events

8. **`middleware` deprecation warning**
   - Next.js 16 warns: "The middleware file convention is deprecated. Please use proxy instead."
   - Needs migration to the new proxy convention

---

## 7. Architecture Strengths

The codebase has several strong architectural decisions worth preserving:

1. **Widget plugin system** — Clean `Widget` interface with `metadata`, `fetchData`, `renderCard`, `renderEmail`, `renderNotification`. Adding new widgets is straightforward.

2. **Lazy database proxy** — Drizzle client defers connection until actually needed, enabling demo mode without a database.

3. **Multi-channel delivery pipeline** — Cron → assemble → deliver (web/email/push) is well-structured with proper logging.

4. **Zod environment validation** — All env vars validated at startup; prevents silent misconfigurations.

5. **Analytics event taxonomy** — Pre-defined event names in `src/lib/analytics/events.ts` enable consistent tracking.

6. **Subscription tier enforcement** — `plans.ts` defines feature limits per tier; `getWidgetsByTier()` in registry filters appropriately.

7. **Security headers** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, strict Referrer-Policy.

---

## 8. Strategic Recommendations

### Phase 1 Completion — Critical Path (Recommended Priority Order)

#### 1. Wire dashboard to live widget data

**Impact: Unlocks P0-1, P0-2, P0-3, P0-4, P0-5, P0-8 simultaneously**

The dashboard page needs to:

- Read authenticated user's enabled modules from the preferences API
- Call each widget's API endpoint in parallel
- Render live data using widget card components
- Show loading skeletons during fetch (skeleton component already exists)
- Handle errors gracefully per-widget (don't let one failure break all)
- Fall back to demo data for unauthenticated visitors

This is the highest-leverage single change. Everything else is built and waiting.

#### 2. Add a second news source

**Impact: Completes P0-3**

The Guardian API is integrated. Add NYT Top Stories API (500/day free) as a second source. The news widget's config already supports a `categories` array — extend it to support `sources` with multi-API fetching.

#### 3. Write critical-path unit tests

**Impact: Risk mitigation, CI stability**

Priority test targets:

- `src/lib/cron/digest-assembler.ts` — parallel widget fetching
- `src/lib/cron/scheduler.ts` — wake time window calculation
- `src/lib/widgets/*.ts` — each widget's `fetchData()` with mocked HTTP
- `src/lib/email/render.ts` — email template rendering
- `src/lib/stripe/plans.ts` — tier limit enforcement
- `src/app/api/webhooks/stripe/route.ts` — webhook event handling
- `src/lib/redis/cache.ts` — cache get/set with TTL

#### 4. Implement OAuth token refresh

**Impact: Prevents calendar and health widgets from silently failing**

Add token refresh logic for Google Calendar, Outlook, and Oura Ring OAuth tokens. Check `expiresAt` before each API call; refresh if expired using stored `refreshToken`.

#### 5. Fix production build for offline/CI

**Impact: Unblocks CI/CD pipeline**

Replace Google Fonts CDN dependency with local font files or add a fallback font stack that doesn't require network access at build time.

#### 6. Apply rate limiting to widget API routes

**Impact: Protects against API abuse**

The rate-limit module exists. Apply it as middleware to `/api/widgets/*` routes.

---

### Phase 2 Readiness — What to Build Next

| Priority | Feature                                          | Effort | Value                       |
| -------- | ------------------------------------------------ | ------ | --------------------------- |
| HIGH     | Drag-and-drop module reordering (P1-2)           | Medium | High user satisfaction      |
| HIGH     | Dark mode verification across all widgets (P1-7) | Low    | Expected by users           |
| MEDIUM   | Custom RSS feeds for Pro users (P1-4)            | Medium | Monetization driver         |
| MEDIUM   | Streak tracking implementation                   | Low    | Retention mechanic          |
| LOW      | Apple Calendar via CalDAV (P1-5)                 | High   | Niche audience              |
| LOW      | IP-based weather auto-detect                     | Low    | Reduces onboarding friction |

### Phase 2 Premium Modules (PRD Section 7)

The widget registry makes adding new modules straightforward. Recommended order based on PRD tier alignment and revenue impact:

1. **Motivational Quote** (Free, Phase 1) — Easiest to build, fills "empty dashboard" edge case
2. **Countdown Timers** (Free, Phase 1) — High engagement, simple implementation
3. **Stock Market Snapshot** (Premium, Phase 2) — Strong Pro conversion driver
4. **Sports Scores** (Premium, Phase 2) — Broad appeal
5. **AI Daily Summary** (Premium, Phase 2) — Differentiated feature, drives upgrades

---

## 9. Monetization Readiness

| Component                | Status      | Notes                                                                   |
| ------------------------ | ----------- | ----------------------------------------------------------------------- |
| Stripe checkout          | DONE        | Creates checkout sessions for Pro/Business                              |
| Stripe portal            | DONE        | Manage subscription link                                                |
| Stripe webhooks          | DONE        | Handles checkout, subscription updates, cancellations, payment failures |
| Plan tier definitions    | DONE        | Free (3 modules), Pro ($12/mo, unlimited), Business ($39/mo)            |
| Tier enforcement         | DONE        | `getWidgetsByTier()` filters available widgets                          |
| Feature gating           | PARTIAL     | Plan limits defined but not enforced in all API routes                  |
| Sponsor slot (Free tier) | NOT STARTED | PRD specifies 1 tasteful sponsor slot                                   |
| Upgrade prompts in UI    | PARTIAL     | Settings page has upgrade CTA; no contextual upsells in widget cards    |

**Monetization is ~80% ready.** The payment infrastructure works. What's missing is feature gating enforcement in API routes and contextual upgrade prompts when free users hit limits.

---

## 10. SEO & Marketing Pages Status

| Page                | Status | Purpose                               |
| ------------------- | ------ | ------------------------------------- |
| `/` (homepage)      | DONE   | Hero, features, pricing, CTA          |
| `/changelog`        | DONE   | Auto-generated from git (with script) |
| `/guide`            | DONE   | Auto-generated user guide             |
| `/today/[topic]`    | DONE   | Programmatic SEO pages                |
| `/today/history`    | DONE   | History page                          |
| `/weather/[city]`   | DONE   | City weather pages                    |
| `/vs/[competitor]`  | DONE   | Comparison pages                      |
| `/templates/[type]` | DONE   | Template showcase pages               |
| `/api/og`           | DONE   | Dynamic OpenGraph images              |

The SEO strategy from `docs/BriefMe-SEO-Marketing-Strategy.md` is well-implemented with programmatic page generation.

---

## 11. Success Metrics Instrumentation

PRD Section 15 defines specific success metrics. Current instrumentation status:

| Metric                   | PRD Target  | Instrumented? | Notes                                                       |
| ------------------------ | ----------- | ------------- | ----------------------------------------------------------- |
| Signup rate              | 500/30 days | YES           | `USER_SIGNED_UP` event                                      |
| Onboarding completion    | >70%        | YES           | `ONBOARDING_STEP_COMPLETED`, `ONBOARDING_COMPLETED`         |
| Daily active rate        | >40%        | PARTIAL       | `DIGEST_VIEWED` event exists, but dashboard doesn't emit it |
| Email open rate          | >50%        | YES           | `EMAIL_OPENED` event + `digestLogs.emailOpened`             |
| Module activation        | Avg 4+      | YES           | `MODULE_ENABLED`/`MODULE_DISABLED` events                   |
| Calendar connection rate | >30%        | YES           | `OAUTH_CONNECTED` event                                     |
| Weekly retention         | >70%        | PARTIAL       | Events exist but PostHog cohort setup needed                |
| Pro conversion           | 5%          | YES           | `SUBSCRIPTION_STARTED` + Stripe analytics                   |
| MRR                      | $5K+ @ 6mo  | YES           | Stripe dashboard                                            |
| Churn rate               | <5%         | YES           | `SUBSCRIPTION_CANCELED` + Stripe                            |

**Instrumentation is ~80% ready.** PostHog events are defined and Stripe handles payment analytics. The gap is actually _emitting_ these events from the live dashboard (which currently renders static demo data).

---

## 12. Summary: What Needs to Happen for MVP Launch

### Must-Do (Blocks Launch)

1. Wire dashboard to fetch and render live widget data
2. Add second news source (NYT Top Stories API)
3. Implement OAuth token refresh for calendar/health providers
4. Fix production build (local fonts or CDN fallback)
5. Write unit tests for critical paths (digest assembler, webhooks, widget fetchers)

### Should-Do (Launch Quality)

6. Add per-widget error boundaries with reconnect prompts
7. Apply rate limiting to widget API routes
8. Enforce tier limits in API routes (not just UI)
9. Emit analytics events from live dashboard interactions
10. Implement streak tracking (table exists, no logic)

### Nice-to-Have (Polish)

11. Drag-and-drop module reordering
12. IP-based weather location auto-detect
13. Contextual upgrade prompts in free-tier widget cards
14. Loading skeleton animations during widget data fetch
15. Offline PWA support with cached last-known widget data

---

_This analysis reflects the codebase state as of February 12, 2026._
