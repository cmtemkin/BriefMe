# BriefMe Dashboard & Demo Overhaul — Agent Prompt

> **Paste this entire prompt into a Claude Code session pointed at the BriefMe project root.**
> No follow-up instructions needed — the agent should be able to complete all tasks from this prompt alone.

---

## Context

BriefMe is a configurable morning digest web app (Next.js 15, React, Tailwind, shadcn/ui, TypeScript). The dashboard at `/dashboard` renders 6 widget cards in a 3-column grid. Right now it looks like a generic admin panel — not a warm, personal morning briefing. The demo is the first thing users see when they click "See a demo" on the landing page, so it needs to be **gorgeous and compelling**.

**Tech stack already in place:** Next.js App Router, Tailwind CSS, shadcn/ui components, lucide-react icons, next-themes (light/dark), Geist font family.

---

## What to Fix (in priority order)

### 1. RICH DEMO DATA — Replace all placeholder/loading states

**File:** `src/app/(dashboard)/dashboard/page.tsx`

The `DEMO_WIDGETS` array currently has placeholder data. Replace it with realistic, compelling mock content:

**Weather** (already decent, but enhance):

- Keep Needham, MA, but make the temps seasonally accurate for today's date
- Keep hourly forecast, feels-like, wind, humidity — these are good

**Calendar** — change `connected: false` to `connected: true` and add these mock events:

```typescript
events: [
  { id: "1", title: "Team standup", startTime: "2026-02-11T09:00:00", endTime: "2026-02-11T09:15:00", source: "google", isAllDay: false },
  { id: "2", title: "Product review with Sarah", startTime: "2026-02-11T10:30:00", endTime: "2026-02-11T11:30:00", location: "Zoom", source: "google", isAllDay: false },
  { id: "3", title: "Lunch with Alex", startTime: "2026-02-11T12:00:00", endTime: "2026-02-11T13:00:00", location: "Legal Sea Foods, Dedham", source: "outlook", isAllDay: false },
  { id: "4", title: "Sprint planning", startTime: "2026-02-11T14:00:00", endTime: "2026-02-11T15:00:00", source: "google", isAllDay: false },
],
eventCount: 4,
```

**News** — replace the single loading placeholder with 5 real-sounding headlines:

```typescript
headlines: [
  { id: 1, title: "Fed signals potential rate adjustment as inflation data shows mixed signals", url: "#", source: "The Guardian", section: "Business", summary: "" },
  { id: 2, title: "Breakthrough battery technology promises 1,000-mile EV range", url: "#", source: "The Guardian", section: "Technology", summary: "" },
  { id: 3, title: "Winter storm warning issued for Northeast, up to 8 inches expected", url: "#", source: "The Guardian", section: "US News", summary: "" },
  { id: 4, title: "NASA confirms new Earth-like exoplanet discovery within habitable zone", url: "#", source: "The Guardian", section: "Science", summary: "" },
  { id: 5, title: "Premier League title race tightens as top three all win", url: "#", source: "The Guardian", section: "Sports", summary: "" },
],
```

**Health** — change `connected: false` to `connected: true` and add scores:

```typescript
connected: true,
sleepScore: 82,
readinessScore: 88,
steps: 7342,
```

**Games** — keep as-is, it works fine.

**History** — replace loading placeholder with real February 11 events:

```typescript
events: [
  { text: "Nelson Mandela is released from Victor Verster Prison after 27 years", year: 1990, url: "https://en.wikipedia.org/wiki/Nelson_Mandela" },
  { text: "The Lateran Treaty is signed, establishing Vatican City as a sovereign state", year: 1929, url: "https://en.wikipedia.org/wiki/Lateran_Treaty" },
  { text: "Iran's Islamic Revolution succeeds as Shapour Bakhtiar's government falls", year: 1979, url: "https://en.wikipedia.org/wiki/Iranian_Revolution" },
],
births: [
  { text: "Thomas Edison, inventor and businessman", year: 1847, url: null },
  { text: "Jennifer Aniston, actress", year: 1969, url: null },
  { text: "Taylor Lautner, actor", year: 1992, url: null },
],
date: "February 11",
```

---

### 2. ADD A PERSONALIZED GREETING to the dashboard header

**File:** `src/app/(dashboard)/dashboard/page.tsx`

Change the current header from:

```tsx
<h1 className="text-2xl font-bold">Your Morning Briefing</h1>
```

To a warm, personalized greeting:

```tsx
<h1 className="text-2xl font-bold">Good morning, Charlie</h1>
<p className="text-sm text-muted-foreground">
  Here's your briefing for {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
</p>
```

(In production this would use the user's actual name from auth — for demo purposes, hardcode "Charlie".)

---

### 3. VISUAL HIERARCHY — Make the weather card a hero

**File:** `src/components/dashboard/dashboard-grid.tsx`

Change the grid layout so the **weather card spans 2 columns** on large screens:

Replace:

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

With a layout that makes the first widget (weather) a featured card:

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {widgets.map(({ moduleId, data, loading }, index) => {
    if (loading || !data) {
      return <WidgetSkeleton key={moduleId} />;
    }
    const Component = WIDGET_COMPONENTS[moduleId];
    if (!Component) return null;
    // Weather card spans 2 columns on large screens
    const isHero = moduleId === "weather";
    return (
      <div key={moduleId} className={isHero ? "sm:col-span-2" : ""}>
        <Component data={data} />
      </div>
    );
  })}
</div>
```

---

### 4. WARM COLOR ACCENTS — Add personality to widget headers

Add subtle color accents to each widget card header to create visual distinction.

**File:** `src/components/widgets/weather-card.tsx`

- Add a subtle gradient background to the card: add `className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30"` to the outer `<Card>` element.

**File:** `src/components/widgets/calendar-card.tsx`

- Add `className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30"` to the `<Card>`.

**File:** `src/components/widgets/news-card.tsx`

- Add `className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30"` to the `<Card>`.

**File:** `src/components/widgets/health-card.tsx`

- Add `className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"` to the `<Card>`.

**File:** `src/components/widgets/games-card.tsx`

- Add `className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30"` to the `<Card>`.

**File:** `src/components/widgets/history-card.tsx`

- Add `className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30"` to the `<Card>`.

---

### 5. DEFAULT TO LIGHT THEME for the demo

The landing page currently defaults to `system` theme, which often resolves to dark mode. For a morning app demo, light should be the default.

**File:** `src/app/layout.tsx`

Change the ThemeProvider from:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

To:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="light"
  enableSystem
  disableTransitionOnChange
>
```

---

### 6. LANDING PAGE — Link "See a demo" directly to /dashboard

The landing page's "See a demo" button already links to `/dashboard`, which is correct. No change needed here, just verify it works after your changes.

---

## Files You'll Touch

1. `src/app/(dashboard)/dashboard/page.tsx` — demo data + greeting
2. `src/components/dashboard/dashboard-grid.tsx` — hero layout
3. `src/components/widgets/weather-card.tsx` — gradient bg
4. `src/components/widgets/calendar-card.tsx` — gradient bg
5. `src/components/widgets/news-card.tsx` — gradient bg
6. `src/components/widgets/health-card.tsx` — gradient bg
7. `src/components/widgets/games-card.tsx` — gradient bg
8. `src/components/widgets/history-card.tsx` — gradient bg
9. `src/app/layout.tsx` — default theme

---

## Validation Steps

After making all changes:

1. Run `npm run type-check` — must pass with zero errors
2. Run `npm run lint` — must pass (fix any lint issues)
3. Run `npm run build` — must succeed
4. Start the dev server on port 3003 (`PORT=3003 npm run dev`) and visually verify:
   - `/` landing page loads, "See a demo" button works
   - `/dashboard` shows all 6 widgets with real data (no "Loading..." or "Connect..." empty states)
   - Greeting says "Good morning, Charlie"
   - Weather card spans 2 columns on desktop
   - Each card has a subtle pastel gradient background
   - Light theme is the default
   - Dark mode still works via the toggle button in the dashboard header
5. Commit with message: `feat: overhaul dashboard demo with rich data, warm design, and personalized greeting`

---

## DO NOT

- Do NOT create new files or components — only modify existing ones
- Do NOT change the widget card interfaces or data types
- Do NOT touch the API routes, middleware, or any backend code
- Do NOT add new npm dependencies
- Do NOT modify the landing page (page.tsx at root) — it's fine as-is
- Do NOT change the onboarding flow or settings pages
