import type {
  Widget,
  WidgetConfig,
  WidgetData,
  NotificationPayload,
} from "./types";

export const healthWidget: Widget = {
  metadata: {
    id: "health",
    name: "Health & Wellness",
    description:
      "Sleep, readiness, and activity from Oura Ring or Apple Health",
    icon: "Heart",
    tier: "pro",
    category: "health",
    defaultEnabled: false,
    defaultPosition: 3,
    configSchema: {
      source: { type: "string", enum: ["oura", "apple_health", "both"] },
      showSleepScore: { type: "boolean", default: true },
      showReadiness: { type: "boolean", default: true },
      showActivity: { type: "boolean", default: true },
      showHRV: { type: "boolean", default: false },
    },
  },

  async fetchData(config: WidgetConfig, userId?: string): Promise<WidgetData> {
    if (!userId) {
      return {
        widgetId: "health",
        fetchedAt: new Date(),
        data: { connected: false },
      };
    }

    const source = (config.source as string) || "oura";

    // TODO: Implement Oura Ring API v2 fetcher
    // Endpoints: /v2/usercollection/daily_sleep, daily_readiness, daily_activity
    // Requires OAuth2 token from oauth_tokens table

    // TODO: Implement Terra API for Apple HealthKit
    // Requires Terra API key and user token

    try {
      // Placeholder data structure — will be populated when OAuth flows are connected
      return {
        widgetId: "health",
        fetchedAt: new Date(),
        data: {
          connected: false,
          source,
          sleepScore: null,
          readinessScore: null,
          steps: null,
          hrv: null,
          activeCalories: null,
          sleepDuration: null,
        },
      };
    } catch (error) {
      return {
        widgetId: "health",
        fetchedAt: new Date(),
        data: { connected: true },
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch health data",
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
    const sleepScore = data.data.sleepScore as number | null;
    return {
      title: "Health Summary",
      body: sleepScore
        ? `Sleep score: ${sleepScore}. Check your full health briefing.`
        : "Connect a health device to see your morning stats.",
      url: "/dashboard",
    };
  },
};
