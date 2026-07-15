"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import type { CorporateActionInput, WorkspaceSettings } from "@/lib/operations";
import type { DemoRole } from "@/lib/session";
import { getDemoSession } from "@/lib/session";
import { changeUserRole, publishCorporateAction, saveCorporateAction, updateUserSettings } from "@/src/services/operations.service";

const actionType = {
  "Cash Dividend": "cash_dividend",
  "Stock Dividend": "stock_dividend",
  "Bonus Shares": "bonus_shares",
  "Rights Offering": "rights_offering",
  Voting: "voting",
  "Bond Maturity": "bond_maturity",
} as const;

export async function saveCorporateActionAction(input: CorporateActionInput, reference?: string) {
  const user = await getDemoSession();
  if (!user) return { success: false, error: "Session expired" } as const;
  const actionReference = reference ?? `CA-${input.symbol}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const result = await saveCorporateAction(user.id, {
    reference: actionReference,
    symbol: input.symbol,
    type: actionType[input.type],
    title: input.title,
    description: input.description,
    exDate: input.exDate,
    recordDate: input.recordDate,
    paymentDate: input.paymentDate || input.recordDate,
    currency: input.currency,
    cashAmount: input.amountPerShare || null,
    taxRateBps: input.type === "Cash Dividend" ? 500 : 0,
    requiresResponse: input.type === "Voting" || input.type === "Rights Offering",
    source: input.sourceReference,
  });
  if (!result.success) return result;
  revalidatePath("/corporate-actions");
  return { success: true, id: actionReference } as const;
}

export async function publishCorporateActionAction(reference: string) {
  const user = await getDemoSession();
  if (!user) return { success: false, error: "Session expired" } as const;
  const result = await publishCorporateAction(user.id, reference);
  if (!result.success) return result;
  revalidatePath("/corporate-actions");
  return { success: true, id: reference } as const;
}

export async function changeUserRoleAction(targetUserId: string, role: DemoRole) {
  const user = await getDemoSession();
  if (!user) return { success: false, error: "Session expired" } as const;
  const result = await changeUserRole(user.id, { targetUserId, role });
  if (!result.success) return result;
  revalidatePath("/admin/users");
  return { success: true } as const;
}

export async function updateSettingsAction(settings: WorkspaceSettings) {
  const user = await getDemoSession();
  if (!user) return { success: false, error: "Session expired" } as const;
  const result = await updateUserSettings(user.id, {
    theme: "dark",
    tableDensity: settings.tableDensity,
    quoteCadenceMs: Number(settings.quoteCadence),
    performanceTelemetry: settings.performanceTelemetry,
    timezone: "Asia/Ho_Chi_Minh",
    preferences: {
      landingScreen: settings.landingScreen,
      currency: settings.currency,
      paperTradingBanner: settings.paperTradingBanner,
      confirmDestructiveActions: settings.confirmDestructiveActions,
    },
  });
  if (!result.success) return result;
  revalidatePath("/admin/settings");
  return { success: true } as const;
}
