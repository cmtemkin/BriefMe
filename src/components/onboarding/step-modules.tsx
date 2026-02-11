"use client";

import {
  CloudSun,
  Calendar,
  Newspaper,
  Heart,
  Gamepad2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODULES = [
  {
    id: "weather",
    name: "Weather",
    icon: CloudSun,
    description: "Current conditions & forecast",
    defaultOn: true,
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: Calendar,
    description: "Google & Outlook events",
    defaultOn: true,
  },
  {
    id: "news",
    name: "News",
    icon: Newspaper,
    description: "Curated headlines",
    defaultOn: true,
  },
  {
    id: "health",
    name: "Health",
    icon: Heart,
    description: "Sleep & activity data",
    defaultOn: false,
  },
  {
    id: "games",
    name: "Games",
    icon: Gamepad2,
    description: "Daily puzzles & word games",
    defaultOn: true,
  },
  {
    id: "history",
    name: "History",
    icon: BookOpen,
    description: "On this day in history",
    defaultOn: true,
  },
];

interface StepModulesProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function StepModules({ selected, onToggle }: StepModulesProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">What matters to you?</h2>
        <p className="text-muted-foreground text-sm">
          Pick the modules for your morning briefing
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MODULES.map((mod) => {
          const isSelected = selected.includes(mod.id);
          return (
            <button
              key={mod.id}
              onClick={() => onToggle(mod.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "bg-muted/50 hover:border-muted-foreground/20 border-transparent",
              )}
            >
              <mod.icon
                className={cn(
                  "h-6 w-6",
                  isSelected ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="text-sm font-medium">{mod.name}</span>
              <span className="text-muted-foreground text-center text-[10px] leading-tight">
                {mod.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { MODULES };
