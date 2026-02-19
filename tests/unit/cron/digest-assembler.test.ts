import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the registry before importing the assembler
vi.mock("@/lib/widgets/registry", () => ({
  getAllWidgets: vi.fn(),
}));

import { assembleDigest } from "@/lib/cron/digest-assembler";
import { getAllWidgets } from "@/lib/widgets/registry";
import type { Widget, WidgetData } from "@/lib/widgets/types";

const mockedGetAllWidgets = vi.mocked(getAllWidgets);

function createMockWidget(
  id: string,
  fetchResult?: Partial<WidgetData>,
  shouldThrow?: boolean,
): Widget {
  return {
    metadata: {
      id,
      name: id,
      description: `${id} widget`,
      icon: "Star",
      tier: "free",
      category: "info",
      defaultEnabled: true,
      defaultPosition: 0,
      configSchema: {},
    },
    async fetchData(): Promise<WidgetData> {
      if (shouldThrow) throw new Error(`${id} fetch failed`);
      return {
        widgetId: id,
        fetchedAt: new Date(),
        data: { value: `${id}-data` },
        ...fetchResult,
      };
    },
    renderCard: () => null,
    renderEmail: () => null,
    renderNotification: () => ({ title: "t", body: "b" }),
  };
}

describe("assembleDigest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches data only for enabled modules", async () => {
    const weather = createMockWidget("weather");
    const news = createMockWidget("news");
    const games = createMockWidget("games");
    mockedGetAllWidgets.mockReturnValue([weather, news, games]);

    const result = await assembleDigest("user-1", ["weather", "games"], {});

    expect(result.widgets).toHaveLength(2);
    expect(result.widgets.map((w) => w.widgetId)).toEqual(["weather", "games"]);
  });

  it("passes config to each widget", async () => {
    const weather = createMockWidget("weather");
    const fetchSpy = vi.spyOn(weather, "fetchData");
    mockedGetAllWidgets.mockReturnValue([weather]);

    const config = { weather: { units: "celsius", lat: "51.5" } };
    await assembleDigest("user-1", ["weather"], config);

    expect(fetchSpy).toHaveBeenCalledWith(
      { units: "celsius", lat: "51.5" },
      "user-1",
    );
  });

  it("uses empty config when none provided for a widget", async () => {
    const weather = createMockWidget("weather");
    const fetchSpy = vi.spyOn(weather, "fetchData");
    mockedGetAllWidgets.mockReturnValue([weather]);

    await assembleDigest("user-1", ["weather"], {});

    expect(fetchSpy).toHaveBeenCalledWith({}, "user-1");
  });

  it("isolates widget errors — one failure doesn't break others", async () => {
    const weather = createMockWidget("weather");
    const news = createMockWidget("news", undefined, true); // will throw
    const games = createMockWidget("games");
    mockedGetAllWidgets.mockReturnValue([weather, news, games]);

    const result = await assembleDigest(
      "user-1",
      ["weather", "news", "games"],
      {},
    );

    expect(result.widgets).toHaveLength(3);

    // Weather and games succeed
    expect(result.widgets[0].error).toBeUndefined();
    expect(result.widgets[2].error).toBeUndefined();

    // News failed gracefully
    expect(result.widgets[1].error).toBe("news fetch failed");
    expect(result.widgets[1].widgetId).toBe("news");
  });

  it("returns correct userId and assembledAt", async () => {
    mockedGetAllWidgets.mockReturnValue([]);
    const result = await assembleDigest("user-42", [], {});

    expect(result.userId).toBe("user-42");
    expect(result.assembledAt).toBeInstanceOf(Date);
  });

  it("returns empty widgets array when no modules enabled", async () => {
    mockedGetAllWidgets.mockReturnValue([
      createMockWidget("weather"),
      createMockWidget("news"),
    ]);
    const result = await assembleDigest("user-1", [], {});
    expect(result.widgets).toEqual([]);
  });
});
