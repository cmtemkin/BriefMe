import type {
  Widget,
  WidgetConfig,
  WidgetData,
  NotificationPayload,
} from "./types";
import { getToken, isTokenExpired } from "@/lib/auth/oauth-tokens";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  source: "google" | "outlook";
  isAllDay: boolean;
}

// ─── Google Calendar API ────────────────────────────────────────────────────

async function fetchGoogleCalendarEvents(
  accessToken: string,
): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "20",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    console.error("Google Calendar API error:", res.status);
    return [];
  }

  const data = await res.json();
  return (data.items || []).map(
    (item: {
      id: string;
      summary?: string;
      start: { dateTime?: string; date?: string };
      end: { dateTime?: string; date?: string };
      location?: string;
    }) => ({
      id: item.id,
      title: item.summary || "(No title)",
      startTime: item.start.dateTime || item.start.date || "",
      endTime: item.end.dateTime || item.end.date || "",
      location: item.location,
      source: "google" as const,
      isAllDay: !item.start.dateTime,
    }),
  );
}

// ─── Microsoft Graph (Outlook) API ──────────────────────────────────────────

async function fetchOutlookCalendarEvents(
  accessToken: string,
): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startOfDay.toISOString()}&endDateTime=${endOfDay.toISOString()}&$orderby=start/dateTime&$top=20`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    console.error("Outlook Calendar API error:", res.status);
    return [];
  }

  const data = await res.json();
  return (data.value || []).map(
    (item: {
      id: string;
      subject?: string;
      start: { dateTime: string };
      end: { dateTime: string };
      location?: { displayName?: string };
      isAllDay: boolean;
    }) => ({
      id: item.id,
      title: item.subject || "(No title)",
      startTime: item.start.dateTime,
      endTime: item.end.dateTime,
      location: item.location?.displayName || undefined,
      source: "outlook" as const,
      isAllDay: item.isAllDay,
    }),
  );
}

// ─── Widget ─────────────────────────────────────────────────────────────────

export const calendarWidget: Widget = {
  metadata: {
    id: "calendar",
    name: "Calendar",
    description: "Unified view of your Google and Outlook calendars",
    icon: "Calendar",
    tier: "free",
    category: "productivity",
    defaultEnabled: true,
    defaultPosition: 1,
    configSchema: {
      showTomorrow: { type: "boolean", default: false },
    },
  },

  async fetchData(config: WidgetConfig, userId?: string): Promise<WidgetData> {
    if (!userId) {
      return {
        widgetId: "calendar",
        fetchedAt: new Date(),
        data: { events: [], connected: false, eventCount: 0 },
      };
    }

    try {
      const events: CalendarEvent[] = [];
      let hasAnyConnection = false;

      // Fetch Google Calendar events
      const googleToken = await getToken(userId, "google_calendar");
      if (googleToken && !isTokenExpired(googleToken.expiresAt)) {
        hasAnyConnection = true;
        const googleEvents = await fetchGoogleCalendarEvents(
          googleToken.accessToken,
        );
        events.push(...googleEvents);
      }

      // Fetch Outlook events
      const outlookToken = await getToken(userId, "outlook");
      if (outlookToken && !isTokenExpired(outlookToken.expiresAt)) {
        hasAnyConnection = true;
        const outlookEvents = await fetchOutlookCalendarEvents(
          outlookToken.accessToken,
        );
        events.push(...outlookEvents);
      }

      // Sort by start time
      const sortedEvents = events.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

      return {
        widgetId: "calendar",
        fetchedAt: new Date(),
        data: {
          events: sortedEvents,
          connected: hasAnyConnection,
          eventCount: sortedEvents.length,
          showTomorrow: config.showTomorrow ?? false,
        },
      };
    } catch (error) {
      return {
        widgetId: "calendar",
        fetchedAt: new Date(),
        data: { events: [], connected: true, eventCount: 0 },
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch calendar events",
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
    const count = data.data.eventCount as number;
    return {
      title: `${count} event${count === 1 ? "" : "s"} today`,
      body:
        count > 0
          ? "Check your morning briefing for details"
          : "You have a clear day ahead",
      url: "/dashboard",
    };
  },
};
