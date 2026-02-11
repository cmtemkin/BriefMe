import type {
  Widget,
  WidgetConfig,
  WidgetData,
  NotificationPayload,
} from "./types";
import { getToken, isTokenExpired } from "@/lib/auth/oauth-tokens";

// ─── Oura Ring API v2 ───────────────────────────────────────────────────────

async function fetchOuraData(accessToken: string) {
  const today = new Date().toISOString().split("T")[0];
  const params = `start_date=${today}&end_date=${today}`;

  const [sleepRes, readinessRes, activityRes] = await Promise.allSettled([
    fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    fetch(
      `https://api.ouraring.com/v2/usercollection/daily_readiness?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    ),
    fetch(
      `https://api.ouraring.com/v2/usercollection/daily_activity?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    ),
  ]);

  let sleepScore: number | null = null;
  let readinessScore: number | null = null;
  let steps: number | null = null;

  if (sleepRes.status === "fulfilled" && sleepRes.value.ok) {
    const data = await sleepRes.value.json();
    if (data.data?.length > 0) {
      sleepScore = data.data[0].score ?? null;
    }
  }

  if (readinessRes.status === "fulfilled" && readinessRes.value.ok) {
    const data = await readinessRes.value.json();
    if (data.data?.length > 0) {
      readinessScore = data.data[0].score ?? null;
    }
  }

  if (activityRes.status === "fulfilled" && activityRes.value.ok) {
    const data = await activityRes.value.json();
    if (data.data?.length > 0) {
      steps = data.data[0].steps ?? null;
    }
  }

  return { sleepScore, readinessScore, steps };
}

// ─── Terra API (Apple HealthKit) ────────────────────────────────────────────

async function fetchTerraData(userId: string) {
  const terraApiKey = process.env.TERRA_API_KEY;
  const terraDevId = process.env.TERRA_DEV_ID;

  if (!terraApiKey || !terraDevId) return null;

  const today = new Date().toISOString().split("T")[0];

  try {
    const res = await fetch(
      `https://api.tryterra.co/v2/daily?user_id=${userId}&start_date=${today}&end_date=${today}`,
      {
        headers: {
          "X-API-Key": terraApiKey,
          "dev-id": terraDevId,
        },
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.data?.length) return null;

    const day = data.data[0];
    return {
      sleepScore: day.sleep_data?.overall_score ?? null,
      steps: day.distance_data?.steps ?? null,
      readinessScore: null, // Apple Health doesn't have readiness
    };
  } catch {
    return null;
  }
}

// ─── Widget ─────────────────────────────────────────────────────────────────

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
        data: {
          connected: false,
          sleepScore: null,
          readinessScore: null,
          steps: null,
        },
      };
    }

    const source = (config.source as string) || "oura";

    try {
      let sleepScore: number | null = null;
      let readinessScore: number | null = null;
      let steps: number | null = null;
      let hasConnection = false;

      // Fetch from Oura if configured
      if (source === "oura" || source === "both") {
        const ouraToken = await getToken(userId, "oura");
        if (ouraToken && !isTokenExpired(ouraToken.expiresAt)) {
          hasConnection = true;
          const ouraData = await fetchOuraData(ouraToken.accessToken);
          sleepScore = ouraData.sleepScore;
          readinessScore = ouraData.readinessScore;
          steps = ouraData.steps;
        }
      }

      // Fetch from Terra (Apple HealthKit) if configured
      if (source === "apple_health" || source === "both") {
        const terraToken = await getToken(userId, "terra");
        if (terraToken) {
          hasConnection = true;
          const terraData = await fetchTerraData(terraToken.accessToken);
          if (terraData) {
            // Merge: prefer Oura scores, use Terra as fallback
            sleepScore = sleepScore ?? terraData.sleepScore;
            steps = steps ?? terraData.steps;
            readinessScore = readinessScore ?? terraData.readinessScore;
          }
        }
      }

      return {
        widgetId: "health",
        fetchedAt: new Date(),
        data: {
          connected: hasConnection,
          source,
          sleepScore,
          readinessScore,
          steps,
        },
      };
    } catch (error) {
      return {
        widgetId: "health",
        fetchedAt: new Date(),
        data: {
          connected: true,
          sleepScore: null,
          readinessScore: null,
          steps: null,
        },
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
