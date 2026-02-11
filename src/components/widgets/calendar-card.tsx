"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { WidgetData } from "@/lib/widgets/types";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  source: "google" | "outlook";
  isAllDay: boolean;
}

const SOURCE_COLORS = {
  google: "bg-blue-500",
  outlook: "bg-purple-500",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CalendarCard({ data }: { data: WidgetData }) {
  const events = (data.data.events as CalendarEvent[]) || [];
  const connected = data.data.connected as boolean;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </span>
          {events.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!connected ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm">
              Connect a calendar to see your events
            </p>
            <button className="text-primary mt-2 text-sm font-medium underline-offset-4 hover:underline">
              Connect Google or Outlook
            </button>
          </div>
        ) : events.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No events today. Enjoy your free day!
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SOURCE_COLORS[event.source]}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {event.isAllDay
                      ? "All day"
                      : `${formatTime(event.startTime)} — ${formatTime(event.endTime)}`}
                  </p>
                  {event.location && (
                    <p className="text-muted-foreground truncate text-xs">
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
