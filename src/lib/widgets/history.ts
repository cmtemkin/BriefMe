import type {
  Widget,
  WidgetConfig,
  WidgetData,
  NotificationPayload,
} from "./types";
import { getCached, setCache } from "@/lib/redis/cache";
import { fetchWithRetry } from "@/lib/fetch-retry";

interface WikimediaEvent {
  text: string;
  year: number;
  pages?: Array<{
    title: string;
    extract?: string;
    content_urls?: {
      desktop?: { page: string };
    };
  }>;
}

interface WikimediaResponse {
  events: WikimediaEvent[];
  births: WikimediaEvent[];
}

async function fetchOnThisDay(
  month: number,
  day: number,
): Promise<WikimediaResponse> {
  const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;
  const res = await fetchWithRetry(url, {
    headers: { "User-Agent": "BriefMe/1.0 (morning dashboard)" },
  });
  if (!res.ok) throw new Error(`Wikimedia API error: ${res.status}`);
  return res.json();
}

export const historyWidget: Widget = {
  metadata: {
    id: "history",
    name: "This Day in History",
    description: "Notable events and birthdays from this date",
    icon: "BookOpen",
    tier: "free",
    category: "fun",
    defaultEnabled: true,
    defaultPosition: 5,
    configSchema: {
      eventCount: { type: "number", default: 2 },
      birthdayCount: { type: "number", default: 1 },
      showEvents: { type: "boolean", default: true },
      showBirthdays: { type: "boolean", default: true },
    },
  },

  async fetchData(config: WidgetConfig): Promise<WidgetData> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const cacheKey = `${month}:${day}`;

    const cached = await getCached<WidgetData>("history", cacheKey);
    if (cached) return cached;

    const eventCount = (config.eventCount as number) || 2;
    const birthdayCount = (config.birthdayCount as number) || 1;
    const showEvents = config.showEvents !== false;
    const showBirthdays = config.showBirthdays !== false;

    try {
      const response = await fetchOnThisDay(month, day);

      const events = showEvents
        ? response.events.slice(0, eventCount).map((e) => ({
            text: e.text,
            year: e.year,
            url: e.pages?.[0]?.content_urls?.desktop?.page || null,
          }))
        : [];

      const births = showBirthdays
        ? response.births.slice(0, birthdayCount).map((b) => ({
            text: b.text,
            year: b.year,
            url: b.pages?.[0]?.content_urls?.desktop?.page || null,
          }))
        : [];

      const data: WidgetData = {
        widgetId: "history",
        fetchedAt: new Date(),
        data: {
          events,
          births,
          date: `${now.toLocaleString("en-US", { month: "long" })} ${day}`,
        },
      };

      await setCache("history", cacheKey, data);
      return data;
    } catch (error) {
      return {
        widgetId: "history",
        fetchedAt: new Date(),
        data: { events: [], births: [] },
        error:
          error instanceof Error ? error.message : "Failed to fetch history",
      };
    }
  },

  renderCard() {
    return null;
  },

  renderEmail() {
    return null;
  },

  renderNotification(data: WidgetData): NotificationPayload {
    const events = data.data.events as Array<{ text: string; year: number }>;
    const top = events[0];
    return {
      title: `On This Day: ${data.data.date}`,
      body: top
        ? `${top.year}: ${top.text.slice(0, 80)}...`
        : "Discover what happened today in history",
      url: "/dashboard",
    };
  },
};
