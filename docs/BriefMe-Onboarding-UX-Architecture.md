# BriefMe — Signup & Onboarding UX Architecture

**High-Impact First Impressions That Convert**

February 2026 | v1.0

---

## 1. Design Philosophy

BriefMe's onboarding is the product. A user who configures their first digest and sees a live preview has already experienced the core value. The signup-to-first-value pipeline must take under 90 seconds and feel like unwrapping a gift, not filling out a form.

> **North Star Metric:** Time to First Briefing: <90 seconds from landing page to seeing a personalized preview digest. This is the single most important metric for the onboarding team.

---

## 2. Authentication Strategy

Three-tier auth stack, optimized for speed and trust. Every extra second of friction costs ~7% conversion.

| Method              | Priority  | Conversion Impact                                          | Implementation                                                            |
| ------------------- | --------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| Google One-Tap      | Primary   | +20% vs standard OAuth buttons                             | Clerk's Google One-Tap integration; auto-detects logged-in Google session |
| Apple Sign-In       | Secondary | Required for iOS; trust signal for privacy-conscious users | Clerk Apple provider; must support "Hide My Email"                        |
| Microsoft SSO       | Secondary | Critical for Outlook calendar users                        | Clerk Microsoft provider; Azure AD                                        |
| Passkeys (WebAuthn) | Tertiary  | +33% vs passwords                                          | Clerk passkey support; biometric prompt                                   |
| Email Magic Link    | Fallback  | Lowest friction for non-social-auth users                  | Clerk magic link; 90s avg completion                                      |

> **Key Decision: No Passwords.** BriefMe should launch without password-based auth. Passwords add friction, create support burden, and reduce security. Social auth + passkeys + magic links cover 99%+ of users. This is a deliberate brand statement: BriefMe respects your time from the very first interaction.

---

## 3. The 4-Step Onboarding Wizard

Research shows 3–5 steps is optimal. More than 5 causes 38%+ drop-off at first screen alone. Each step must feel like progress, not paperwork.

### Step 1: "What Matters to You?"

**Goal:** Module selection in <20 seconds

Display a grid of 8–10 module cards (weather, calendar, news, health, games, history, quotes, countdowns). Each card has an icon, title, and one-line description. Users tap to toggle ON/OFF. Pre-select the 4 most popular modules as smart defaults (weather, calendar, news, games).

> **UX Pattern: Smart Defaults + Opt-Out.** Pre-selecting popular modules converts 15–25% better than a blank slate. Users feel they're "unboxing" a curated product, not building one from scratch. The CTA button says "Continue with 4 modules" (dynamic count) — not just "Next."

### Step 2: "Quick Config"

**Goal:** Configure the 2–3 most impactful settings in <30 seconds

Based on which modules the user selected, show only the most critical config for each. Not every option — just the ones that make the biggest difference.

| If Module Selected | Show This Config                                                              | Why This One                         |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------ |
| Weather            | Location (auto-detected with "Edit" link)                                     | Wrong location = worthless module    |
| Calendar           | "Connect Google Calendar" or "Connect Outlook" button                         | Calendar is the highest-value module |
| News               | Pick 3 categories from chips (World, Tech, Business, Science, Sports, Health) | Ensures relevance on first digest    |
| Health             | "Connect Oura Ring" button                                                    | OAuth required; defer if not ready   |
| Games              | No config needed                                                              | Links are static; works immediately  |
| History            | No config needed                                                              | API is date-based; works immediately |

**Critical UX detail:** Every OAuth connection button has a "Skip for now" link below it. Never gate progress behind an integration. The user can always connect later from Settings.

### Step 3: "Choose Your Delivery"

**Goal:** Delivery method + time in <15 seconds

Three large toggle cards: Web Dashboard (always on), Email Digest, Push Notification. Each has a simple illustration and one-line description. Below: a time picker for "When should we brief you?" defaulting to 6:30 AM with a friendly timezone auto-detect.

> **Conversion Insight:** Email digest opt-in at onboarding converts 40–60% of users. Users who enable email delivery have 2x higher 30-day retention. Show a preview email thumbnail next to the toggle to increase opt-in.

### Step 4: "Your First Briefing" (The Magic Moment)

**Goal:** Show a real, personalized digest preview — not a generic mockup

This is the most important screen. While the user was completing Steps 1–3, the backend was fetching real data for their selected modules. Step 4 renders a live preview of their actual first digest with their weather, their calendar events, real headlines from their chosen sources, and today's historical fact.

> **The "Wow" Moment:** This screen should feel like Spotify Wrapped — a personalized reveal that makes users think "this is MINE." Subtle confetti animation (Lottie, <200ms) when the digest loads. CTA: "This is your morning. Enjoy it." with a "Customize more" link below. If calendar was connected: "You have 4 meetings today" creates immediate personal relevance.

---

## 4. Live Preview Architecture

The split-screen live preview during onboarding is BriefMe's single biggest UX differentiator. As users toggle modules and configure settings, the right panel updates in real time.

| Component        | Implementation                                                                             | Performance Target                |
| ---------------- | ------------------------------------------------------------------------------------------ | --------------------------------- |
| Preview panel    | React Server Component with streaming; renders actual widget cards                         | <200ms update after config change |
| Data prefetch    | On signup, immediately fetch weather (IP-based) + news (default sources) + history (today) | Start fetching during auth flow   |
| Calendar preview | If OAuth completed in Step 2, show real events; otherwise show skeleton placeholder        | Skeleton loads in <50ms           |
| Skeleton states  | Animated pulse skeletons for unconnected modules; says "Connect to see your data"          | No blank states ever              |
| Mobile layout    | Stacked layout (config on top, preview below with "See preview" toggle)                    | Smooth scroll, no page reload     |

---

## 5. Progressive Disclosure Strategy

BriefMe collects more context over time without overwhelming users upfront. This is critical for conversion: every additional field costs ~7% completion rate.

| When                  | What We Ask                                              | Why Now                             |
| --------------------- | -------------------------------------------------------- | ----------------------------------- |
| Signup (0 sec)        | Email only (via social auth)                             | Minimum viable identity             |
| Onboarding (0–90 sec) | Module selection + 2–3 configs                           | Required for first value            |
| First digest viewed   | "Want to add Oura Ring?" in-context prompt               | User sees health module placeholder |
| Day 3                 | In-app prompt: "Choose your news sources"                | User has baseline; ready to refine  |
| Day 7                 | Email: "You've read 7 digests! Unlock Pro features"      | Habit formed; conversion window     |
| Day 14                | Push: "3 new modules available: Stocks, Sports, Spotify" | Expand engagement                   |
| Day 30                | In-app: "Export your digest as a shareable card"         | Activate virality                   |

---

## 6. Gamification & Engagement Hooks

Gamification boosts onboarding completion by 22% and conversion by 15%. BriefMe uses subtle, tasteful gamification that respects the user's intelligence.

### 6.1 Onboarding Progress

- **Progress bar:** "Step 2 of 4 — You're almost there" across the top of the wizard
- **Completion celebration:** Confetti + "Your morning is ready" when reaching Step 4
- **Module count:** Dynamic button text: "Continue with 5 modules" reinforces that they've built something

### 6.2 Post-Onboarding Streaks

- **Reading streak:** "7 days in a row!" badge in dashboard header
- **Milestone cards:** "You've read 100 articles with BriefMe" — shareable to social
- **Weekly digest:** Sunday summary email: "This week you read X articles, saved Y minutes"

### 6.3 Social Proof During Onboarding

- **Live counter:** "12,847 people got briefed this morning" on landing page
- **Module popularity:** "Weather is the #1 module — enabled by 94% of users" next to each card
- **Testimonial snippets:** Rotating 1-line quotes from real users below the CTA

---

## 7. Error States & Recovery Flows

| Error                      | What User Sees                                                                  | Recovery Path                          |
| -------------------------- | ------------------------------------------------------------------------------- | -------------------------------------- |
| OAuth denied/cancelled     | "No worries! You can connect [Calendar] anytime from Settings."                 | Continue without; show skeleton module |
| OAuth token expired        | Yellow banner: "Your [Google Calendar] connection needs a refresh."             | One-click "Reconnect" button           |
| API failure (weather/news) | Graceful fallback: "Weather is updating..." with last-known data                | Auto-retry in 5 min; show cache        |
| No modules selected        | Friendly nudge: "Pick at least 1 module to get started!"                        | Highlight recommended modules          |
| Email delivery failure     | Dashboard banner: "Your email didn't deliver. Check spam or update your email." | Link to Settings > Email               |
| Slow connection            | Skeleton loaders + "Fetching your briefing..." with progress indicator          | Timeout at 10s; show partial digest    |

---

## 8. Mobile-First Design Principles

33%+ of all email opens and 50%+ of web traffic is mobile. BriefMe's onboarding and dashboard must be mobile-first, not mobile-adapted.

- **Touch targets:** Minimum 44px height for all buttons and toggles (Apple HIG standard)
- **Module cards:** Full-width on mobile, 2-column grid on tablet, 3-column on desktop
- **Swipe navigation:** Swipe left/right between onboarding steps on mobile
- **Bottom-anchored CTA:** "Continue" button fixed to bottom of screen; always visible
- **Thumb-zone optimization:** Primary actions in bottom 40% of screen; secondary actions (Skip, Back) at top
- **No hover states:** All interactive elements must have tap/active states, not hover-dependent UI

---

## 9. Target Conversion Benchmarks

| Funnel Step                  | Industry Avg | BriefMe Target | How We Beat Avg                                                  |
| ---------------------------- | ------------ | -------------- | ---------------------------------------------------------------- |
| Landing → Signup             | 3–5%         | 8%+            | One-click Google auth; no password; live preview on landing page |
| Signup → Onboarding Start    | 70–80%       | 95%+           | Auto-redirect; no email verification gate                        |
| Onboarding Start → Complete  | 40–60%       | 80%+           | 4 steps; smart defaults; live preview; <90s total                |
| Onboarding → Day 7 Retention | 25–40%       | 60%+           | Email digest habit; streak gamification; progressive nudges      |
| Free → Pro (Month 3)         | 3–5%         | 5–8%           | Feature gating on delivery channels; premium module teasers      |

---

## 10. Technical Implementation Notes

### 10.1 Prefetch Pipeline

Begin data fetching the moment a user authenticates, before onboarding starts. By the time they reach Step 4, their digest data is already cached.

> **Prefetch Sequence (triggered on auth success):**
>
> 1. Resolve user's location via IP geolocation (ipapi.co, free)
> 2. Fetch weather for detected location (Open-Meteo, <200ms)
> 3. Fetch top 5 news headlines from default sources (Guardian API, <300ms)
> 4. Fetch "On This Day" data from Wikimedia (<150ms)
> 5. If Google Calendar OAuth completed: fetch today's events (<500ms)
> 6. Cache all results in Redis with 15-min TTL
> 7. Total time: <1.2s in parallel — invisible to user during onboarding steps

### 10.2 Clerk Integration Flow

1. User clicks "Sign in with Google" on landing page
2. Clerk handles OAuth flow, returns user session
3. On session creation webhook: trigger prefetch pipeline
4. Redirect to /onboarding with Clerk session active
5. Onboarding wizard reads Clerk user metadata for email, name
6. On wizard completion: write module configs to PostgreSQL
7. Redirect to /dashboard with first digest pre-rendered

### 10.3 A/B Testing Framework

Ship with Posthog feature flags for rapid experimentation:

| Test                           | Variants                               | Primary Metric             |
| ------------------------------ | -------------------------------------- | -------------------------- |
| Smart defaults ON vs OFF       | 4 pre-selected modules vs blank slate  | Onboarding completion rate |
| 3-step vs 4-step wizard        | Merge Steps 2+3 vs keep separate       | Time-to-first-value        |
| Progress bar vs step dots      | Linear bar vs numbered dots            | Step-to-step drop-off      |
| Confetti vs no celebration     | Animated celebration vs simple "Done!" | Day-7 retention            |
| Email opt-in default ON vs OFF | Pre-checked email toggle vs unchecked  | Email delivery rate        |

---

_— End of Document —_
