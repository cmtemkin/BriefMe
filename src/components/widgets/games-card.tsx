"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, ExternalLink } from "lucide-react";
import type { WidgetData } from "@/lib/widgets/types";

interface Game {
  id: string;
  name: string;
  url: string;
  color: string;
}

export function GamesCard({ data }: { data: WidgetData }) {
  const games = (data.data.games as Game[]) || [];
  const quip = data.data.quip as string;

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Gamepad2 className="h-4 w-4" />
          Daily Games
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm italic">{quip}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {games.map((game) => (
            <a
              key={game.id}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group hover:bg-accent flex items-center gap-2 rounded-lg border p-2.5 transition-colors"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: game.color }}
              />
              <span className="truncate text-xs font-medium">{game.name}</span>
              <ExternalLink className="ml-auto h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
