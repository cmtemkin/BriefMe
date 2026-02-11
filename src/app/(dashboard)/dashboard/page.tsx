import { DashboardGrid } from "@/components/dashboard/dashboard-grid";

// Rich demo data for showcasing the dashboard experience
const DEMO_WIDGETS = [
  {
    moduleId: "weather",
    loading: false,
    data: {
      widgetId: "weather",
      fetchedAt: new Date(),
      data: {
        temperature: 28,
        feelsLike: 18,
        condition: "Partly cloudy",
        conditionEmoji: "⛅",
        windSpeed: 14,
        humidity: 55,
        high: 34,
        low: 22,
        units: "fahrenheit",
        locationName: "Needham, MA",
        hourlyForecast: [
          { hour: 7, temp: 22, condition: { label: "Clear", emoji: "☀️" } },
          { hour: 8, temp: 24, condition: { label: "Clear", emoji: "☀️" } },
          {
            hour: 9,
            temp: 26,
            condition: { label: "Partly cloudy", emoji: "⛅" },
          },
          {
            hour: 10,
            temp: 28,
            condition: { label: "Partly cloudy", emoji: "⛅" },
          },
          { hour: 11, temp: 30, condition: { label: "Cloudy", emoji: "☁️" } },
          { hour: 12, temp: 32, condition: { label: "Cloudy", emoji: "☁️" } },
        ],
      },
    },
  },
  {
    moduleId: "calendar",
    loading: false,
    data: {
      widgetId: "calendar",
      fetchedAt: new Date(),
      data: {
        connected: true,
        events: [
          {
            id: "1",
            title: "Team standup",
            startTime: "2026-02-11T09:00:00",
            endTime: "2026-02-11T09:15:00",
            source: "google",
            isAllDay: false,
          },
          {
            id: "2",
            title: "Product review with Sarah",
            startTime: "2026-02-11T10:30:00",
            endTime: "2026-02-11T11:30:00",
            location: "Zoom",
            source: "google",
            isAllDay: false,
          },
          {
            id: "3",
            title: "Lunch with Alex",
            startTime: "2026-02-11T12:00:00",
            endTime: "2026-02-11T13:00:00",
            location: "Legal Sea Foods, Dedham",
            source: "outlook",
            isAllDay: false,
          },
          {
            id: "4",
            title: "Sprint planning",
            startTime: "2026-02-11T14:00:00",
            endTime: "2026-02-11T15:00:00",
            source: "google",
            isAllDay: false,
          },
        ],
        eventCount: 4,
      },
    },
  },
  {
    moduleId: "news",
    loading: false,
    data: {
      widgetId: "news",
      fetchedAt: new Date(),
      data: {
        headlines: [
          {
            id: 1,
            title:
              "Fed signals potential rate adjustment as inflation data shows mixed signals",
            url: "#",
            source: "The Guardian",
            section: "Business",
            summary: "",
          },
          {
            id: 2,
            title:
              "Breakthrough battery technology promises 1,000-mile EV range",
            url: "#",
            source: "The Guardian",
            section: "Technology",
            summary: "",
          },
          {
            id: 3,
            title:
              "Winter storm warning issued for Northeast, up to 8 inches expected",
            url: "#",
            source: "The Guardian",
            section: "US News",
            summary: "",
          },
          {
            id: 4,
            title:
              "NASA confirms new Earth-like exoplanet discovery within habitable zone",
            url: "#",
            source: "The Guardian",
            section: "Science",
            summary: "",
          },
          {
            id: 5,
            title: "Premier League title race tightens as top three all win",
            url: "#",
            source: "The Guardian",
            section: "Sports",
            summary: "",
          },
        ],
      },
    },
  },
  {
    moduleId: "health",
    loading: false,
    data: {
      widgetId: "health",
      fetchedAt: new Date(),
      data: {
        connected: true,
        sleepScore: 82,
        readinessScore: 88,
        steps: 7342,
      },
    },
  },
  {
    moduleId: "games",
    loading: false,
    data: {
      widgetId: "games",
      fetchedAt: new Date(),
      data: {
        games: [
          {
            id: "wordle",
            name: "Wordle",
            url: "https://www.nytimes.com/games/wordle/index.html",
            color: "#6AAA64",
          },
          {
            id: "connections",
            name: "Connections",
            url: "https://www.nytimes.com/games/connections",
            color: "#B59410",
          },
          {
            id: "strands",
            name: "Strands",
            url: "https://www.nytimes.com/games/strands",
            color: "#4A90D9",
          },
          {
            id: "mini",
            name: "Mini Crossword",
            url: "https://www.nytimes.com/crosswords/game/mini",
            color: "#000000",
          },
          {
            id: "spelling-bee",
            name: "Spelling Bee",
            url: "https://www.nytimes.com/puzzles/spelling-bee",
            color: "#F5C518",
          },
        ],
        quip: "Time to flex those brain muscles!",
        date: new Date().toISOString().split("T")[0],
      },
    },
  },
  {
    moduleId: "history",
    loading: false,
    data: {
      widgetId: "history",
      fetchedAt: new Date(),
      data: {
        events: [
          {
            text: "Nelson Mandela is released from Victor Verster Prison after 27 years",
            year: 1990,
            url: "https://en.wikipedia.org/wiki/Nelson_Mandela",
          },
          {
            text: "The Lateran Treaty is signed, establishing Vatican City as a sovereign state",
            year: 1929,
            url: "https://en.wikipedia.org/wiki/Lateran_Treaty",
          },
          {
            text: "Iran's Islamic Revolution succeeds as Shapour Bakhtiar's government falls",
            year: 1979,
            url: "https://en.wikipedia.org/wiki/Iranian_Revolution",
          },
        ],
        births: [
          {
            text: "Thomas Edison, inventor and businessman",
            year: 1847,
            url: null,
          },
          { text: "Jennifer Aniston, actress", year: 1969, url: null },
          { text: "Taylor Lautner, actor", year: 1992, url: null },
        ],
        date: "February 11",
      },
    },
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Good morning, Charlie</h1>
        <p className="text-muted-foreground text-sm">
          Here&apos;s your briefing for{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <DashboardGrid widgets={DEMO_WIDGETS} />
    </div>
  );
}
