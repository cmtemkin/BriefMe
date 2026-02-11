export const PLAN_LIMITS = {
  free: {
    maxModules: 3,
    channels: ["web"] as const,
    health: false,
    rss: false,
    aiSummary: false,
    teamDigest: false,
    api: false,
    price: 0,
    label: "Free",
  },
  pro: {
    maxModules: Infinity,
    channels: ["web", "email", "push"] as const,
    health: true,
    rss: true,
    aiSummary: true,
    teamDigest: false,
    api: false,
    price: 12,
    label: "Pro",
  },
  business: {
    maxModules: Infinity,
    channels: ["web", "email", "push"] as const,
    health: true,
    rss: true,
    aiSummary: true,
    teamDigest: true,
    api: true,
    price: 39,
    label: "Business",
  },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

export function canUseModule(tier: PlanTier, moduleCount: number): boolean {
  return moduleCount < PLAN_LIMITS[tier].maxModules;
}

export function canUseChannel(
  tier: PlanTier,
  channel: "web" | "email" | "push",
): boolean {
  return (PLAN_LIMITS[tier].channels as readonly string[]).includes(channel);
}

export function canUseHealth(tier: PlanTier): boolean {
  return PLAN_LIMITS[tier].health;
}
