"use client";

import { Progress } from "@/components/ui/progress";

const STEP_LABELS = [
  "Choose Modules",
  "Quick Config",
  "Delivery",
  "Your Briefing",
];

export function OnboardingProgress({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="mb-8 space-y-2">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>
          Step {currentStep + 1} of {STEP_LABELS.length}
        </span>
        <span>{STEP_LABELS[currentStep]}</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
