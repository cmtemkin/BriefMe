import { describe, it, expect } from "vitest";
import { weatherWidget } from "@/lib/widgets/weather";
import { newsWidget } from "@/lib/widgets/news";
import { historyWidget } from "@/lib/widgets/history";
import type { WidgetData } from "@/lib/widgets/types";

describe("Widget Notification Rendering", () => {
  describe("Weather", () => {
    it("renders temperature and condition in title", () => {
      const data: WidgetData = {
        widgetId: "weather",
        fetchedAt: new Date(),
        data: {
          temperature: 72,
          feelsLike: 70,
          condition: "Clear sky",
          conditionEmoji: "☀️",
          high: 78,
          low: 55,
        },
      };
      const notification = weatherWidget.renderNotification(data);
      expect(notification.title).toContain("72°");
      expect(notification.title).toContain("Clear sky");
      expect(notification.title).toContain("☀️");
    });

    it("includes high/low in body", () => {
      const data: WidgetData = {
        widgetId: "weather",
        fetchedAt: new Date(),
        data: {
          temperature: 72,
          feelsLike: 70,
          condition: "Clear sky",
          conditionEmoji: "☀️",
          high: 78,
          low: 55,
        },
      };
      const notification = weatherWidget.renderNotification(data);
      expect(notification.body).toContain("70°");
      expect(notification.body).toContain("78°");
      expect(notification.body).toContain("55°");
    });

    it("links to dashboard", () => {
      const data: WidgetData = {
        widgetId: "weather",
        fetchedAt: new Date(),
        data: {
          temperature: 72,
          feelsLike: 70,
          condition: "Cloudy",
          conditionEmoji: "☁️",
          high: 75,
          low: 60,
        },
      };
      const notification = weatherWidget.renderNotification(data);
      expect(notification.url).toBe("/dashboard");
    });
  });

  describe("News", () => {
    it("uses the first headline as notification body", () => {
      const data: WidgetData = {
        widgetId: "news",
        fetchedAt: new Date(),
        data: {
          headlines: [
            { title: "Breaking: Major Event Happens" },
            { title: "Second Story" },
          ],
        },
      };
      const notification = newsWidget.renderNotification(data);
      expect(notification.title).toBe("Today's Headlines");
      expect(notification.body).toBe("Breaking: Major Event Happens");
    });

    it("handles empty headlines gracefully", () => {
      const data: WidgetData = {
        widgetId: "news",
        fetchedAt: new Date(),
        data: { headlines: [] },
      };
      const notification = newsWidget.renderNotification(data);
      expect(notification.body).toContain("briefing");
    });
  });

  describe("History", () => {
    it("includes the date and top event", () => {
      const data: WidgetData = {
        widgetId: "history",
        fetchedAt: new Date(),
        data: {
          date: "February 19",
          events: [{ text: "The Copernicus revolution began", year: 1473 }],
          births: [],
        },
      };
      const notification = historyWidget.renderNotification(data);
      expect(notification.title).toContain("February 19");
      expect(notification.body).toContain("1473");
    });

    it("handles empty events", () => {
      const data: WidgetData = {
        widgetId: "history",
        fetchedAt: new Date(),
        data: {
          date: "February 19",
          events: [],
          births: [],
        },
      };
      const notification = historyWidget.renderNotification(data);
      expect(notification.body).toContain("history");
    });
  });
});
