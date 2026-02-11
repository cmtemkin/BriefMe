import type {
  Widget,
  WidgetConfig,
  WidgetData,
  NotificationPayload,
} from "./types";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  source: "google" | "outlook";
  color: string;
  isAllDay: boolean;
}

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
    // Calendar requires OAuth tokens — fetch from connected providers
    // This will be implemented when OAuth flows are connected
    if (!userId) {
      return {
        widgetId: "calendar",
        fetchedAt: new Date(),
        data: { events: [], connected: false },
      };
    }

    try {
      const events: CalendarEvent[] = [];

      // TODO: Fetch from Google Calendar API using stored OAuth tokens
      // TODO: Fetch from Microsoft Graph API using stored OAuth tokens
      // TODO: Merge, sort chronologically, detect conflicts

      const sortedEvents = events.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

      return {
        widgetId: "calendar",
        fetchedAt: new Date(),
        data: {
          events: sortedEvents,
          connected: true,
          eventCount: sortedEvents.length,
          showTomorrow: config.showTomorrow ?? false,
        },
      };
    } catch (error) {
      return {
        widgetId: "calendar",
        fetchedAt: new Date(),
        data: { events: [], connected: true },
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
