"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "@/components/onboarding/progress-bar";
import { StepModules, MODULES } from "@/components/onboarding/step-modules";
import { StepConfig } from "@/components/onboarding/step-config";
import { StepDelivery } from "@/components/onboarding/step-delivery";
import { StepPreview } from "@/components/onboarding/step-preview";

const DEFAULT_MODULES = MODULES.filter((m) => m.defaultOn).map((m) => m.id);

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedModules, setSelectedModules] =
    useState<string[]>(DEFAULT_MODULES);
  const [address, setAddress] = useState("");
  const [newsCategories, setNewsCategories] = useState([
    "world",
    "technology",
    "business",
  ]);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [wakeTime, setWakeTime] = useState("6:30 AM");

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const toggleCategory = (category: string) => {
    setNewsCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleComplete = async () => {
    // TODO: Save preferences to database via API
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      <OnboardingProgress currentStep={step} />

      {step === 0 && (
        <StepModules selected={selectedModules} onToggle={toggleModule} />
      )}

      {step === 1 && (
        <StepConfig
          selectedModules={selectedModules}
          address={address}
          onAddressChange={setAddress}
          newsCategories={newsCategories}
          onToggleCategory={toggleCategory}
        />
      )}

      {step === 2 && (
        <StepDelivery
          emailEnabled={emailEnabled}
          pushEnabled={pushEnabled}
          wakeTime={wakeTime}
          onEmailToggle={() => setEmailEnabled(!emailEnabled)}
          onPushToggle={() => setPushEnabled(!pushEnabled)}
          onWakeTimeChange={setWakeTime}
        />
      )}

      {step === 3 && <StepPreview selectedModules={selectedModules} />}

      <div className="flex justify-between pt-4">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>
            Continue with {selectedModules.length} module
            {selectedModules.length !== 1 ? "s" : ""}
          </Button>
        ) : (
          <Button onClick={handleComplete} size="lg">
            This is my morning. Let&apos;s go!
          </Button>
        )}
      </div>
    </div>
  );
}
