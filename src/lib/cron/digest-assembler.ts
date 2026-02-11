import { getAllWidgets } from "@/lib/widgets/registry";
import type { WidgetData } from "@/lib/widgets/types";

interface DigestResult {
  userId: string;
  widgets: WidgetData[];
  assembledAt: Date;
}

export async function assembleDigest(
  userId: string,
  enabledModuleIds: string[],
  moduleConfigs: Record<string, Record<string, unknown>>,
): Promise<DigestResult> {
  const allWidgets = getAllWidgets();
  const enabledWidgets = allWidgets.filter((w) =>
    enabledModuleIds.includes(w.metadata.id),
  );

  const widgetDataPromises = enabledWidgets.map(async (widget) => {
    try {
      const config = moduleConfigs[widget.metadata.id] || {};
      return await widget.fetchData(config, userId);
    } catch (error) {
      return {
        widgetId: widget.metadata.id,
        fetchedAt: new Date(),
        data: {},
        error: error instanceof Error ? error.message : "Failed to fetch data",
      } satisfies WidgetData;
    }
  });

  const widgetData = await Promise.all(widgetDataPromises);

  return {
    userId,
    widgets: widgetData,
    assembledAt: new Date(),
  };
}
