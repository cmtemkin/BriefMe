"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, Droplets, Wind } from "lucide-react";
import type { WidgetData } from "@/lib/widgets/types";

interface HourlyForecast {
  hour: number;
  temp: number;
  condition: { label: string; emoji: string };
}

export function WeatherCard({ data }: { data: WidgetData }) {
  if (data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <CloudSun className="h-4 w-4" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Unable to load weather data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const d = data.data;
  const hourly = (d.hourlyForecast as HourlyForecast[]) || [];
  const unit = d.units === "celsius" ? "C" : "F";

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span className="flex items-center gap-2">
            <CloudSun className="h-4 w-4" />
            {d.locationName as string}
          </span>
          <span className="text-muted-foreground text-xs">
            H:{d.high as number}° L:{d.low as number}°
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold">
              {d.temperature as number}°{unit}
            </p>
            <p className="text-muted-foreground text-sm">
              Feels like {d.feelsLike as number}°
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl">{d.conditionEmoji as string}</p>
            <p className="text-muted-foreground text-sm">
              {d.condition as string}
            </p>
          </div>
        </div>

        <div className="text-muted-foreground flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <Wind className="h-3 w-3" />
            {d.windSpeed as number} {unit === "F" ? "mph" : "km/h"}
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            {d.humidity as number}%
          </span>
        </div>

        {hourly.length > 0 && (
          <div className="flex justify-between border-t pt-3">
            {hourly.map((h) => (
              <div key={h.hour} className="flex flex-col items-center gap-1">
                <span className="text-muted-foreground text-xs">
                  {h.hour % 12 || 12}
                  {h.hour >= 12 ? "p" : "a"}
                </span>
                <span className="text-sm">{h.condition.emoji}</span>
                <span className="text-xs font-medium">{h.temp}°</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
