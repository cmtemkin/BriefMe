"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Mail, Bell } from "lucide-react";

interface StepDeliveryProps {
  emailEnabled: boolean;
  pushEnabled: boolean;
  wakeTime: string;
  onEmailToggle: () => void;
  onPushToggle: () => void;
  onWakeTimeChange: (time: string) => void;
}

const TIMES = [
  "5:00 AM",
  "5:30 AM",
  "6:00 AM",
  "6:30 AM",
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
];

export function StepDelivery({
  emailEnabled,
  pushEnabled,
  wakeTime,
  onEmailToggle,
  onPushToggle,
  onWakeTimeChange,
}: StepDeliveryProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">How should we reach you?</h2>
        <p className="text-muted-foreground text-sm">
          Choose your delivery channels
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Globe className="text-primary h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Web Dashboard</p>
              <p className="text-muted-foreground text-xs">Always available</p>
            </div>
          </div>
          <Switch checked disabled />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Email Digest</p>
              <p className="text-muted-foreground text-xs">
                Beautiful morning email
              </p>
            </div>
          </div>
          <Switch checked={emailEnabled} onCheckedChange={onEmailToggle} />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Bell className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Push Notification</p>
              <p className="text-muted-foreground text-xs">
                Quick morning summary
              </p>
            </div>
          </div>
          <Switch checked={pushEnabled} onCheckedChange={onPushToggle} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>When do you wake up?</Label>
        <Select value={wakeTime} onValueChange={onWakeTimeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose your wake time" />
          </SelectTrigger>
          <SelectContent>
            {TIMES.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">
          Your briefing will be ready when you wake up
        </p>
      </div>
    </div>
  );
}
