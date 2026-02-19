import { describe, it, expect, vi, afterEach } from "vitest";
import { parseRssFeed } from "@/lib/widgets/rss";
import { rssWidget } from "@/lib/widgets/rss";

describe("RSS Widget", () => {
  describe("parseRssFeed — RSS format", () => {
    const sampleRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tech Blog</title>
    <item>
      <title>First Post</title>
      <link>https://example.com/first</link>
      <pubDate>Thu, 19 Feb 2026 12:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Second Post</title>
      <link>https://example.com/second</link>
      <pubDate>Wed, 18 Feb 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title><![CDATA[Third &amp; Final Post]]></title>
      <link>https://example.com/third</link>
      <pubDate>Tue, 17 Feb 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    it("extracts items from RSS feed", () => {
      const items = parseRssFeed(sampleRss, "Tech Blog");
      expect(items).toHaveLength(3);
    });

    it("extracts title, link, pubDate, and source", () => {
      const items = parseRssFeed(sampleRss, "Tech Blog");
      expect(items[0]).toEqual({
        title: "First Post",
        link: "https://example.com/first",
        pubDate: "Thu, 19 Feb 2026 12:00:00 GMT",
        source: "Tech Blog",
      });
    });

    it("handles CDATA-wrapped titles", () => {
      const items = parseRssFeed(sampleRss, "Tech Blog");
      expect(items[2].title).toBe("Third & Final Post");
    });

    it("decodes HTML entities", () => {
      const xml = `<rss><channel><item>
        <title>A &amp; B &lt;C&gt;</title>
        <link>https://example.com</link>
      </item></channel></rss>`;
      const items = parseRssFeed(xml, "Test");
      expect(items[0].title).toBe("A & B <C>");
    });
  });

  describe("parseRssFeed — Atom format", () => {
    const sampleAtom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Dev Blog</title>
  <entry>
    <title>Atom Entry One</title>
    <link href="https://example.com/atom-1" />
    <published>2026-02-19T12:00:00Z</published>
  </entry>
  <entry>
    <title>Atom Entry Two</title>
    <link href="https://example.com/atom-2" />
    <updated>2026-02-18T10:00:00Z</updated>
  </entry>
</feed>`;

    it("extracts items from Atom feed", () => {
      const items = parseRssFeed(sampleAtom, "Dev Blog");
      expect(items).toHaveLength(2);
    });

    it("extracts href from Atom link elements", () => {
      const items = parseRssFeed(sampleAtom, "Dev Blog");
      expect(items[0].link).toBe("https://example.com/atom-1");
    });

    it("uses published or updated for pubDate", () => {
      const items = parseRssFeed(sampleAtom, "Dev Blog");
      expect(items[0].pubDate).toBe("2026-02-19T12:00:00Z");
      expect(items[1].pubDate).toBe("2026-02-18T10:00:00Z");
    });
  });

  describe("parseRssFeed — edge cases", () => {
    it("returns empty array for empty XML", () => {
      const items = parseRssFeed("", "Empty");
      expect(items).toEqual([]);
    });

    it("returns empty array for invalid XML", () => {
      const items = parseRssFeed("<not-a-feed>garbage</not-a-feed>", "Bad");
      expect(items).toEqual([]);
    });

    it("handles items without links", () => {
      const xml = `<rss><channel><item><title>No link</title></item></channel></rss>`;
      const items = parseRssFeed(xml, "Test");
      expect(items).toHaveLength(1);
      expect(items[0].link).toBe("");
    });
  });

  describe("rssWidget metadata", () => {
    it("has correct id, tier, and category", () => {
      expect(rssWidget.metadata.id).toBe("rss");
      expect(rssWidget.metadata.tier).toBe("pro");
      expect(rssWidget.metadata.category).toBe("info");
    });

    it("is not enabled by default", () => {
      expect(rssWidget.metadata.defaultEnabled).toBe(false);
    });
  });

  describe("rssWidget.fetchData", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns empty items when no feeds configured", async () => {
      const result = await rssWidget.fetchData({});
      expect(result.data.items).toEqual([]);
      expect(result.data.feedCount).toBe(0);
      expect(result.error).toBeUndefined();
    });
  });

  describe("rssWidget.renderNotification", () => {
    it("shows top item title when items exist", () => {
      const notification = rssWidget.renderNotification({
        widgetId: "rss",
        fetchedAt: new Date(),
        data: {
          items: [
            {
              title: "Big News from Feed",
              link: "",
              source: "Blog",
              pubDate: "",
            },
          ],
          feedCount: 1,
        },
      });
      expect(notification.title).toBe("Your RSS Feeds");
      expect(notification.body).toBe("Big News from Feed");
    });

    it("shows fallback when no items", () => {
      const notification = rssWidget.renderNotification({
        widgetId: "rss",
        fetchedAt: new Date(),
        data: { items: [], feedCount: 0 },
      });
      expect(notification.body).toContain("feeds");
    });
  });
});
