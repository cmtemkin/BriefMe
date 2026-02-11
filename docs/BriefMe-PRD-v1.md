# BriefMe — Product Requirements Document v1.0

**Your Morning, Personally Curated**

Version 1.0 | February 2026 | Configurable Morning Digest & Dashboard Platform

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Non-Goals (v1)](#4-non-goals-v1)
5. [User Stories](#5-user-stories)
6. [Core Feature Modules](#6-core-feature-modules)
7. [Premium & Expansion Modules](#7-premium--expansion-modules)
8. [Technical Architecture](#8-technical-architecture)
9. [API Integration Research](#9-api-integration-research)
10. [Delivery Channels](#10-delivery-channels)
11. [Auth & User Management](#11-auth--user-management)
12. [Monetization Strategy](#12-monetization-strategy)
13. [Competitive Landscape](#13-competitive-landscape)
14. [Requirements (P0 / P1 / P2)](#14-requirements-p0--p1--p2)
15. [Success Metrics](#15-success-metrics)
16. [Phased Roadmap](#16-phased-roadmap)
17. [Open Questions](#17-open-questions)
18. [Appendix: API Quick Reference](#18-appendix-api-quick-reference)

---

## 1. Executive Summary

BriefMe is a configurable morning intelligence dashboard that aggregates personal data, world events, and daily rituals into a single, beautiful digest. Users wake up to a personalized briefing containing weather, unified calendar, curated news, health insights, game reminders, and fun daily facts — delivered via web dashboard, email digest, or push notification.

This PRD serves a dual purpose: it defines the product requirements for BriefMe and provides a thorough technical feasibility study for building it as a configurable, monetizable platform. The research covers every API integration, architecture pattern, infrastructure decision, and monetization model needed to take this from idea to revenue.

> **Key Insight:** No dominant consumer "morning dashboard" app exists today. Morning Brew owns email newsletters (~$20M/yr revenue), Notion owns DIY dashboards, but nobody owns the personalized, multi-source morning digest with health + calendar + content in one configurable product.

---

## 2. Problem Statement

Every morning, people perform the same fragmented ritual: check weather on one app, scan calendar across work and personal accounts, browse news across multiple sources, review sleep/health data on wearable apps, and remember to play daily games. This takes 15–25 minutes of app-switching, produces cognitive overload, and delivers an inconsistent experience.

**Who experiences this:**

- Knowledge workers managing both work (Outlook) and personal (Google) calendars
- Health-conscious individuals tracking sleep/wellness via Oura Ring or Apple Health
- News consumers who want curated headlines without doomscrolling
- Daily game players (NYT Wordle, Connections, Strands, Mini Crossword)
- Anyone who wants a consistent, delightful start to their day

**Cost of not solving:**

- 15–25 minutes of daily fragmented attention (90–150 hrs/year per user)
- Missed calendar conflicts between work and personal
- Health data sits unused in siloed wearable apps
- No single product ties morning context together

---

## 3. Product Vision & Goals

BriefMe is your personal morning command center. Tell it what matters to you, and it briefs you — every morning, exactly how you want it. One configurable dashboard that replaces the 6–8 apps in your morning routine, delivered as a web page, an email in your inbox, or a push notification.

**Product Goals:**

1. Reduce morning routine app-switching from 6–8 apps to 1 dashboard
2. Achieve 10K active users within 6 months of launch
3. Convert 5% of free users to paid Pro tier ($12/month) within first year
4. Maintain >70% weekly retention (users who return 5+ days/week)
5. Build a modular architecture that supports community-contributed widgets

**User Goals:**

- **Efficiency:** Get fully briefed on my day in under 3 minutes
- **Unification:** See work + personal calendar in one view
- **Health awareness:** Understand my sleep and readiness at a glance
- **Delight:** Start the day with fun facts and game reminders
- **Control:** Choose exactly what I see and how I receive it

---

## 4. Non-Goals (v1)

- **Full calendar management** — BriefMe is read-only for calendars. Creating/editing events is out of scope. (Complexity: too high for MVP; calendar apps already do this well.)
- **AI-generated news summaries** — v1 shows headlines + links. AI summarization is a P2 feature. (Risk: LLM costs, hallucination, copyright concerns.)
- **Social features** — No sharing, leaderboards, or community features in v1. (Premature before product-market fit.)
- **Native mobile apps** — v1 is web-first with responsive design. Native iOS/Android are Phase 3. (Exception: minimal HealthKit bridge app may be needed for Apple Health.)
- **Real-time data streaming** — Morning digest is a point-in-time snapshot, not a live dashboard. (Simplifies architecture; matches use case.)
- **Enterprise/team features** — v1 is B2C individual users only. White-label B2B is a Phase 3 expansion. (Focus on consumer PMF first.)

---

## 5. User Stories

### Core Digest Experience

- _As a busy professional,_ I want to see weather, calendar, and news in one place when I wake up, so that I can start my day informed without opening 6 different apps.
- _As a user with both work and personal calendars,_ I want to see all my events merged into a single timeline, so that I can spot conflicts between work meetings and personal appointments.
- _As a news consumer,_ I want headlines from reputable sources I choose (not just one outlet), so that I get a balanced view of the day's events.
- _As an Oura Ring user,_ I want to see my sleep score, readiness score, and HRV trend on my morning dashboard, so that I can adjust my day based on how rested I am.
- _As a NYT games player,_ I want a reminder with direct links to today's Wordle, Connections, Strands, and Mini, so that I never forget to play.
- _As a trivia enthusiast,_ I want a "This Day in History" fun fact and celebrity birthday each morning, so I have something interesting to share.

### Configuration & Personalization

- _As a new user,_ I want to pick my modules during onboarding (weather, news, calendar, health, games, fun facts), so that my first digest feels personalized.
- _As a power user,_ I want to drag-and-drop modules to reorder my digest layout, so that the most important info is always at the top.
- _As a user,_ I want to configure each module (e.g., choose my location for weather, pick news sources, connect specific calendars), so that the data is relevant to me.
- _As a user,_ I want to choose my delivery method — web dashboard, morning email, or push notification — so that I receive my digest where it's most convenient.

### Edge Cases & Error States

- _As a user whose calendar OAuth token has expired,_ I want a clear message explaining why my calendar is missing and a one-click button to reconnect, so I'm not confused by blank modules.
- _As a user without an Oura Ring,_ I want the health module to gracefully show "Connect a health device" instead of an error, so I know it's an option but not required.
- _As a user who has disabled all optional modules,_ I want to see at minimum the weather and a motivational quote, so my dashboard never feels empty.

---

## 6. Core Feature Modules

Each module is a self-contained, configurable unit with a standard interface: metadata, fetch(), render(), and a config schema.

### 6.1 Weather Module

Displays current conditions, feels-like temperature, hourly forecast, and daily high/low.

| Config Option        | Type                           | Default               |
| -------------------- | ------------------------------ | --------------------- |
| Location             | Auto-detect or manual city/zip | Auto (IP geolocation) |
| Units                | Fahrenheit / Celsius           | Fahrenheit (US)       |
| Show feels-like      | Boolean                        | true                  |
| Show hourly forecast | Boolean                        | true (next 6 hours)   |
| Show UV index        | Boolean                        | false                 |
| Show AQI             | Boolean                        | false                 |

**Recommended API:** Open-Meteo (free, no auth, unlimited) with OpenWeatherMap as fallback (1,000 calls/day free).

### 6.2 Unified Calendar Module

Merges events from multiple calendar providers (Google, Outlook, Apple) into a single chronological timeline for today and tomorrow.

| Config Option        | Type                                  | Default                   |
| -------------------- | ------------------------------------- | ------------------------- |
| Connected calendars  | Multi-select (Google, Outlook, Apple) | None (requires OAuth)     |
| Time range           | Today only / Today + Tomorrow         | Today + Tomorrow          |
| Show free/busy only  | Boolean                               | false (show full details) |
| Color-code by source | Boolean                               | true                      |
| Show conflicts       | Boolean                               | true                      |

**Integration approach:** Direct Google Calendar API + Microsoft Graph API for Outlook. CalDAV for Apple Calendar. Consider Nylas ($10–50/user/month) if multi-provider complexity is too high for MVP.

### 6.3 News Headlines Module

Curated top stories from user-selected reputable sources with headline, source attribution, and link to full article.

| Config Option     | Type                                                  | Default                |
| ----------------- | ----------------------------------------------------- | ---------------------- |
| News sources      | Multi-select from list                                | Guardian, NYT, Reuters |
| Number of stories | 3 / 5 / 10                                            | 5                      |
| Categories        | Multi-select (World, Tech, Business, Science, Sports) | World, Tech            |
| Custom RSS feeds  | URL input (premium)                                   | None                   |
| Region            | Country selector                                      | US                     |

**Recommended APIs:** Guardian API (5,000 calls/day free, production-ready), NYT Top Stories API (500/day free, metadata only), plus Newsdata.io for breadth. Custom RSS via rss-parser library.

### 6.4 Health & Wellness Module

Displays sleep score, readiness, HRV trend, and activity summary from connected health platforms.

| Config Option                  | Type                                       | Default |
| ------------------------------ | ------------------------------------------ | ------- |
| Data source                    | Oura Ring / Fitbit / Apple Health / Garmin | None    |
| Show sleep score               | Boolean                                    | true    |
| Show readiness score           | Boolean                                    | true    |
| Show HRV trend                 | Boolean                                    | false   |
| Show activity (steps/calories) | Boolean                                    | true    |

> **Critical: Apple HealthKit Limitation**
> There is NO web API for Apple HealthKit. All data is stored locally on the iPhone. A minimal iOS bridge app is required to sync HealthKit data to the BriefMe backend. Alternative: Use Terra API ($0.50–2/user/month) which provides an iOS SDK for HealthKit + unified backend API. Recommendation: Launch v1 with Oura Ring only. Add HealthKit in Phase 2.

**Oura API:** OAuth2 auth, v2 endpoints for daily_sleep, daily_readiness, daily_activity, heartrate. 5,000 requests/5 min. Requires active Oura Membership for API access.

### 6.5 Daily Games Reminder Module

Shows links to today's NYT word games with a friendly reminder to play.

| Game           | Direct URL                       | Notes                           |
| -------------- | -------------------------------- | ------------------------------- |
| Wordle         | nytimes.com/games/wordle         | New puzzle daily at midnight ET |
| Connections    | nytimes.com/games/connections    | New puzzle daily                |
| Strands        | nytimes.com/games/strands        | New puzzle daily                |
| Mini Crossword | nytimes.com/crosswords/game/mini | New puzzle daily                |
| Spelling Bee   | nytimes.com/puzzles/spelling-bee | New puzzle daily                |

**Note:** No official NYT Games API exists for streak data or puzzle status. Links are static URLs that always serve the current day's puzzle.

| Config Option          | Type                   | Default     |
| ---------------------- | ---------------------- | ----------- |
| Games to show          | Multi-select from list | All 5 games |
| Show motivational text | Boolean                | true        |
| Custom games           | URL input (premium)    | None        |

### 6.6 This Day in History & Birthdays Module

Displays a curated historical event and notable birthday for today's date.

| Config Option            | Type      | Default          |
| ------------------------ | --------- | ---------------- |
| Show historical events   | Boolean   | true             |
| Number of events         | 1 / 3 / 5 | 1 (curated best) |
| Show celebrity birthdays | Boolean   | true             |
| Number of birthdays      | 1 / 3 / 5 | 1                |
| Show deaths              | Boolean   | false            |

**API:** Wikimedia Feed API (free, no auth). Endpoint: `api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/{month}/{day}`. Returns events, births, deaths with Wikipedia article links.

---

## 7. Premium & Expansion Modules

| Module                       | Description                                                 | Tier    | Phase |
| ---------------------------- | ----------------------------------------------------------- | ------- | ----- |
| Motivational Quote           | Daily curated or random quote with author attribution       | Free    | 1     |
| Countdown Timers             | Days until holidays, birthdays, vacations, deadlines        | Free    | 1     |
| Stock Market Snapshot        | Pre-market movers, portfolio watchlist, indices summary     | Premium | 2     |
| Sports Scores                | Last night's scores and today's schedule for followed teams | Premium | 2     |
| Spotify Recently Played      | Yesterday's top tracks and listening stats                  | Premium | 2     |
| AI Daily Summary             | LLM-generated natural language briefing of all modules      | Premium | 2     |
| Custom RSS/Atom Feeds        | User-provided feed URLs parsed and displayed                | Premium | 1     |
| Task Manager Integration     | Today's tasks from Todoist, Asana, Notion, or Things 3      | Premium | 2     |
| Astronomy Picture of the Day | NASA APOD with caption                                      | Free    | 1     |
| Horoscope                    | Daily horoscope for user's zodiac sign                      | Free    | 1     |
| Reddit Top Posts             | Top posts from user-selected subreddits                     | Premium | 2     |
| YouTube Subscriptions        | New uploads from subscribed channels                        | Premium | 2     |
| Package Tracking             | Delivery status for expected packages                       | Premium | 3     |
| Public Transit / Commute     | Commute time estimate and transit alerts                    | Premium | 2     |
| Custom Widget Builder        | JSON/API configuration for user-defined data widgets        | Premium | 3     |

---

## 8. Technical Architecture

### 8.1 Recommended Tech Stack

| Layer              | Technology                                      | Rationale                                                                                             |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Frontend Framework | Next.js 14+ (App Router)                        | Server Components, ISR for digest pre-rendering, API routes for BFF pattern, Vercel-native deployment |
| UI Library         | React + Tailwind CSS + shadcn/ui                | Rapid iteration, accessible components, consistent design system                                      |
| State Management   | Zustand (lightweight) or React Context          | Simple widget config state; avoid Redux overhead for MVP                                              |
| Backend Runtime    | Node.js (via Next.js API routes)                | Unified JS stack, shared types between front/back                                                     |
| Database           | PostgreSQL (via Supabase or Neon)               | User configs, widget prefs, OAuth tokens, delivery schedules                                          |
| Cache              | Redis (Upstash serverless)                      | Widget data caching (TTL per module), rate limit tracking                                             |
| Auth               | Clerk (free to 10K MAU)                         | OAuth2 for social login, handles Google/Microsoft/Apple identity; seamless Next.js integration        |
| Email Delivery     | Postmark or Resend                              | Superior inbox placement (Postmark), or React Email templates (Resend)                                |
| Push Notifications | Firebase Cloud Messaging (free)                 | Web push + mobile push, zero per-message cost at any scale                                            |
| Scheduling         | Vercel Cron Jobs + Bull queue (Redis)           | Cron for daily triggers, Bull for parallel user digest assembly                                       |
| Hosting            | Vercel (frontend) + Railway or Render (workers) | Vercel for edge performance; Railway for background job workers                                       |
| Monitoring         | Sentry + Posthog                                | Error tracking + product analytics (both have generous free tiers)                                    |

### 8.2 Widget/Module Architecture

Each widget follows a standard interface contract:

```
metadata: { id, name, description, icon, tier, configSchema }
fetchData(userConfig): async => WidgetData  // API calls, caching
renderCard(data): React.Component           // Dashboard card UI
renderEmail(data): MJML fragment            // Email digest section
renderNotification(data): { title, body, url }  // Push payload
```

**Widget Registry Pattern:** All widgets register in a central registry. The digest assembler queries the registry for the user's selected widgets, calls fetchData() in parallel (Promise.all), then renders via the appropriate method (card, email, or push).

**MVP approach:** Monolithic Next.js app with lazy-loaded widget components. Code-split per widget for performance. Refactor to Module Federation (Webpack 5) or micro-frontends only if multiple teams contribute widgets.

### 8.3 Data Flow

> **Morning Digest Pipeline (runs daily per user)**
>
> 1. Cron trigger fires at user's configured wake time (default 6:00 AM local)
> 2. Load user's widget selections + configs from PostgreSQL
> 3. For each active widget: check Redis cache → if stale, call external API
> 4. Normalize all widget data into standard WidgetData schema
> 5. Assemble digest: ordered by user's layout preference
> 6. Deliver via configured channel(s): web (ISR page), email (MJML → HTML), push (FCM)
> 7. Log delivery event + track opens/clicks in Posthog

---

## 9. API Integration Research

### 9.1 Weather APIs

| API                | Free Tier          | Feels Like | Alerts  | AQI     | Auth    |
| ------------------ | ------------------ | ---------- | ------- | ------- | ------- |
| Open-Meteo         | Unlimited (no key) | Yes        | No      | Yes     | None    |
| OpenWeatherMap 3.0 | 1,000 calls/day    | Yes        | Yes     | Yes     | API key |
| Tomorrow.io        | 500 calls/day      | Yes        | Yes     | Yes     | API key |
| Visual Crossing    | 1,000 records/day  | Yes        | Limited | Limited | API key |
| WeatherAPI         | 50 calls/day       | Yes        | No      | No      | API key |

**Recommendation:** Use Open-Meteo as primary (free, no auth, excellent data quality). Fall back to OpenWeatherMap for weather alerts and richer features at scale.

### 9.2 Calendar APIs

| Provider        | API                    | Auth                  | Free Tier       | Complexity |
| --------------- | ---------------------- | --------------------- | --------------- | ---------- |
| Google Calendar | Google Calendar API v3 | OAuth2                | ~1M req/day     | Medium     |
| Outlook/O365    | Microsoft Graph API    | OAuth2 (Azure)        | Very high quota | Medium     |
| Apple/iCloud    | CalDAV protocol        | App-specific password | Unlimited       | High       |
| Unified (all)   | Nylas API              | Nylas-managed OAuth   | 5 accounts free | Low        |

### 9.3 News APIs

| API             | Free Tier       | Production OK? | Full Text?    | Best For                          |
| --------------- | --------------- | -------------- | ------------- | --------------------------------- |
| Guardian API    | 5,000/day       | Yes            | Yes           | Primary source (stable, generous) |
| NYT Top Stories | 500/day         | Yes            | No (metadata) | Headlines + links                 |
| Newsdata.io     | 200 credits/day | Yes            | No (paid)     | Broad coverage                    |
| Currents API    | 1,000/day       | Yes            | Yes           | Budget premium option             |
| NewsAPI.org     | 100/day         | NO (dev only)  | Yes           | Prototyping only                  |
| GNews           | 100/day         | NO (dev only)  | No            | Prototyping only                  |

> **Warning:** NewsAPI.org and GNews free tiers are restricted to development/testing only. Bing News Search API is being deprecated August 2026.

### 9.4 Oura Ring API

| Endpoint                           | Data                           | Example Metric                      |
| ---------------------------------- | ------------------------------ | ----------------------------------- |
| /v2/usercollection/daily_sleep     | Sleep score + stage breakdown  | score: 81, deep_sleep: 100, rem: 95 |
| /v2/usercollection/daily_readiness | Readiness score + contributors | score: 74, HRV_balance: 88          |
| /v2/usercollection/daily_activity  | Steps, calories, active time   | steps: 8,432, active_cal: 512       |
| /v2/usercollection/heartrate       | Resting HR, HRV trend          | resting_hr: 58, hrv_avg: 42ms       |

**Auth:** OAuth2. Rate limit: 5,000 requests per 5-minute window. Users must have an active Oura Membership for API data access. Apps limited to 10 users before Oura approval.

### 9.5 Apple HealthKit

> **Hard Technical Constraint:** There is NO HealthKit web API or REST API. All data is stored locally on the iPhone. A web-only approach CANNOT access HealthKit data. Required: Build a minimal iOS companion app or use Terra API ($0.50–2/user/month).

**Phased approach:**

1. **Phase 1 (MVP):** Oura Ring only. Display "Apple Health coming soon."
2. **Phase 2:** Build minimal iOS app (Swift) with HealthKit authorization + daily background sync.
3. **Phase 3:** Consider Terra API for unified health platform.

### 9.6 This Day in History & Birthdays

**Wikimedia API (free, no auth):** `api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/{month}/{day}`

Returns structured JSON arrays of historical events, births, and deaths. Celebrity birthdays can be supplemented with curated CSV datasets or API Ninjas Celebrity API.

---

## 10. Delivery Channels

### 10.1 Web Dashboard

Responsive, card-based layout using Next.js ISR. Pre-render each user's digest at their configured wake time.

### 10.2 Email Digest

| Provider | Inbox Placement             | Pricing                   | Best For                             |
| -------- | --------------------------- | ------------------------- | ------------------------------------ |
| Postmark | 22% better than competitors | $1.50/1,000 emails        | Reliable delivery (recommended)      |
| Resend   | Good (newer)                | 100/day free, then $20/mo | React Email templates + Next.js      |
| SendGrid | Industry standard           | 100/day free, then $20/mo | High volume, complex personalization |
| AWS SES  | Good (requires setup)       | $0.10/1,000 emails        | Maximum cost efficiency at scale     |

### 10.3 Push Notifications

| Provider       | Free Tier           | Web Push | Mobile Push | Best For                    |
| -------------- | ------------------- | -------- | ----------- | --------------------------- |
| Firebase (FCM) | Unlimited           | Yes      | Yes         | MVP (free, no limits)       |
| OneSignal      | 10K web subscribers | Yes      | Yes         | Advanced targeting at scale |

---

## 11. Auth & User Management

| Solution      | Free Tier                 | Best For                             | Key Feature                               |
| ------------- | ------------------------- | ------------------------------------ | ----------------------------------------- |
| Clerk         | 10K MAU                   | Next.js-first projects (recommended) | Social OAuth, passkeys, multi-org support |
| NextAuth.js   | Unlimited (self-hosted)   | Cost optimization at scale           | 80+ OAuth providers, full control         |
| Auth0         | 7K MAU                    | Enterprise/B2B (heavyweight)         | SOC 2, HIPAA, broad compliance            |
| Supabase Auth | Unlimited (with Supabase) | Supabase-native projects             | OAuth 2.1 + magic links                   |

**Recommended:** Clerk for primary auth. Store third-party OAuth tokens (calendar, health) in encrypted PostgreSQL columns tied to Clerk user IDs.

---

## 12. Monetization Strategy

### 12.1 Freemium Tier Model

| Feature             | Free           | Pro ($12/mo)          | Business ($39/mo)      |
| ------------------- | -------------- | --------------------- | ---------------------- |
| Core modules        | 3 modules max  | Unlimited             | Unlimited              |
| News sources        | 3 pre-set      | Custom + RSS          | Custom + API access    |
| Delivery channels   | Web only       | Web + Email + Push    | All + Team digest      |
| Delivery frequency  | 1x daily       | Up to 3x daily        | Custom schedule        |
| Health integrations | None           | Oura + Fitbit + Apple | All + wellness reports |
| Premium modules     | None           | All premium widgets   | All + custom widgets   |
| AI daily summary    | None           | Included              | Included + API         |
| Ads/sponsorship     | 1 sponsor slot | Ad-free               | Ad-free                |
| Support             | Community      | Email support         | Priority support       |

### 12.2 Revenue Projections

| Metric                | Conservative | Moderate | Optimistic |
| --------------------- | ------------ | -------- | ---------- |
| Free users (Month 12) | 15,000       | 30,000   | 60,000     |
| Conversion rate       | 3%           | 5%       | 8%         |
| Paying users          | 450          | 1,500    | 4,800      |
| ARPU (monthly)        | $12          | $14      | $16        |
| MRR (Month 12)        | $5,400       | $21,000  | $76,800    |
| ARR (Month 12)        | $64,800      | $252,000 | $921,600   |

### 12.3 Additional Revenue Streams

- **Sponsored content:** 1 tasteful sponsor slot in free-tier digests. $500–$5,000/month per sponsor at 20K+ active users.
- **Affiliate links:** Product recommendations (books, gadgets). 2–5% commission. Secondary revenue.
- **White-label B2B:** Branded BriefMe for enterprises. $499–$2,000/month per instance. Phase 3.
- **API access:** $9–$49/month for API subscription. Phase 3.
- **Widget marketplace:** Third-party developers build/sell premium widgets. 20–30% platform fee. Phase 3+.

---

## 13. Competitive Landscape

| Competitor        | Model                      | Strength                   | Gap BriefMe Fills                                        |
| ----------------- | -------------------------- | -------------------------- | -------------------------------------------------------- |
| Morning Brew      | Email newsletter, $20M+/yr | Brand, 2.5M subscribers    | No personalization, no health/calendar data              |
| theSkimm          | Email + premium sub        | Female-focused brand       | No configurable modules, no health data                  |
| Notion Dashboards | DIY in Notion (free)       | Flexibility, templates     | Requires manual setup, no live API data                  |
| Exist.io          | $6.99/mo quantified self   | Health data aggregation    | No news, no calendar, no games, niche audience           |
| Gyroscope         | $9.99/mo health dashboard  | Beautiful visualizations   | Health-only, no morning briefing concept                 |
| Netvibes          | Shut down Sep 2024         | Was the closest competitor | Proved market gap exists but generic dashboards struggle |
| Start.me          | Customizable start page    | Easy setup                 | No data integrations, no health/calendar, static         |

> **Competitive Insight:** Morning Brew proves the morning digest format generates significant revenue. Netvibes' shutdown proves generic dashboards fail — BriefMe must be opinionated about the morning use case. Nobody combines curated content + personal data + daily rituals in one configurable product.

---

## 14. Requirements (P0 / P1 / P2)

### P0 — Must-Have (MVP Cannot Ship Without)

| ID   | Requirement                                      | Acceptance Criteria                                                                                                     |
| ---- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| P0-1 | Weather module with feels-like temperature       | Given a configured location, when dashboard loads, then current temp, feels-like, and hourly forecast display correctly |
| P0-2 | Unified calendar showing Google + Outlook events | Given both Google and Outlook connected, then all events display chronologically with source color-coding               |
| P0-3 | News headlines from 2+ configurable sources      | Given selected news sources, then 5 headlines display with source attribution and working links                         |
| P0-4 | NYT Games reminder with direct links             | Given a new puzzle day, then all 5 game links are present and functional                                                |
| P0-5 | This Day in History fun fact                     | Given any calendar date, then at least 1 historical event and 1 birthday display                                        |
| P0-6 | User account creation and authentication         | Given a new visitor, when signing up, then account is created and user reaches onboarding within 10 seconds             |
| P0-7 | Module selection and basic configuration         | Given an authenticated user, then they can enable/disable modules and configure basic options                           |
| P0-8 | Responsive web dashboard                         | Given any device, then layout adapts correctly with all modules readable                                                |
| P0-9 | Email digest delivery                            | Given email delivery enabled, then formatted HTML email is delivered at scheduled time                                  |

### P1 — Should-Have (High-Priority Fast Follows)

| ID   | Requirement                     | Acceptance Criteria                                                             |
| ---- | ------------------------------- | ------------------------------------------------------------------------------- |
| P1-1 | Oura Ring health integration    | Given connected Oura account, then sleep score, readiness, and activity display |
| P1-2 | Module drag-and-drop reordering | Given dashboard settings, then modules can be repositioned and order persists   |
| P1-3 | Push notification delivery      | Given push enabled, then summary notification delivered with deep link          |
| P1-4 | Custom RSS feed support         | Given a Pro user adding an RSS URL, then feed items display as custom module    |
| P1-5 | Apple Calendar (CalDAV) support | Given iCloud configured, then Apple Calendar events appear alongside others     |
| P1-6 | Configurable delivery time      | Given a selected wake time, then digests deliver within 5 minutes               |
| P1-7 | Dark mode                       | Given dark mode toggled, then all modules render with dark theme                |

### P2 — Future Considerations

| ID    | Requirement                                        | Phase   |
| ----- | -------------------------------------------------- | ------- |
| P2-1  | Apple HealthKit integration (requires iOS app)     | Phase 2 |
| P2-2  | AI-generated natural language daily summary        | Phase 2 |
| P2-3  | Stock market / financial widgets                   | Phase 2 |
| P2-4  | Sports scores and schedule module                  | Phase 2 |
| P2-5  | Spotify listening history module                   | Phase 2 |
| P2-6  | Task manager integrations (Todoist, Asana, Notion) | Phase 2 |
| P2-7  | Third-party widget marketplace                     | Phase 3 |
| P2-8  | White-label B2B offering                           | Phase 3 |
| P2-9  | Custom widget builder (JSON/API config)            | Phase 3 |
| P2-10 | Native iOS and Android apps                        | Phase 3 |

---

## 15. Success Metrics

### Leading Indicators (Days to Weeks)

| Metric                   | Target (30 days)                     | Measurement                      |
| ------------------------ | ------------------------------------ | -------------------------------- |
| Signup rate              | 500 signups in first 30 days         | Clerk analytics + Posthog funnel |
| Onboarding completion    | >70% complete module selection       | Posthog step-through tracking    |
| Daily active rate        | >40% of registered users visit daily | Posthog daily active users       |
| Email open rate          | >50% open rate                       | Postmark analytics               |
| Module activation        | Avg user enables 4+ modules          | PostgreSQL query on user configs |
| Calendar connection rate | >30% connect at least one calendar   | OAuth completion tracking        |

### Lagging Indicators (Weeks to Months)

| Metric              | Target (6 months)        | Measurement                   |
| ------------------- | ------------------------ | ----------------------------- |
| Weekly retention    | >70% return 5+ days/week | Posthog cohort analysis       |
| Monthly retention   | >60% MAU/signup ratio    | Posthog retention curves      |
| Pro conversion rate | 5% of free users upgrade | Stripe subscription analytics |
| MRR                 | $5,000+ by month 6       | Stripe dashboard              |
| NPS score           | >50 (excellent)          | In-app survey (quarterly)     |
| Churn rate (Pro)    | <5% monthly              | Stripe churn reporting        |

---

## 16. Phased Roadmap

### Phase 1: MVP (Months 1–4)

**Goal:** Launch core product with 6 modules and email delivery. Validate PMF.

- Set up Next.js project with Clerk auth, PostgreSQL, Redis
- Build widget registry pattern and 6 core modules
- Implement web dashboard with module configuration
- Build email digest pipeline (MJML + Postmark + Vercel cron)
- Launch to 100 beta users (friends, ProductHunt, indie hackers)
- Implement free + Pro tier with Stripe billing

### Phase 2: Growth (Months 5–9)

**Goal:** Reach 10K users, 500 Pro subscribers. Add health and premium modules.

- Oura Ring integration (OAuth + API)
- Push notifications via FCM
- 5–8 premium modules (stocks, sports, Spotify, task managers)
- AI daily summary (OpenAI API or Claude API)
- Module drag-and-drop reordering
- Minimal iOS app for Apple HealthKit bridge
- Sponsor/affiliate revenue experiments

### Phase 3: Scale (Months 10–18)

**Goal:** $20K+ MRR. Launch B2B and marketplace.

- White-label B2B offering for enterprises
- Third-party widget marketplace (developer program)
- Custom widget builder for power users
- Native iOS and Android apps (React Native or Swift/Kotlin)
- Business tier with team features and analytics
- International expansion (multi-language, regional news sources)

---

## 17. Open Questions

| Question                                 | Owner             | Blocking? | Notes                                        |
| ---------------------------------------- | ----------------- | --------- | -------------------------------------------- |
| Open-Meteo or OpenWeatherMap as primary? | Engineering       | No        | Open-Meteo is free but lacks alerts          |
| Direct calendar APIs vs Nylas?           | Engineering       | Yes (MVP) | Nylas simplifies but costs $10–50/user/month |
| Oura Ring app approval timeline?         | Product/BD        | No (P1)   | Apply early in Phase 1                       |
| Minimum viable HealthKit iOS app?        | Engineering (iOS) | No (P2)   | Estimate effort for Phase 2                  |
| Pro tier pricing: $9 vs $12 vs $15?      | Product/Growth    | No        | Test during beta                             |
| Postmark or Resend for email?            | Engineering       | No        | Test both in beta                            |
| News API production restrictions?        | Engineering       | Yes (MVP) | Guardian is only free production API         |
| Legal review of news display?            | Legal             | Yes (MVP) | Headlines + links = standard fair use        |
| Background workers: Vercel vs Railway?   | Engineering       | No        | Vercel cron for MVP                          |
| Analytics events taxonomy?               | Product/Data      | No        | Define before launch                         |

---

## 18. Appendix: API Quick Reference

| API             | Endpoint                                         | Auth       | Free Limit      | Key Data                          |
| --------------- | ------------------------------------------------ | ---------- | --------------- | --------------------------------- |
| Open-Meteo      | api.open-meteo.com/v1/forecast                   | None       | Unlimited       | Temp, feels-like, hourly, UV, AQI |
| OpenWeatherMap  | api.openweathermap.org/data/3.0/onecall          | API key    | 1,000/day       | Feels-like, alerts, UV, AQI       |
| Google Calendar | googleapis.com/calendar/v3                       | OAuth2     | ~1M/day         | Events, attendees, recurrence     |
| Microsoft Graph | graph.microsoft.com/v1.0/me/calendar             | OAuth2     | Very high       | Outlook events, free/busy         |
| Guardian        | content.guardianapis.com/search                  | API key    | 5,000/day       | Full articles, sections, tags     |
| NYT Top Stories | api.nytimes.com/svc/topstories/v2                | API key    | 500/day         | Headlines, URLs, metadata         |
| Newsdata.io     | newsdata.io/api/1/news                           | API key    | 200 credits/day | Multi-source, categorized news    |
| Oura Ring v2    | api.ouraring.com/v2/usercollection               | OAuth2     | 5,000/5 min     | Sleep, readiness, activity, HRV   |
| Wikimedia OTD   | api.wikimedia.org/feed/v1/wikipedia/en/onthisday | None       | Unlimited       | Events, births, deaths by date    |
| Firebase FCM    | fcm.googleapis.com/fcm/send                      | Server key | Unlimited       | Web + mobile push notifications   |

---

_— End of Document —_
