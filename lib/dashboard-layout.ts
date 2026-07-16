import { z } from "zod";

export const dashboardLayoutSchema = z.object({
  version: z.literal(1),
  dockview: z.record(z.string(), z.unknown()),
  minimizedPanelIds: z.array(z.string()).max(12).default([]),
});

export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;

export function parseDashboardLayout(value: unknown): DashboardLayout | null {
  const parsed = dashboardLayoutSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
