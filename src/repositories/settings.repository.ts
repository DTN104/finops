import { eq } from "drizzle-orm";

import type { DbExecutor } from "@/src/db";
import { userSettings } from "@/src/db/schema";

export async function findUserSettings(executor: DbExecutor, userId: string) {
  const rows = await executor.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function saveUserSettings(executor: DbExecutor, input: typeof userSettings.$inferInsert) {
  const [settings] = await executor.insert(userSettings).values(input)
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: {
        theme: input.theme,
        tableDensity: input.tableDensity,
        quoteCadenceMs: input.quoteCadenceMs,
        performanceTelemetry: input.performanceTelemetry,
        timezone: input.timezone,
        preferences: input.preferences,
        updatedAt: new Date(),
      },
    })
    .returning();
  return settings;
}
