import { describe, it, expect, vi, afterEach } from "vitest";
import { gamesWidget } from "@/lib/widgets/games";

describe("Games Widget", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("metadata", () => {
    it("has correct id and tier", () => {
      expect(gamesWidget.metadata.id).toBe("games");
      expect(gamesWidget.metadata.tier).toBe("free");
    });

    it("is enabled by default", () => {
      expect(gamesWidget.metadata.defaultEnabled).toBe(true);
    });

    it("has position 4", () => {
      expect(gamesWidget.metadata.defaultPosition).toBe(4);
    });
  });

  describe("fetchData", () => {
    it("returns all 5 games by default", async () => {
      const result = await gamesWidget.fetchData({});
      const games = result.data.games as Array<{ id: string }>;
      expect(games).toHaveLength(5);
      expect(games.map((g) => g.id)).toEqual([
        "wordle",
        "connections",
        "strands",
        "mini",
        "spelling-bee",
      ]);
    });

    it("filters games based on config", async () => {
      const result = await gamesWidget.fetchData({
        games: ["wordle", "mini"],
      });
      const games = result.data.games as Array<{ id: string }>;
      expect(games).toHaveLength(2);
      expect(games.map((g) => g.id)).toEqual(["wordle", "mini"]);
    });

    it("returns a quip string", async () => {
      const result = await gamesWidget.fetchData({});
      expect(typeof result.data.quip).toBe("string");
      expect((result.data.quip as string).length).toBeGreaterThan(0);
    });

    it("returns today's date in ISO format", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-02-19T12:00:00Z"));

      const result = await gamesWidget.fetchData({});
      expect(result.data.date).toBe("2026-02-19");
    });

    it("never throws an error (pure data)", async () => {
      const result = await gamesWidget.fetchData({});
      expect(result.error).toBeUndefined();
      expect(result.widgetId).toBe("games");
    });

    it("each game has required fields", async () => {
      const result = await gamesWidget.fetchData({});
      const games = result.data.games as Array<{
        id: string;
        name: string;
        url: string;
        icon: string;
        color: string;
      }>;
      for (const game of games) {
        expect(game.id).toBeTruthy();
        expect(game.name).toBeTruthy();
        expect(game.url).toMatch(/^https:\/\//);
        expect(game.icon).toBeTruthy();
        expect(game.color).toMatch(/^#/);
      }
    });

    it("rotates quips based on day of year", async () => {
      vi.useFakeTimers();

      // Day 1
      vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
      const result1 = await gamesWidget.fetchData({});

      // Day 2
      vi.setSystemTime(new Date("2026-01-02T12:00:00Z"));
      const result2 = await gamesWidget.fetchData({});

      expect(result1.data.quip).not.toBe(result2.data.quip);
    });
  });

  describe("renderNotification", () => {
    it("returns a notification with title and body", () => {
      const notification = gamesWidget.renderNotification({
        widgetId: "games",
        fetchedAt: new Date(),
        data: {},
      });
      expect(notification.title).toBe("Daily Games Ready");
      expect(notification.body).toBeTruthy();
      expect(notification.url).toContain("wordle");
    });
  });
});
