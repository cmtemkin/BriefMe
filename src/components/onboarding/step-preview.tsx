"use client";

import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import type { WidgetData } from "@/lib/widgets/types";

interface StepPreviewProps {
  selectedModules: string[];
}

// Generates preview data for each module
function getPreviewData(moduleId: string): WidgetData {
  const base = { widgetId: moduleId, fetchedAt: new Date() };

  switch (moduleId) {
    case "weather":
      return {
        ...base,
        data: {
          temperature: 42,
          feelsLike: 36,
          condition: "Partly cloudy",
          conditionEmoji: "⛅",
          windSpeed: 12,
          humidity: 65,
          high: 48,
          low: 32,
          units: "fahrenheit",
          locationName: "Your Location",
          hourlyForecast: [],
        },
      };
    case "calendar":
      return {
        ...base,
        data: { connected: false, events: [], eventCount: 0 },
      };
    case "news":
      return {
        ...base,
        data: {
          headlines: [
            {
              id: 0,
              title: "Your personalized headlines will appear here",
              url: "#",
              source: "The Guardian",
              section: "World",
              summary: "",
            },
          ],
        },
      };
    case "health":
      return {
        ...base,
        data: {
          connected: false,
          sleepScore: null,
          readinessScore: null,
          steps: null,
        },
      };
    case "games":
      return {
        ...base,
        data: {
          games: [
            { id: "wordle", name: "Wordle", url: "#", color: "#6AAA64" },
            {
              id: "connections",
              name: "Connections",
              url: "#",
              color: "#B59410",
            },
            { id: "strands", name: "Strands", url: "#", color: "#4A90D9" },
          ],
          quip: "Time to flex those brain muscles!",
          date: new Date().toISOString().split("T")[0],
        },
      };
    case "history":
      return {
        ...base,
        data: {
          events: [
            {
              text: "Historical events from this day will appear here",
              year: 2024,
              url: null,
            },
          ],
          births: [],
          date: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          }),
        },
      };
    default:
      return { ...base, data: {} };
  }
}

export function StepPreview({ selectedModules }: StepPreviewProps) {
  const widgets = selectedModules.map((id) => ({
    moduleId: id,
    data: getPreviewData(id),
    loading: false,
  }));

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">Your first briefing</h2>
        <p className="text-muted-foreground text-sm">
          This is what your morning looks like
        </p>
      </div>

      <DashboardGrid widgets={widgets} />

      <p className="text-muted-foreground text-center text-xs">
        Live data will appear once your accounts are connected
      </p>
    </div>
  );
}
