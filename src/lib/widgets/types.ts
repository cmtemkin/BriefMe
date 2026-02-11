import type { ReactNode } from "react";

export interface WidgetMetadata {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  tier: "free" | "pro" | "business";
  category: "info" | "health" | "fun" | "productivity";
  defaultEnabled: boolean;
  defaultPosition: number;
  configSchema: Record<string, unknown>;
}

export interface WidgetData {
  widgetId: string;
  fetchedAt: Date;
  data: Record<string, unknown>;
  error?: string;
}

export interface WidgetConfig {
  [key: string]: unknown;
}

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

export interface Widget {
  metadata: WidgetMetadata;
  fetchData(config: WidgetConfig, userId?: string): Promise<WidgetData>;
  renderCard(data: WidgetData): ReactNode;
  renderEmail(data: WidgetData): ReactNode;
  renderNotification(data: WidgetData): NotificationPayload;
}
