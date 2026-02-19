import { z } from "zod/v4";

/** Widget route query params */
export const weatherQuerySchema = z.object({
  lat: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, "Invalid latitude")
    .default("42.2918"),
  lon: z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, "Invalid longitude")
    .default("-71.2328"),
  units: z.enum(["fahrenheit", "celsius"]).default("fahrenheit"),
  locationName: z.string().max(100).default("Your Location"),
});

export const newsQuerySchema = z.object({
  categories: z
    .string()
    .default("world,technology,business")
    .transform((s) => s.split(",").filter(Boolean)),
  count: z.coerce.number().int().min(1).max(20).default(5),
});

export const historyQuerySchema = z.object({
  eventCount: z.coerce.number().int().min(0).max(10).default(2),
  birthdayCount: z.coerce.number().int().min(0).max(10).default(1),
});

/** User onboarding payload */
export const onboardingSchema = z.object({
  modules: z.array(z.string().min(1).max(50)).min(1).max(20),
  address: z.string().max(200).optional(),
  newsCategories: z.array(z.string().min(1).max(50)).max(10).optional(),
  wakeTime: z
    .string()
    .regex(/^(\d{1,2}:\d{2}(\s?(AM|PM))?)$/, "Invalid time format")
    .optional(),
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
});

/** Delivery preferences update */
export const deliveryUpdateSchema = z.object({
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  wakeTime: z
    .string()
    .regex(/^(\d{1,2}:\d{2}(\s?(AM|PM))?)$/, "Invalid time format")
    .optional(),
});

/** Push token */
export const pushTokenSchema = z.object({
  token: z.string().min(1, "Missing FCM token"),
});

/** Preferences update */
export const preferencesUpdateSchema = z.object({
  modules: z.record(z.string(), z.boolean()).optional(),
  delivery: z
    .object({
      emailEnabled: z.boolean().optional(),
      pushEnabled: z.boolean().optional(),
      wakeTime: z
        .string()
        .regex(/^(\d{1,2}:\d{2}(\s?(AM|PM))?)$/, "Invalid time format")
        .optional(),
    })
    .optional(),
  address: z.string().max(200).optional(),
});
