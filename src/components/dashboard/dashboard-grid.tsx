"use client";

import type { WidgetData } from "@/lib/widgets/types";
import { WeatherCard } from "@/components/widgets/weather-card";
import { CalendarCard } from "@/components/widgets/calendar-card";
import { NewsCard } from "@/components/widgets/news-card";
import { HealthCard } from "@/components/widgets/health-card";
import { GamesCard } from "@/components/widgets/games-card";
import { HistoryCard } from "@/components/widgets/history-card";
import { RssCard } from "@/components/widgets/rss-card";
import { WidgetSkeleton } from "@/components/widgets/widget-skeleton";

const WIDGET_COMPONENTS: Record<
  string,
  React.ComponentType<{ data: WidgetData }>
> = {
  weather: WeatherCard,
  calendar: CalendarCard,
  news: NewsCard,
  health: HealthCard,
  games: GamesCard,
  history: HistoryCard,
  rss: RssCard,
};

interface DashboardGridProps {
  widgets: Array<{
    moduleId: string;
    data: WidgetData | null;
    loading: boolean;
  }>;
}

export function DashboardGrid({ widgets }: DashboardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {widgets.map(({ moduleId, data, loading }) => {
        if (loading || !data) {
          return <WidgetSkeleton key={moduleId} />;
        }

        const Component = WIDGET_COMPONENTS[moduleId];
        if (!Component) return null;

        // Weather card spans 2 columns on large screens
        const isHero = moduleId === "weather";

        return (
          <div key={moduleId} className={isHero ? "sm:col-span-2" : ""}>
            <Component data={data} />
          </div>
        );
      })}
    </div>
  );
}
