import { describe, it, expect } from "vitest";
import {
  weatherQuerySchema,
  newsQuerySchema,
  historyQuerySchema,
  onboardingSchema,
  deliveryUpdateSchema,
  pushTokenSchema,
  preferencesUpdateSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  describe("weatherQuerySchema", () => {
    it("accepts valid coordinates and units", () => {
      const result = weatherQuerySchema.safeParse({
        lat: "42.3601",
        lon: "-71.0589",
        units: "celsius",
        locationName: "Boston",
      });
      expect(result.success).toBe(true);
    });

    it("uses defaults when no values provided", () => {
      const result = weatherQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lat).toBe("42.2918");
        expect(result.data.lon).toBe("-71.2328");
        expect(result.data.units).toBe("fahrenheit");
      }
    });

    it("rejects invalid latitude format", () => {
      const result = weatherQuerySchema.safeParse({
        lat: "not-a-number",
        lon: "-71.0589",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid units", () => {
      const result = weatherQuerySchema.safeParse({ units: "kelvin" });
      expect(result.success).toBe(false);
    });
  });

  describe("newsQuerySchema", () => {
    it("parses comma-separated categories", () => {
      const result = newsQuerySchema.safeParse({
        categories: "world,tech,sports",
        count: "3",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categories).toEqual(["world", "tech", "sports"]);
        expect(result.data.count).toBe(3);
      }
    });

    it("rejects count > 20", () => {
      const result = newsQuerySchema.safeParse({ count: "50" });
      expect(result.success).toBe(false);
    });

    it("rejects count < 1", () => {
      const result = newsQuerySchema.safeParse({ count: "0" });
      expect(result.success).toBe(false);
    });
  });

  describe("historyQuerySchema", () => {
    it("accepts valid counts", () => {
      const result = historyQuerySchema.safeParse({
        eventCount: "3",
        birthdayCount: "2",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.eventCount).toBe(3);
        expect(result.data.birthdayCount).toBe(2);
      }
    });

    it("rejects counts > 10", () => {
      const result = historyQuerySchema.safeParse({ eventCount: "100" });
      expect(result.success).toBe(false);
    });
  });

  describe("onboardingSchema", () => {
    it("accepts valid onboarding payload", () => {
      const result = onboardingSchema.safeParse({
        modules: ["weather", "news", "games"],
        address: "Boston, MA",
        wakeTime: "6:30 AM",
        emailEnabled: true,
        pushEnabled: false,
      });
      expect(result.success).toBe(true);
    });

    it("requires at least one module", () => {
      const result = onboardingSchema.safeParse({ modules: [] });
      expect(result.success).toBe(false);
    });

    it("rejects invalid wake time format", () => {
      const result = onboardingSchema.safeParse({
        modules: ["weather"],
        wakeTime: "not-a-time",
      });
      expect(result.success).toBe(false);
    });

    it("accepts 24-hour wake time", () => {
      const result = onboardingSchema.safeParse({
        modules: ["weather"],
        wakeTime: "06:30",
      });
      expect(result.success).toBe(true);
    });

    it("accepts 12-hour wake time", () => {
      const result = onboardingSchema.safeParse({
        modules: ["weather"],
        wakeTime: "6:30 AM",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("deliveryUpdateSchema", () => {
    it("accepts valid delivery update", () => {
      const result = deliveryUpdateSchema.safeParse({
        emailEnabled: true,
        pushEnabled: false,
        wakeTime: "07:00",
      });
      expect(result.success).toBe(true);
    });

    it("accepts partial updates", () => {
      const result = deliveryUpdateSchema.safeParse({ emailEnabled: true });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = deliveryUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("pushTokenSchema", () => {
    it("accepts valid FCM token", () => {
      const result = pushTokenSchema.safeParse({
        token: "dGhpcyBpcyBhIHRlc3QgdG9rZW4",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty token", () => {
      const result = pushTokenSchema.safeParse({ token: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing token", () => {
      const result = pushTokenSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("preferencesUpdateSchema", () => {
    it("accepts full preferences update", () => {
      const result = preferencesUpdateSchema.safeParse({
        modules: { weather: true, news: false, games: true },
        delivery: { emailEnabled: true, pushEnabled: false, wakeTime: "07:30" },
        address: "New York, NY",
      });
      expect(result.success).toBe(true);
    });

    it("accepts partial updates", () => {
      const result = preferencesUpdateSchema.safeParse({
        modules: { weather: true },
      });
      expect(result.success).toBe(true);
    });

    it("rejects address > 200 chars", () => {
      const result = preferencesUpdateSchema.safeParse({
        address: "x".repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });
});
