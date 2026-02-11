"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Moon, Activity, Footprints } from "lucide-react";
import type { WidgetData } from "@/lib/widgets/types";

function ScoreRing({
  score,
  label,
  icon: Icon,
}: {
  score: number | null;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const color =
    score === null
      ? "text-muted-foreground"
      : score >= 80
        ? "text-green-500"
        : score >= 60
          ? "text-yellow-500"
          : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${color} border-current`}
      >
        {score !== null ? (
          <span className="text-lg font-bold">{score}</span>
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

export function HealthCard({ data }: { data: WidgetData }) {
  const connected = data.data.connected as boolean;
  const sleepScore = data.data.sleepScore as number | null;
  const readinessScore = data.data.readinessScore as number | null;
  const steps = data.data.steps as number | null;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Heart className="h-4 w-4" />
          Health & Wellness
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!connected ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm">
              Connect a health device to see your stats
            </p>
            <div className="mt-3 flex flex-col items-center gap-2">
              <button className="text-primary text-sm font-medium underline-offset-4 hover:underline">
                Connect Oura Ring
              </button>
              <button className="text-primary text-sm font-medium underline-offset-4 hover:underline">
                Connect Apple Health
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-around py-2">
            <ScoreRing score={sleepScore} label="Sleep" icon={Moon} />
            <ScoreRing
              score={readinessScore}
              label="Readiness"
              icon={Activity}
            />
            <ScoreRing score={steps} label="Steps" icon={Footprints} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
