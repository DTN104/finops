"use server";

import { revalidatePath } from "next/cache";

import type { DashboardLayout } from "@/lib/dashboard-layout";
import { getDemoSession } from "@/lib/session";
import { updateDashboardLayout } from "@/server/services/operations.service";

export async function saveDashboardLayoutAction(layout: DashboardLayout) {
  const user = await getDemoSession();
  if (!user) return { success: false, error: "Session expired" } as const;
  const result = await updateDashboardLayout(user.id, layout);
  if (result.success) revalidatePath("/dashboard");
  return result;
}
