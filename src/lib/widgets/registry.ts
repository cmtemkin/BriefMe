import type { Widget } from "./types";

const widgets = new Map<string, Widget>();

export function registerWidget(widget: Widget): void {
  if (widgets.has(widget.metadata.id)) {
    throw new Error(`Widget "${widget.metadata.id}" is already registered`);
  }
  widgets.set(widget.metadata.id, widget);
}

export function getWidget(id: string): Widget | undefined {
  return widgets.get(id);
}

export function getAllWidgets(): Widget[] {
  return Array.from(widgets.values());
}

export function getWidgetsByTier(tier: "free" | "pro" | "business"): Widget[] {
  const tierHierarchy = { free: 0, pro: 1, business: 2 };
  const maxLevel = tierHierarchy[tier];
  return getAllWidgets().filter(
    (w) => tierHierarchy[w.metadata.tier] <= maxLevel,
  );
}

export function getDefaultWidgets(): Widget[] {
  return getAllWidgets()
    .filter((w) => w.metadata.defaultEnabled)
    .sort((a, b) => a.metadata.defaultPosition - b.metadata.defaultPosition);
}
