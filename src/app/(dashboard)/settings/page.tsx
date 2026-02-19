"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
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
  Rss,
  Mail,
  Bell,
  Globe,
  Palette,
  CreditCard,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { trackEvent, initPostHog } from "@/lib/analytics/posthog";
import { EVENTS } from "@/lib/analytics/events";

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
  rss: Rss,
};

const ALL_MODULES = [
  { id: "weather", name: "Weather" },
  { id: "calendar", name: "Calendar" },
  { id: "news", name: "News Headlines" },
  { id: "health", name: "Health & Wellness" },
  { id: "games", name: "Daily Games" },
  { id: "history", name: "This Day in History" },
  { id: "rss", name: "RSS Feeds", tier: "pro" as const },
];

const WAKE_TIMES = [
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
];

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

interface ConnectedAccount {
  provider: string;
  connected: boolean;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Module toggles
  const [modules, setModules] = useState<Record<string, boolean>>({
    weather: true,
    calendar: true,
    news: true,
    health: false,
    games: true,
    history: true,
  });

  // Delivery preferences
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [wakeTime, setWakeTime] = useState("06:30");

  // Location
  const [address, setAddress] = useState("");

  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([
    { provider: "google_calendar", connected: false },
    { provider: "outlook", connected: false },
    { provider: "oura", connected: false },
    { provider: "terra", connected: false },
  ]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    setMounted(true);
    initPostHog();
  }, []);

  // Load user preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch("/api/user/preferences");
        if (res.ok) {
          const data = await res.json();
          if (data.modules) {
            const modMap: Record<string, boolean> = {};
            ALL_MODULES.forEach((m) => {
              modMap[m.id] = data.modules[m.id] ?? false;
            });
            setModules(modMap);
          }
          if (data.delivery) {
            setEmailEnabled(data.delivery.emailEnabled ?? false);
            setPushEnabled(data.delivery.pushEnabled ?? false);
            setWakeTime(data.delivery.wakeTime ?? "06:30");
          }
          if (data.address) {
            setAddress(data.address);
          }
          if (data.connectedAccounts) {
            setConnectedAccounts(data.connectedAccounts);
          }
        }
      } catch {
        // Use defaults if fetch fails (no auth, dev mode, etc.)
      } finally {
        setLoadingPrefs(false);
      }
    }
    loadPreferences();
  }, []);

  // Read URL params for OAuth callback status
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    if (connected) {
      setConnectedAccounts((prev) =>
        prev.map((a) =>
          a.provider === connected ||
          (connected === "google" && a.provider === "google_calendar")
            ? { ...a, connected: true }
            : a,
        ),
      );
      // Clean URL
      window.history.replaceState({}, "", "/settings");
    }
  }, []);

  const savePreferences = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modules,
          delivery: {
            emailEnabled,
            pushEnabled,
            wakeTime,
          },
          address,
        }),
      });
      setSaved(true);
      trackEvent(EVENTS.WIDGET_CONFIGURED, {
        enabledModules: Object.entries(modules)
          .filter(([, v]) => v)
          .map(([k]) => k),
        emailEnabled,
        pushEnabled,
        wakeTime,
      });
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Silent fail in demo mode
    } finally {
      setSaving(false);
    }
  }, [modules, emailEnabled, pushEnabled, wakeTime, address]);

  const toggleModule = (id: string) => {
    const newState = !modules[id];
    setModules((prev) => ({ ...prev, [id]: newState }));
    trackEvent(newState ? EVENTS.MODULE_ENABLED : EVENTS.MODULE_DISABLED, {
      moduleId: id,
    });
  };

  const connectAccount = (provider: string) => {
    const routes: Record<string, string> = {
      google_calendar: "/api/auth/google-calendar",
      outlook: "/api/auth/outlook",
      oura: "/api/auth/oura",
      terra: "/api/auth/terra",
    };
    const route = routes[provider];
    if (route) {
      window.location.href = route;
    }
  };

  const providerLabels: Record<string, string> = {
    google_calendar: "Google Calendar",
    outlook: "Outlook",
    oura: "Oura Ring",
    terra: "Apple Health",
  };

  const handleUpgrade = async () => {
    trackEvent(EVENTS.UPGRADE_CLICKED, { plan: "pro" });
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch {
      // Silent fail
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch {
      // Silent fail
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Customize your morning briefing
          </p>
        </div>
        <Button onClick={savePreferences} disabled={saving} size="sm">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingPrefs ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          ) : (
            ALL_MODULES.map((mod) => {
              const Icon = MODULE_ICONS[mod.id];
              return (
                <div key={mod.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
                    <Label htmlFor={`mod-${mod.id}`}>{mod.name}</Label>
                  </div>
                  <Switch
                    id={`mod-${mod.id}`}
                    checked={modules[mod.id] ?? false}
                    onCheckedChange={() => toggleModule(mod.id)}
                  />
                </div>
              );
            })
          )}
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
              <Label htmlFor="email-toggle">Email Digest</Label>
            </div>
            <Switch
              id="email-toggle"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-muted-foreground h-4 w-4" />
              <Label htmlFor="push-toggle">Push Notifications</Label>
            </div>
            <Switch
              id="push-toggle"
              checked={pushEnabled}
              onCheckedChange={setPushEnabled}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Wake time</Label>
            <Select value={wakeTime} onValueChange={setWakeTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WAKE_TIMES.map((time) => (
                  <SelectItem key={time} value={time}>
                    {formatTime(time)}
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
          {connectedAccounts.map((account) => (
            <div
              key={account.provider}
              className="flex items-center justify-between"
            >
              <span className="text-sm">
                {providerLabels[account.provider] || account.provider}
              </span>
              {account.connected ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-3 w-3" /> Connected
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => connectAccount(account.provider)}
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Connect
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Address (for weather)</Label>
          <Input
            placeholder="Enter your city or address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
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
          {mounted ? (
            <Select
              value={theme || "light"}
              onValueChange={(value) => setTheme(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="bg-muted h-10 animate-pulse rounded-md" />
          )}
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
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpgrade}>
                Upgrade to Pro
              </Button>
              <Button variant="outline" size="sm" onClick={handleManageBilling}>
                Manage Billing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
