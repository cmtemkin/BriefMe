import type {
  Widget,
  WidgetConfig,
  WidgetData,
  NotificationPayload,
} from "./types";
import { getCached, setCache } from "@/lib/redis/cache";
import { fetchWithRetry } from "@/lib/fetch-retry";

interface GuardianArticle {
  webTitle: string;
  webUrl: string;
  sectionName: string;
  webPublicationDate: string;
  fields?: {
    trailText?: string;
    thumbnail?: string;
  };
}

interface GuardianResponse {
  response: {
    status: string;
    results: GuardianArticle[];
  };
}

async function fetchGuardianNews(
  categories: string[],
  count: number,
): Promise<GuardianArticle[]> {
  const apiKey = process.env.GUARDIAN_API_KEY;
  if (!apiKey) throw new Error("Guardian API key not configured");

  const section = categories.length > 0 ? categories.join("|") : undefined;
  const url = new URL("https://content.guardianapis.com/search");
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("page-size", String(count));
  url.searchParams.set("show-fields", "trailText,thumbnail");
  url.searchParams.set("order-by", "newest");
  if (section) url.searchParams.set("section", section);

  const res = await fetchWithRetry(url.toString());
  if (!res.ok) throw new Error(`Guardian API error: ${res.status}`);

  const data: GuardianResponse = await res.json();
  return data.response.results;
}

export const newsWidget: Widget = {
  metadata: {
    id: "news",
    name: "News Headlines",
    description: "Curated headlines from top sources",
    icon: "Newspaper",
    tier: "free",
    category: "info",
    defaultEnabled: true,
    defaultPosition: 2,
    configSchema: {
      categories: { type: "array", items: { type: "string" } },
      count: { type: "number", default: 5 },
    },
  },

  async fetchData(config: WidgetConfig): Promise<WidgetData> {
    const categories = (config.categories as string[]) || [
      "world",
      "technology",
      "business",
    ];
    const count = (config.count as number) || 5;
    const cacheKey = `${categories.join(",")}:${count}`;

    const cached = await getCached<WidgetData>("news", cacheKey);
    if (cached) return cached;

    try {
      const articles = await fetchGuardianNews(categories, count);

      const headlines = articles.map((article, index) => ({
        id: index,
        title: article.webTitle,
        url: article.webUrl,
        source: "The Guardian",
        section: article.sectionName,
        summary: article.fields?.trailText || "",
        thumbnail: article.fields?.thumbnail || null,
        publishedAt: article.webPublicationDate,
      }));

      const data: WidgetData = {
        widgetId: "news",
        fetchedAt: new Date(),
        data: { headlines, categories },
      };

      await setCache("news", cacheKey, data);
      return data;
    } catch (error) {
      return {
        widgetId: "news",
        fetchedAt: new Date(),
        data: { headlines: [] },
        error: error instanceof Error ? error.message : "Failed to fetch news",
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
    const headlines = data.data.headlines as Array<{ title: string }>;
    const top = headlines[0];
    return {
      title: "Today's Headlines",
      body: top ? top.title : "Check your morning news briefing",
      url: "/dashboard",
    };
  },
};
