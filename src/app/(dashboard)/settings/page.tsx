"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CloudSun,
  Calendar,
  Newspaper,
  Heart,
  Gamepad2,
  BookOpen,
  Mail,
  Bell,
  Globe,
  Palette,
  CreditCard,
} from "lucide-react";

const MODULE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  weather: CloudSun,
  calendar: Calendar,
  news: Newspaper,
  health: Heart,
  games: Gamepad2,
  history: BookOpen,
};

const MODULES = [
  { id: "weather", name: "Weather", enabled: true },
  { id: "calendar", name: "Calendar", enabled: true },
  { id: "news", name: "News Headlines", enabled: true },
  { id: "health", name: "Health & Wellness", enabled: false },
  { id: "games", name: "Daily Games", enabled: true },
  { id: "history", name: "This Day in History", enabled: true },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Customize your morning briefing
        </p>
      </div>

      {/* Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {MODULES.map((mod) => {
            const Icon = MODULE_ICONS[mod.id];
            return (
              <div key={mod.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
                  <Label htmlFor={mod.id}>{mod.name}</Label>
                </div>
                <Switch id={mod.id} defaultChecked={mod.enabled} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Delivery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="text-muted-foreground h-4 w-4" />
              <Label>Web Dashboard</Label>
            </div>
            <Switch defaultChecked disabled />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="text-muted-foreground h-4 w-4" />
              <Label>Email Digest</Label>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-muted-foreground h-4 w-4" />
              <Label>Push Notifications</Label>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Wake time</Label>
            <Select defaultValue="6:30 AM">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "5:00 AM",
                  "5:30 AM",
                  "6:00 AM",
                  "6:30 AM",
                  "7:00 AM",
                  "7:30 AM",
                  "8:00 AM",
                  "8:30 AM",
                  "9:00 AM",
                ].map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Google Calendar</span>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Outlook</span>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Oura Ring</span>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Apple Health</span>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Address (for weather)</Label>
          <Input placeholder="Enter your city or address" />
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select defaultValue="system">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Free Plan</p>
              <p className="text-muted-foreground text-xs">
                3 modules, web only
              </p>
            </div>
            <Button size="sm">Upgrade to Pro</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
