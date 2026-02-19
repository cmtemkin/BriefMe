import type {
  Widget,
  WidgetConfig,
  WidgetData,
  NotificationPayload,
} from "./types";
import { getCached, setCache } from "@/lib/redis/cache";
import { fetchWithRetry } from "@/lib/fetch-retry";

interface RssFeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

/**
 * Minimal RSS/Atom XML parser.
 * Extracts <item> (RSS) or <entry> (Atom) elements from feed XML.
 */
export function parseRssFeed(xml: string, feedName: string): RssFeedItem[] {
  const items: RssFeedItem[] = [];

  // Try RSS <item> tags first
  const rssItemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match = rssItemRegex.exec(xml);

  while (match) {
    const content = match[1];
    const title = extractTag(content, "title");
    const link = extractTag(content, "link") || extractAtomLink(content);
    const pubDate =
      extractTag(content, "pubDate") || extractTag(content, "updated") || "";

    if (title) {
      items.push({
        title: decodeEntities(title),
        link: link || "",
        pubDate,
        source: feedName,
      });
    }
    match = rssItemRegex.exec(xml);
  }

  // If no RSS items, try Atom <entry> tags
  if (items.length === 0) {
    const atomEntryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    match = atomEntryRegex.exec(xml);

    while (match) {
      const content = match[1];
      const title = extractTag(content, "title");
      const link = extractAtomLink(content) || extractTag(content, "link");
      const pubDate =
        extractTag(content, "published") ||
        extractTag(content, "updated") ||
        "";

      if (title) {
        items.push({
          title: decodeEntities(title),
          link: link || "",
          pubDate,
          source: feedName,
        });
      }
      match = atomEntryRegex.exec(xml);
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    "i",
  );
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

function extractAtomLink(xml: string): string | null {
  const regex = /<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i;
  const match = regex.exec(xml);
  return match ? match[1] : null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

async function fetchFeed(url: string): Promise<string> {
  const res = await fetchWithRetry(url, {
    headers: {
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml",
      "User-Agent": "BriefMe/1.0 (morning dashboard)",
    },
  });
  if (!res.ok) throw new Error(`Feed fetch error: ${res.status}`);
  return res.text();
}

export const rssWidget: Widget = {
  metadata: {
    id: "rss",
    name: "RSS Feeds",
    description: "Custom RSS and Atom feed aggregator",
    icon: "Rss",
    tier: "pro",
    category: "info",
    defaultEnabled: false,
    defaultPosition: 6,
    configSchema: {
      feeds: {
        type: "array",
        items: {
          type: "object",
          properties: {
            url: { type: "string" },
            name: { type: "string" },
          },
        },
      },
      itemsPerFeed: { type: "number", default: 3 },
    },
  },

  async fetchData(config: WidgetConfig): Promise<WidgetData> {
    const feeds = (config.feeds as Array<{ url: string; name: string }>) || [];
    const itemsPerFeed = (config.itemsPerFeed as number) || 3;

    if (feeds.length === 0) {
      return {
        widgetId: "rss",
        fetchedAt: new Date(),
        data: { items: [], feedCount: 0 },
      };
    }

    const cacheKey = feeds
      .map((f) => f.url)
      .sort()
      .join("|");
    const cached = await getCached<WidgetData>("news", cacheKey);
    if (cached) return cached;

    try {
      const allItems: RssFeedItem[] = [];

      const feedResults = await Promise.allSettled(
        feeds.map(async (feed) => {
          const xml = await fetchFeed(feed.url);
          return parseRssFeed(xml, feed.name).slice(0, itemsPerFeed);
        }),
      );

      for (const result of feedResults) {
        if (result.status === "fulfilled") {
          allItems.push(...result.value);
        }
      }

      // Sort by date (newest first)
      allItems.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
      );

      const data: WidgetData = {
        widgetId: "rss",
        fetchedAt: new Date(),
        data: {
          items: allItems,
          feedCount: feeds.length,
        },
      };

      await setCache("news", cacheKey, data);
      return data;
    } catch (error) {
      return {
        widgetId: "rss",
        fetchedAt: new Date(),
        data: { items: [], feedCount: feeds.length },
        error: error instanceof Error ? error.message : "Failed to fetch feeds",
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
    const items = data.data.items as RssFeedItem[];
    const top = items[0];
    return {
      title: "Your RSS Feeds",
      body: top ? top.title : "Check your custom feeds",
      url: "/dashboard",
    };
  },
};
