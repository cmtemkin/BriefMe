import { create } from "zustand";
import type { WidgetData } from "@/lib/widgets/types";

interface WidgetState {
  widgetData: Record<string, WidgetData>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;

  setWidgetData: (widgetId: string, data: WidgetData) => void;
  setLoading: (widgetId: string, loading: boolean) => void;
  setError: (widgetId: string, error: string | null) => void;
  clearAll: () => void;
}

export const useWidgetStore = create<WidgetState>((set) => ({
  widgetData: {},
  loading: {},
  errors: {},

  setWidgetData: (widgetId, data) =>
    set((state) => ({
      widgetData: { ...state.widgetData, [widgetId]: data },
      loading: { ...state.loading, [widgetId]: false },
      errors: { ...state.errors, [widgetId]: null },
    })),

  setLoading: (widgetId, loading) =>
    set((state) => ({
      loading: { ...state.loading, [widgetId]: loading },
    })),

  setError: (widgetId, error) =>
    set((state) => ({
      errors: { ...state.errors, [widgetId]: error },
      loading: { ...state.loading, [widgetId]: false },
    })),

  clearAll: () => set({ widgetData: {}, loading: {}, errors: {} }),
}));
