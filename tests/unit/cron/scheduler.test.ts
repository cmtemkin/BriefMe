import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isInCurrentWindow } from "@/lib/cron/scheduler";

describe("isInCurrentWindow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("24-hour format", () => {
    it("returns true when current time matches wake time exactly", () => {
      // Set to 6:30 AM EST (11:30 UTC)
      vi.setSystemTime(new Date("2026-02-19T11:30:00Z"));
      expect(isInCurrentWindow("06:30", "America/New_York")).toBe(true);
    });

    it("returns true within the 15-minute window", () => {
      // Set to 6:44 AM EST (11:44 UTC) — 14 minutes after 6:30
      vi.setSystemTime(new Date("2026-02-19T11:44:00Z"));
      expect(isInCurrentWindow("06:30", "America/New_York")).toBe(true);
    });

    it("returns false after the 15-minute window", () => {
      // Set to 6:45 AM EST (11:45 UTC) — exactly 15 minutes after
      vi.setSystemTime(new Date("2026-02-19T11:45:00Z"));
      expect(isInCurrentWindow("06:30", "America/New_York")).toBe(false);
    });

    it("returns false before wake time", () => {
      // Set to 6:29 AM EST (11:29 UTC)
      vi.setSystemTime(new Date("2026-02-19T11:29:00Z"));
      expect(isInCurrentWindow("06:30", "America/New_York")).toBe(false);
    });

    it("handles midnight wake time", () => {
      // Set to 12:05 AM EST (05:05 UTC)
      vi.setSystemTime(new Date("2026-02-19T05:05:00Z"));
      expect(isInCurrentWindow("00:00", "America/New_York")).toBe(true);
    });
  });

  describe("12-hour format", () => {
    it("handles AM format", () => {
      // Set to 7:00 AM EST (12:00 UTC)
      vi.setSystemTime(new Date("2026-02-19T12:00:00Z"));
      expect(isInCurrentWindow("7:00 AM", "America/New_York")).toBe(true);
    });

    it("handles PM format", () => {
      // Set to 2:00 PM EST (19:00 UTC)
      vi.setSystemTime(new Date("2026-02-19T19:00:00Z"));
      expect(isInCurrentWindow("2:00 PM", "America/New_York")).toBe(true);
    });

    it("handles 12:00 PM (noon)", () => {
      // Set to 12:00 PM EST (17:00 UTC)
      vi.setSystemTime(new Date("2026-02-19T17:00:00Z"));
      expect(isInCurrentWindow("12:00 PM", "America/New_York")).toBe(true);
    });

    it("handles 12:00 AM (midnight)", () => {
      // Set to 12:00 AM EST (05:00 UTC)
      vi.setSystemTime(new Date("2026-02-19T05:00:00Z"));
      expect(isInCurrentWindow("12:00 AM", "America/New_York")).toBe(true);
    });
  });

  describe("timezone handling", () => {
    it("respects different timezones", () => {
      // Set to 6:30 AM PST (14:30 UTC)
      vi.setSystemTime(new Date("2026-02-19T14:30:00Z"));
      expect(isInCurrentWindow("06:30", "America/Los_Angeles")).toBe(true);
      // Same UTC time is 9:30 AM EST — should not match 06:30
      expect(isInCurrentWindow("06:30", "America/New_York")).toBe(false);
    });

    it("works with UTC timezone", () => {
      vi.setSystemTime(new Date("2026-02-19T08:00:00Z"));
      expect(isInCurrentWindow("08:00", "UTC")).toBe(true);
    });
  });
});
