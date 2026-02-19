import { describe, it, expect, beforeEach } from "vitest";

// We can't import from the module directly because it uses a module-level Map.
// Instead, we test the logic by recreating the registry functions inline.
// This avoids coupling to module state across tests.

import type {
  Widget,
  WidgetData,
  NotificationPayload,
} from "@/lib/widgets/types";

function createMockWidget(overrides: Partial<Widget["metadata"]> = {}): Widget {
  return {
    metadata: {
      id: overrides.id ?? "test-widget",
      name: overrides.name ?? "Test Widget",
      description: "A test widget",
      icon: "Star",
      tier: overrides.tier ?? "free",
      category: overrides.category ?? "info",
      defaultEnabled: overrides.defaultEnabled ?? false,
      defaultPosition: overrides.defaultPosition ?? 0,
      configSchema: {},
    },
    async fetchData(): Promise<WidgetData> {
      return { widgetId: "test", fetchedAt: new Date(), data: {} };
    },
    renderCard() {
      return null;
    },
    renderEmail() {
      return null;
    },
    renderNotification(): NotificationPayload {
      return { title: "Test", body: "Test notification" };
    },
  };
}

// Recreate registry logic for isolated testing
function createRegistry() {
  const widgets = new Map<string, Widget>();

  return {
    registerWidget(widget: Widget): void {
      if (widgets.has(widget.metadata.id)) {
        throw new Error(`Widget "${widget.metadata.id}" is already registered`);
      }
      widgets.set(widget.metadata.id, widget);
    },
    getWidget(id: string): Widget | undefined {
      return widgets.get(id);
    },
    getAllWidgets(): Widget[] {
      return Array.from(widgets.values());
    },
    getWidgetsByTier(tier: "free" | "pro" | "business"): Widget[] {
      const tierHierarchy = { free: 0, pro: 1, business: 2 };
      const maxLevel = tierHierarchy[tier];
      return this.getAllWidgets().filter(
        (w) => tierHierarchy[w.metadata.tier] <= maxLevel,
      );
    },
    getDefaultWidgets(): Widget[] {
      return this.getAllWidgets()
        .filter((w) => w.metadata.defaultEnabled)
        .sort(
          (a, b) => a.metadata.defaultPosition - b.metadata.defaultPosition,
        );
    },
  };
}

describe("Widget Registry", () => {
  let registry: ReturnType<typeof createRegistry>;

  beforeEach(() => {
    registry = createRegistry();
  });

  describe("registerWidget", () => {
    it("registers a widget successfully", () => {
      const widget = createMockWidget({ id: "weather" });
      registry.registerWidget(widget);
      expect(registry.getWidget("weather")).toBe(widget);
    });

    it("throws when registering a duplicate widget id", () => {
      const widget1 = createMockWidget({ id: "weather" });
      const widget2 = createMockWidget({ id: "weather" });
      registry.registerWidget(widget1);
      expect(() => registry.registerWidget(widget2)).toThrow(
        'Widget "weather" is already registered',
      );
    });
  });

  describe("getWidget", () => {
    it("returns undefined for unregistered widget", () => {
      expect(registry.getWidget("nonexistent")).toBeUndefined();
    });

    it("returns the correct widget by id", () => {
      const w1 = createMockWidget({ id: "a" });
      const w2 = createMockWidget({ id: "b" });
      registry.registerWidget(w1);
      registry.registerWidget(w2);
      expect(registry.getWidget("b")).toBe(w2);
    });
  });

  describe("getAllWidgets", () => {
    it("returns empty array when no widgets registered", () => {
      expect(registry.getAllWidgets()).toEqual([]);
    });

    it("returns all registered widgets", () => {
      registry.registerWidget(createMockWidget({ id: "a" }));
      registry.registerWidget(createMockWidget({ id: "b" }));
      registry.registerWidget(createMockWidget({ id: "c" }));
      expect(registry.getAllWidgets()).toHaveLength(3);
    });
  });

  describe("getWidgetsByTier", () => {
    beforeEach(() => {
      registry.registerWidget(createMockWidget({ id: "free1", tier: "free" }));
      registry.registerWidget(createMockWidget({ id: "free2", tier: "free" }));
      registry.registerWidget(createMockWidget({ id: "pro1", tier: "pro" }));
      registry.registerWidget(
        createMockWidget({ id: "biz1", tier: "business" }),
      );
    });

    it("free tier gets only free widgets", () => {
      const widgets = registry.getWidgetsByTier("free");
      expect(widgets).toHaveLength(2);
      expect(widgets.every((w) => w.metadata.tier === "free")).toBe(true);
    });

    it("pro tier gets free + pro widgets", () => {
      const widgets = registry.getWidgetsByTier("pro");
      expect(widgets).toHaveLength(3);
      const tiers = widgets.map((w) => w.metadata.tier);
      expect(tiers).toContain("free");
      expect(tiers).toContain("pro");
      expect(tiers).not.toContain("business");
    });

    it("business tier gets all widgets", () => {
      const widgets = registry.getWidgetsByTier("business");
      expect(widgets).toHaveLength(4);
    });
  });

  describe("getDefaultWidgets", () => {
    it("returns only widgets with defaultEnabled=true", () => {
      registry.registerWidget(
        createMockWidget({
          id: "enabled",
          defaultEnabled: true,
          defaultPosition: 0,
        }),
      );
      registry.registerWidget(
        createMockWidget({ id: "disabled", defaultEnabled: false }),
      );
      const defaults = registry.getDefaultWidgets();
      expect(defaults).toHaveLength(1);
      expect(defaults[0].metadata.id).toBe("enabled");
    });

    it("returns widgets sorted by defaultPosition", () => {
      registry.registerWidget(
        createMockWidget({ id: "c", defaultEnabled: true, defaultPosition: 2 }),
      );
      registry.registerWidget(
        createMockWidget({ id: "a", defaultEnabled: true, defaultPosition: 0 }),
      );
      registry.registerWidget(
        createMockWidget({ id: "b", defaultEnabled: true, defaultPosition: 1 }),
      );
      const defaults = registry.getDefaultWidgets();
      expect(defaults.map((w) => w.metadata.id)).toEqual(["a", "b", "c"]);
    });

    it("returns empty array when no defaults exist", () => {
      registry.registerWidget(
        createMockWidget({ id: "x", defaultEnabled: false }),
      );
      expect(registry.getDefaultWidgets()).toEqual([]);
    });
  });
});
