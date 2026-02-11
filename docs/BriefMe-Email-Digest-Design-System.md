# BriefMe — Email Digest Design System

**Beautiful Emails That People Actually Open**

February 2026 | v1.0

---

## 1. Email Design Philosophy

BriefMe's email digest is not a notification — it's a morning ritual. It should feel like opening a beautifully designed magazine, not parsing a data dump. Every pixel serves a purpose: inform, delight, and respect the reader's time.

> **Design Principles:**
>
> 1. Scannable in 30 seconds. Readable in 3 minutes. Actionable in every section.
> 2. Mobile-first always. 33%+ of opens are on phones; design for thumb-scrolling.
> 3. Personality over polish. Warm, witty, personal — never corporate or robotic.
> 4. Dark mode native. Not an afterthought. Test in dark mode first.
> 5. Zero-click value. The email itself IS the product, not a teaser to click through.

---

## 2. Email Layout Architecture

The digest email follows a modular card-based layout. Each module is a self-contained section that can be added, removed, or reordered based on user preferences.

### 2.1 Header Section

- **Logo + date:** "BriefMe — Tuesday, February 10" left-aligned
- **Personal greeting:** "Good morning, Charlie" with user's first name
- **One-line summary:** "You have 4 meetings today. Feels like 28°F. Here's what you need to know."
- **Reading time:** "3 min read" badge in top-right

### 2.2 Module Card Anatomy

Each module card follows a consistent structure:

| Element       | Specification                           | Purpose                          |
| ------------- | --------------------------------------- | -------------------------------- |
| Section icon  | 16x16 inline emoji or SVG icon          | Quick visual identifier          |
| Section title | Bold, 16px, brand color                 | Scannable section label          |
| Content area  | 14px body text, 1.5 line height         | The actual information           |
| Action link   | Underlined text link, accent color      | Deep link to source              |
| Divider       | 1px line, #E6E6E6, 15px vertical margin | Clean separation between modules |

### 2.3 Module Order (Default)

1. **Header** — Greeting + one-line summary
2. **Weather** — Current temp, feels-like, hourly forecast mini-bar
3. **Calendar** — Today's events, color-coded by source
4. **Health** — Sleep score, readiness score, HRV trend
5. **News** — 5 headlines with source badges and links
6. **Games** — NYT game links with playful copy
7. **Fun Facts** — This Day in History + celebrity birthday
8. **Footer** — Manage preferences, unsubscribe, social links

---

## 3. Typography System

| Element                  | Font               | Size | Weight | Color                |
| ------------------------ | ------------------ | ---- | ------ | -------------------- |
| Greeting                 | Georgia (serif)    | 24px | Normal | #1B3A5C              |
| Module title             | Arial (sans-serif) | 16px | Bold   | #1B3A5C              |
| Body text                | Arial              | 14px | Normal | #333333              |
| Meta text (source, time) | Arial              | 12px | Normal | #888888              |
| CTA links                | Arial              | 14px | Bold   | #2C5F8A (underlined) |
| Footer text              | Arial              | 11px | Normal | #AAAAAA              |

> **Why Georgia for the Greeting?** Serif fonts signal warmth, editorial quality, and trust — like a newspaper. The greeting is the one moment we set the tone: personal, unhurried, inviting. Body text stays sans-serif (Arial) for maximum readability on small screens.

---

## 4. Color System

| Color              | Hex     | Usage                               | Dark Mode                    |
| ------------------ | ------- | ----------------------------------- | ---------------------------- |
| Navy (Primary)     | #1B3A5C | Headers, module titles, key accents | #E8EDF2 (inverted to light)  |
| Sky Blue (Accent)  | #2C5F8A | Links, CTAs, interactive elements   | #5BA3E0 (lighter blue)       |
| White (Background) | #FFFFFF | Email body background               | #1A1A2E (deep navy-black)    |
| Light Gray (Cards) | #F8F9FA | Module card backgrounds             | #2A2A3E (dark card surface)  |
| Border Gray        | #E6E6E6 | Dividers, card borders              | #3A3A4E (subtle dark border) |
| Text Primary       | #333333 | Body text                           | #E0E0E0 (light text)         |
| Text Secondary     | #888888 | Meta text, timestamps               | #999999 (medium gray)        |
| Success Green      | #27AE60 | Positive health metrics, streaks    | #2ECC71 (brighter green)     |
| Warning Amber      | #F39C12 | Alerts, low sleep scores            | #F1C40F (brighter amber)     |
| CTA Orange         | #E67E22 | Primary call-to-action buttons      | #F39C12 (lighter orange)     |

---

## 5. Dark Mode Implementation

82% of smartphone users enable dark mode. 34% of email opens happen in dark mode. BriefMe designs for dark mode first, then verifies light mode.

> **Dark Mode CSS Strategy:**
>
> ```css
> @media (prefers-color-scheme: dark) {
>   .email-body {
>     background-color: #1a1a2e !important;
>   }
>   .card-bg {
>     background-color: #2a2a3e !important;
>   }
>   .text-primary {
>     color: #e0e0e0 !important;
>   }
>   .text-heading {
>     color: #e8edf2 !important;
>   }
>   .link-color {
>     color: #5ba3e0 !important;
>   }
> }
> ```

- **Images:** Add 1px light border in dark mode to prevent images from floating in the void
- **Logos:** Ship both light and dark logo variants; swap with media query
- **Charts/graphs:** Use color palette with sufficient contrast in both modes (WCAG AA minimum 4.5:1)
- **Testing:** Test in Apple Mail (dark), Gmail (dark), Outlook (dark) before every send

---

## 6. Module Design Templates

### 6.1 Weather Module

Compact horizontal layout. Current temp (large, bold), feels-like (smaller, italic), and a 6-hour mini forecast as small text badges.

- **Layout:** Single row: [Icon] 28°F • Feels like 22°F • Cloudy | 7AM 25° 8AM 26° 9AM 28°
- **Personality:** "Bundle up — it's a cold one today." or "Beautiful day ahead!" based on conditions

### 6.2 Calendar Module

Timeline format with color-coded source indicators.

- **Layout:** Vertical timeline: time on left, event title + source badge on right
- **Color coding:** Blue dot = Google, Purple dot = Outlook, Orange dot = Apple
- **Conflicts:** Overlapping events highlighted in amber with "Conflict" badge
- **Empty state:** "No meetings today — enjoy the freedom!"

### 6.3 News Module

Card-based headlines with source attribution.

- **Layout:** Headline (bold, linked) + source badge + 1-line preview text
- **Source badges:** Small, rounded pills: [Guardian] [NYT] [Reuters] in source brand colors
- **Numbering:** Optional "1." through "5." for scannability

### 6.4 Health Module

Dashboard-style metrics with color-coded scores.

- **Layout:** Three inline metric cards: Sleep Score (81/100), Readiness (74/100), Steps (8,432)
- **Color coding:** Green (>80), Amber (60–80), Red (<60) for scores
- **Trend arrow:** ↑ or ↓ vs 7-day average

### 6.5 Games Module

Playful, visual link row.

- **Layout:** Horizontal row of 5 game icons/emojis with names as links below each
- **Copy:** "Today's puzzles are ready! Don't break your streak."
- **Personality:** Rotate daily quips: "Wordle waits for no one." / "Connections is feeling tricky today."

### 6.6 Fun Facts Module

- **Layout:** Single card with "On This Day" header, year in large text, event description, Wikipedia link
- **Birthday:** Below fact: "Born today: [Name] ([Year]) — [Brief description]"

---

## 7. Technical Implementation

### 7.1 Framework: MJML + React

Use mjml-react (by Faire) to combine MJML's responsive email foundation with React's component model for dynamic content generation.

| Framework           | Strengths                                     | Best For                               |
| ------------------- | --------------------------------------------- | -------------------------------------- |
| MJML                | Mobile-first, responsive, wide client support | Static layouts, broad compatibility    |
| React Email         | Modern DX, JSX templates, Resend integration  | Developer experience, fast iteration   |
| mjml-react (Hybrid) | MJML reliability + React composability        | Dynamic, personalized content at scale |
| Maizzle             | Tailwind CSS for email, framework-agnostic    | Teams already using Tailwind           |

### 7.2 Personalization Engine

Every email is unique. The rendering pipeline injects user-specific data into MJML templates:

| Token               | Source                   | Fallback                             |
| ------------------- | ------------------------ | ------------------------------------ |
| `{{firstName}}`     | Clerk user profile       | "there" ("Good morning, there")      |
| `{{weatherTemp}}`   | Open-Meteo API cache     | "Check your dashboard" link          |
| `{{calendarCount}}` | Google/Outlook API cache | "Connect your calendar" CTA          |
| `{{sleepScore}}`    | Oura API cache           | Module hidden if not connected       |
| `{{newsHeadlines}}` | Guardian/NYT API cache   | Default top 5 from popular sources   |
| `{{gameLinks}}`     | Static NYT URLs          | Always available; no fallback needed |
| `{{historyFact}}`   | Wikimedia API cache      | "Explore today in history" link      |

### 7.3 Rendering Pipeline

> **Email Generation Flow (per user):**
>
> 1. Cron job triggers at user's configured time
> 2. Load user's active modules + config from PostgreSQL
> 3. For each module: pull data from Redis cache (pre-fetched by widget pipeline)
> 4. Inject data into mjml-react component tree
> 5. Render MJML → responsive HTML
> 6. Inline all CSS (required for email clients)
> 7. Generate plain-text version (accessibility + spam filter compliance)
> 8. Send via Postmark API with tracking pixels
> 9. Log send event + unique open/click tracking IDs to Posthog

---

## 8. Performance Benchmarks

| Metric             | Industry Average              | BriefMe Target    | How We Achieve It                                                         |
| ------------------ | ----------------------------- | ----------------- | ------------------------------------------------------------------------- |
| Open rate          | 43.5% (inflated by Apple MPP) | 50%+ (real opens) | Personalized subject lines; consistent daily delivery; "from" = BriefMe   |
| Click-through rate | 2.09%                         | 5%+               | Zero-click value; only link to sources users chose; game links = high CTR |
| Click-to-open rate | 6.81%                         | 10%+              | Every section has actionable links; deep links to dashboard               |
| Unsubscribe rate   | <0.5%                         | <0.2%             | High personalization; easy frequency control; not spammy                  |
| Inbox placement    | 85–90%                        | 95%+              | Postmark (22% better delivery); DKIM/SPF/DMARC configured                 |
| Render time        | N/A                           | <2s on 3G         | MJML mobile-first; minimal images; inlined CSS                            |

---

## 9. Subject Line Strategy

The subject line is the most important piece of copy in BriefMe's entire product. It determines whether users open their digest or scroll past it.

### 9.1 Subject Line Formula

**Pattern:** [Personal data point] + [Curiosity hook]

| Example                                                 | Why It Works                                              |
| ------------------------------------------------------- | --------------------------------------------------------- |
| Charlie, 28°F and 4 meetings today                      | Personal name + weather + calendar = immediate relevance  |
| Your sleep score: 81. Plus 5 stories to start your day. | Health data creates curiosity; count creates scannability |
| 3 meetings, clear skies, and a fun fact about 1969      | Three data points cascade into intrigue                   |
| Good morning — today's Wordle is waiting                | Warm tone + game reminder = delight                       |

> **Subject Line Rules:**
>
> 1. Always include the user's first name (20%+ higher open rates with personalization).
> 2. Never exceed 50 characters (mobile truncation).
> 3. Include at least one data point (temp, meeting count, sleep score).
> 4. Rotate patterns weekly to avoid fatigue.
> 5. A/B test 2 variants per week via Posthog + Postmark.

---

_— End of Document —_
