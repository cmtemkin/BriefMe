import { describe, it, expect } from "vitest";
import {
  PLAN_LIMITS,
  canUseModule,
  canUseChannel,
  canUseHealth,
} from "@/lib/stripe/plans";

describe("Stripe Plans", () => {
  describe("PLAN_LIMITS", () => {
    it("free tier has max 3 modules", () => {
      expect(PLAN_LIMITS.free.maxModules).toBe(3);
    });

    it("pro tier has unlimited modules", () => {
      expect(PLAN_LIMITS.pro.maxModules).toBe(Infinity);
    });

    it("business tier has unlimited modules", () => {
      expect(PLAN_LIMITS.business.maxModules).toBe(Infinity);
    });

    it("free tier only supports web channel", () => {
      expect(PLAN_LIMITS.free.channels).toEqual(["web"]);
    });

    it("pro tier supports web, email, push", () => {
      expect(PLAN_LIMITS.pro.channels).toEqual(["web", "email", "push"]);
    });

    it("free tier has correct pricing", () => {
      expect(PLAN_LIMITS.free.price).toBe(0);
      expect(PLAN_LIMITS.pro.price).toBe(12);
      expect(PLAN_LIMITS.business.price).toBe(39);
    });
  });

  describe("canUseModule", () => {
    it("free tier allows up to 3 modules", () => {
      expect(canUseModule("free", 0)).toBe(true);
      expect(canUseModule("free", 1)).toBe(true);
      expect(canUseModule("free", 2)).toBe(true);
      expect(canUseModule("free", 3)).toBe(false);
      expect(canUseModule("free", 10)).toBe(false);
    });

    it("pro tier allows any number of modules", () => {
      expect(canUseModule("pro", 0)).toBe(true);
      expect(canUseModule("pro", 100)).toBe(true);
    });

    it("business tier allows any number of modules", () => {
      expect(canUseModule("business", 0)).toBe(true);
      expect(canUseModule("business", 1000)).toBe(true);
    });
  });

  describe("canUseChannel", () => {
    it("free tier only allows web", () => {
      expect(canUseChannel("free", "web")).toBe(true);
      expect(canUseChannel("free", "email")).toBe(false);
      expect(canUseChannel("free", "push")).toBe(false);
    });

    it("pro tier allows all channels", () => {
      expect(canUseChannel("pro", "web")).toBe(true);
      expect(canUseChannel("pro", "email")).toBe(true);
      expect(canUseChannel("pro", "push")).toBe(true);
    });

    it("business tier allows all channels", () => {
      expect(canUseChannel("business", "web")).toBe(true);
      expect(canUseChannel("business", "email")).toBe(true);
      expect(canUseChannel("business", "push")).toBe(true);
    });
  });

  describe("canUseHealth", () => {
    it("free tier cannot use health", () => {
      expect(canUseHealth("free")).toBe(false);
    });

    it("pro tier can use health", () => {
      expect(canUseHealth("pro")).toBe(true);
    });

    it("business tier can use health", () => {
      expect(canUseHealth("business")).toBe(true);
    });
  });
});
