"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ExternalLink } from "lucide-react";
import type { WidgetData } from "@/lib/widgets/types";

interface HistoryEvent {
  text: string;
  year: number;
  url: string | null;
}

export function HistoryCard({ data }: { data: WidgetData }) {
  const events = (data.data.events as HistoryEvent[]) || [];
  const births = (data.data.births as HistoryEvent[]) || [];
  const date = data.data.date as string;

  if (data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            This Day in History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Unable to load history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <BookOpen className="h-4 w-4" />
          On This Day — {date}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length > 0 && (
          <div className="space-y-2">
            {events.map((event, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="bg-muted mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-bold tabular-nums">
                  {event.year}
                </span>
                <p className="text-sm leading-snug">
                  {event.text}
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary ml-1 inline-flex items-center hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {births.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Born Today
            </p>
            {births.map((birth, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="bg-muted mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-bold tabular-nums">
                  {birth.year}
                </span>
                <p className="text-sm leading-snug">{birth.text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
