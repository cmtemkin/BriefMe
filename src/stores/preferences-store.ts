import { create } from "zustand";
import type { UserModule } from "@/types/user";

interface PreferencesState {
  modules: UserModule[];
  moduleOrder: string[];

  setModules: (modules: UserModule[]) => void;
  toggleModule: (moduleId: string) => void;
  reorderModules: (moduleIds: string[]) => void;
  updateModuleConfig: (
    moduleId: string,
    config: Record<string, unknown>,
  ) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  modules: [],
  moduleOrder: [],

  setModules: (modules) =>
    set({
      modules,
      moduleOrder: modules
        .sort((a, b) => a.position - b.position)
        .map((m) => m.moduleId),
    }),

  toggleModule: (moduleId) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.moduleId === moduleId ? { ...m, enabled: !m.enabled } : m,
      ),
    })),

  reorderModules: (moduleIds) =>
    set((state) => ({
      moduleOrder: moduleIds,
      modules: state.modules.map((m) => ({
        ...m,
        position: moduleIds.indexOf(m.moduleId),
      })),
    })),

  updateModuleConfig: (moduleId, config) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.moduleId === moduleId
          ? { ...m, config: { ...m.config, ...config } }
          : m,
      ),
    })),
}));
