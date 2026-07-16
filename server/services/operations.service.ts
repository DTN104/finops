import { z } from "zod";

import { db } from "@/server/db";
import { findCorporateAction, createCorporateAction, updateCorporateAction } from "@/server/repositories/corporate-action.repository";
import { findInstrument } from "@/server/repositories/instrument.repository";
import { findRole, findUserById, setUserRole } from "@/server/repositories/identity.repository";
import { findUserSettings, saveUserSettings } from "@/server/repositories/settings.repository";
import { auditMutation, type MutationResult } from "@/server/services/mutation";

const uuidSchema = z.string().uuid();
const roleSchema = z.enum(["viewer", "trader", "admin"]);

export const corporateActionInputSchema = z.object({
  reference: z.string().trim().min(3).max(60),
  symbol: z.string().trim().regex(/^[A-Z0-9]{1,20}$/).transform((value) => value.toUpperCase()),
  type: z.enum(["cash_dividend", "stock_dividend", "bonus_shares", "rights_offering", "voting", "bond_maturity"]),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10),
  exDate: z.iso.date(),
  recordDate: z.iso.date(),
  paymentDate: z.iso.date(),
  currency: z.string().length(3).default("VND"),
  cashAmount: z.number().int().nonnegative().nullable().optional(),
  ratioNumerator: z.number().int().positive().nullable().optional(),
  ratioDenominator: z.number().int().positive().nullable().optional(),
  taxRateBps: z.number().int().min(0).max(10_000).default(0),
  requiresResponse: z.boolean().default(false),
  source: z.string().trim().min(3).max(160),
}).refine((value) => value.recordDate >= value.exDate, {
  path: ["recordDate"],
  message: "Record date must be on or after ex-date",
}).refine((value) => value.paymentDate >= value.recordDate, {
  path: ["paymentDate"],
  message: "Payment date must be on or after record date",
});

export const changeUserRoleInputSchema = z.object({
  targetUserId: uuidSchema,
  role: roleSchema,
});

export const settingsInputSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  tableDensity: z.enum(["comfortable", "compact"]),
  quoteCadenceMs: z.number().int().min(100).max(10_000),
  performanceTelemetry: z.boolean(),
  timezone: z.string().trim().min(1).max(80),
  preferences: z.record(z.string(), z.unknown()),
});

async function authorizeAdmin(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  actorUserId: string,
) {
  const actorId = uuidSchema.safeParse(actorUserId).data ?? null;
  const actor = actorId ? await findUserById(tx, actorId) : null;
  return { actorId, actor: actor?.status === "active" && actor.roleCode === "admin" ? actor : null };
}

async function deny<T>(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  input: { actorUserId?: string | null; action: string; module: string; resourceType: string; resourceId: string; origin: string; error: string },
): Promise<MutationResult<T>> {
  await auditMutation(tx, {
    ...input,
    outcome: "denied",
    summary: input.error,
  });
  return { success: false, error: input.error };
}

export async function saveCorporateAction(
  actorUserId: string,
  input: z.input<typeof corporateActionInputSchema>,
  origin = "server-action",
) {
  return db.transaction(async (tx) => {
    const { actorId, actor } = await authorizeAdmin(tx, actorUserId);
    const parsed = corporateActionInputSchema.safeParse(input);
    if (!actor) return deny(tx, { actorUserId: actorId, action: "CA_SAVE", module: "Corporate Actions", resourceType: "corporate_action", resourceId: input.reference || "draft", origin, error: "Admin role is required" });
    if (!parsed.success) return deny(tx, { actorUserId: actor.id, action: "CA_SAVE", module: "Corporate Actions", resourceType: "corporate_action", resourceId: input.reference || "draft", origin, error: parsed.error.issues[0]?.message ?? "Invalid corporate action" });
    const instrument = await findInstrument(tx, parsed.data.symbol);
    if (!instrument) {
      return deny(tx, { actorUserId: actor.id, action: "CA_SAVE", module: "Corporate Actions", resourceType: "corporate_action", resourceId: parsed.data.reference, origin, error: "Instrument does not exist" });
    }
    const existing = await findCorporateAction(tx, parsed.data.reference, true);
    const values = {
      reference: parsed.data.reference,
      instrumentSymbol: parsed.data.symbol,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      exDate: parsed.data.exDate,
      recordDate: parsed.data.recordDate,
      paymentDate: parsed.data.paymentDate,
      currency: parsed.data.currency,
      cashAmount: parsed.data.cashAmount,
      ratioNumerator: parsed.data.ratioNumerator,
      ratioDenominator: parsed.data.ratioDenominator,
      taxRateBps: parsed.data.taxRateBps,
      requiresResponse: parsed.data.requiresResponse,
      source: parsed.data.source,
    };
    const action = existing
      ? await updateCorporateAction(tx, existing.id, values)
      : await createCorporateAction(tx, { ...values, status: "draft", createdByUserId: actor.id });
    if (!action) throw new Error("Corporate action disappeared while saving");
    await auditMutation(tx, {
      actorUserId: actor.id,
      action: existing ? "CA_UPDATE" : "CA_CREATE",
      module: "Corporate Actions",
      resourceType: "corporate_action",
      resourceId: action.reference,
      origin,
      outcome: "success",
      summary: `${existing ? "Updated" : "Created"} ${action.instrumentSymbol} ${action.title}`,
      before: existing,
      after: action,
    });
    return { success: true, data: action } as const;
  });
}

export async function publishCorporateAction(actorUserId: string, reference: string, origin = "server-action") {
  return db.transaction(async (tx) => {
    const { actorId, actor } = await authorizeAdmin(tx, actorUserId);
    const parsedReference = z.string().trim().min(1).safeParse(reference);
    if (!actor || !parsedReference.success) {
      return deny(tx, { actorUserId: actorId, action: "CA_PUBLISH", module: "Corporate Actions", resourceType: "corporate_action", resourceId: reference || "invalid", origin, error: !actor ? "Admin role is required" : "Invalid corporate action reference" });
    }
    const action = await findCorporateAction(tx, parsedReference.data, true);
    if (!action || action.status === "completed" || action.publishedAt) {
      return deny(tx, { actorUserId: actor.id, action: "CA_PUBLISH", module: "Corporate Actions", resourceType: "corporate_action", resourceId: parsedReference.data, origin, error: "Corporate action cannot be published" });
    }
    const published = await updateCorporateAction(tx, action.id, {
      status: "upcoming",
      publishedByUserId: actor.id,
      publishedAt: new Date(),
    });
    if (!published) throw new Error("Corporate action disappeared while publishing");
    await auditMutation(tx, {
      actorUserId: actor.id,
      action: "CA_PUBLISH",
      module: "Corporate Actions",
      resourceType: "corporate_action",
      resourceId: action.reference,
      origin,
      outcome: "success",
      summary: `Published ${action.instrumentSymbol} ${action.title}`,
      before: action,
      after: published,
    });
    return { success: true, data: published } as const;
  });
}

export async function changeUserRole(
  actorUserId: string,
  input: z.input<typeof changeUserRoleInputSchema>,
  origin = "server-action",
) {
  return db.transaction(async (tx) => {
    const { actorId, actor } = await authorizeAdmin(tx, actorUserId);
    const parsed = changeUserRoleInputSchema.safeParse(input);
    if (!actor || !parsed.success) {
      return deny(tx, { actorUserId: actorId, action: "USER_ROLE_UPDATE", module: "User Management", resourceType: "user", resourceId: input.targetUserId || "invalid", origin, error: !actor ? "Admin role is required" : "Invalid role change" });
    }
    const target = await findUserById(tx, parsed.data.targetUserId, true);
    const role = await findRole(tx, parsed.data.role);
    if (!target || !role || target.roleCode === role.code) {
      return deny(tx, { actorUserId: actor.id, action: "USER_ROLE_UPDATE", module: "User Management", resourceType: "user", resourceId: parsed.data.targetUserId, origin, error: !target ? "User not found" : "User already has this role" });
    }
    const updated = await setUserRole(tx, target.id, role.code);
    if (!updated) throw new Error("User disappeared while changing role");
    await auditMutation(tx, {
      actorUserId: actor.id,
      action: "USER_ROLE_UPDATE",
      module: "User Management",
      resourceType: "user",
      resourceId: target.id,
      origin,
      outcome: "success",
      summary: `Changed ${target.name} from ${target.roleCode} to ${role.code}`,
      before: target,
      after: updated,
    });
    return { success: true, data: updated } as const;
  });
}

export async function updateUserSettings(
  actorUserId: string,
  input: z.input<typeof settingsInputSchema>,
  origin = "server-action",
) {
  return db.transaction(async (tx) => {
    const actorId = uuidSchema.safeParse(actorUserId).data ?? null;
    const actor = actorId ? await findUserById(tx, actorId) : null;
    const parsed = settingsInputSchema.safeParse(input);
    if (!actor || actor.status !== "active") return deny(tx, { actorUserId: actorId, action: "SETTINGS_UPDATE", module: "Settings", resourceType: "user_settings", resourceId: actorId ?? "invalid", origin, error: "Active user not found" });
    if (!parsed.success) return deny(tx, { actorUserId: actor.id, action: "SETTINGS_UPDATE", module: "Settings", resourceType: "user_settings", resourceId: actor.id, origin, error: parsed.error.issues[0]?.message ?? "Invalid settings" });
    const before = await findUserSettings(tx, actor.id);
    const settings = await saveUserSettings(tx, { userId: actor.id, ...parsed.data });
    await auditMutation(tx, {
      actorUserId: actor.id,
      action: "SETTINGS_UPDATE",
      module: "Settings",
      resourceType: "user_settings",
      resourceId: actor.id,
      origin,
      outcome: "success",
      summary: "Updated user settings",
      before,
      after: settings,
    });
    return { success: true, data: settings } as const;
  });
}
