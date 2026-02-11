import type {
  Widget,
  WidgetConfig,
  WidgetData,
  NotificationPayload,
} from "./types";

interface Game {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

const GAMES: Game[] = [
  {
    id: "wordle",
    name: "Wordle",
    url: "https://www.nytimes.com/games/wordle/index.html",
    icon: "Grid2x2",
    color: "#6AAA64",
  },
  {
    id: "connections",
    name: "Connections",
    url: "https://www.nytimes.com/games/connections",
    icon: "Link2",
    color: "#B59410",
  },
  {
    id: "strands",
    name: "Strands",
    url: "https://www.nytimes.com/games/strands",
    icon: "Sparkles",
    color: "#4A90D9",
  },
  {
    id: "mini",
    name: "Mini Crossword",
    url: "https://www.nytimes.com/crosswords/game/mini",
    icon: "Hash",
    color: "#000000",
  },
  {
    id: "spelling-bee",
    name: "Spelling Bee",
    url: "https://www.nytimes.com/puzzles/spelling-bee",
    icon: "Hexagon",
    color: "#F5C518",
  },
];

const QUIPS = [
  "Time to flex those brain muscles!",
  "Your daily dose of wordplay awaits.",
  "Challenge accepted? Game on!",
  "Coffee + puzzles = perfect morning.",
  "How fast can you solve today's puzzles?",
  "Beat yesterday's time?",
  "Your brain will thank you.",
  "No peeking at the answers!",
  "May the letters be ever in your favor.",
  "Ready, set, solve!",
];

export const gamesWidget: Widget = {
  metadata: {
    id: "games",
    name: "Daily Games",
    description: "Quick links to NYT puzzles and word games",
    icon: "Gamepad2",
    tier: "free",
    category: "fun",
    defaultEnabled: true,
    defaultPosition: 4,
    configSchema: {
      games: {
        type: "array",
        items: { type: "string" },
        default: ["wordle", "connections", "strands", "mini", "spelling-bee"],
      },
    },
  },

  async fetchData(config: WidgetConfig): Promise<WidgetData> {
    const selectedIds = (config.games as string[]) || GAMES.map((g) => g.id);

    const selectedGames = GAMES.filter((g) => selectedIds.includes(g.id));
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    const quip = QUIPS[dayOfYear % QUIPS.length];

    return {
      widgetId: "games",
      fetchedAt: new Date(),
      data: {
        games: selectedGames,
        quip,
        date: new Date().toISOString().split("T")[0],
      },
    };
  },

  renderCard() {
    return null;
  },

  renderEmail() {
    return null;
  },

  renderNotification(): NotificationPayload {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    return {
      title: "Daily Games Ready",
      body: QUIPS[dayOfYear % QUIPS.length],
      url: "https://www.nytimes.com/games/wordle/index.html",
    };
  },
};
