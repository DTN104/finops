"use client";

import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import { appendAuditLog } from "@/components/operations/audit-store";
import type { DemoRole } from "@/lib/session";

export const corporateActionSchema = z.object({
  symbol: z.string().trim().min(1, "Symbol is required").max(8).transform((value) => value.toUpperCase()),
  title: z.string().trim().min(3, "Event title is required"),
  type: z.enum(["Cash Dividend", "Voting", "Bonus Shares", "Rights Offering", "Stock Dividend", "Bond Maturity"]),
  currency: z.literal("VND"),
  exDate: z.iso.date("Ex-right date is required"),
  recordDate: z.iso.date("Record date is required"),
  paymentDate: z.union([z.iso.date(), z.literal("")]),
  amountPerShare: z.number().nonnegative("Amount cannot be negative"),
  description: z.string().trim().min(10, "Description is required"),
  sourceReference: z.string().trim().min(3, "Source reference is required"),
}).refine((value) => value.recordDate >= value.exDate, {
  path: ["recordDate"],
  message: "Record date must be on or after the ex-right date",
}).refine((value) => !value.paymentDate || value.paymentDate >= value.recordDate, {
  path: ["paymentDate"],
  message: "Payment date must be on or after the record date",
});

export type CorporateActionInput = z.input<typeof corporateActionSchema>;
export type CorporateActionStatus = "DRAFT" | "ANNOUNCED" | "UPCOMING" | "ACTION NEEDED";

export interface CorporateAction extends z.output<typeof corporateActionSchema> {
  id: string;
  status: CorporateActionStatus;
  published: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
  status: "ACTIVE" | "DISABLED";
  lastActive: string;
  orders: number;
}

export interface WorkspaceSettings {
  landingScreen: "dashboard" | "market" | "portfolio";
  tableDensity: "compact" | "comfortable";
  quoteCadence: "250" | "500" | "1000";
  currency: "VND";
  paperTradingBanner: boolean;
  performanceTelemetry: boolean;
  confirmDestructiveActions: boolean;
}

const corporateActions: CorporateAction[] = [
  { id: "CA-FPT-2026-0714", symbol: "FPT", title: "2026 interim dividend", type: "Cash Dividend", currency: "VND", exDate: "2026-07-22", recordDate: "2026-07-23", paymentDate: "2026-08-08", amountPerShare: 2_000, description: "FPT Corporation will pay a simulated interim cash dividend of ₫2,000 per eligible share.", sourceReference: "MOCK-ISSUER-FPT-0714", status: "UPCOMING", published: true },
  { id: "CA-VCB-2026-0728", symbol: "VCB", title: "Annual shareholder vote", type: "Voting", currency: "VND", exDate: "2026-07-28", recordDate: "2026-07-29", paymentDate: "", amountPerShare: 0, description: "Simulated annual shareholder voting event for eligible VCB holdings.", sourceReference: "MOCK-ISSUER-VCB-0728", status: "ACTION NEEDED", published: true },
  { id: "CA-HPG-2026-0804", symbol: "HPG", title: "Bonus shares 10:1", type: "Bonus Shares", currency: "VND", exDate: "2026-08-04", recordDate: "2026-08-05", paymentDate: "2026-08-20", amountPerShare: 0, description: "Simulated distribution of one bonus share for every ten eligible HPG shares.", sourceReference: "MOCK-ISSUER-HPG-0804", status: "ANNOUNCED", published: true },
  { id: "CA-SSI-2026-0811", symbol: "SSI", title: "Rights offering 5:1", type: "Rights Offering", currency: "VND", exDate: "2026-08-11", recordDate: "2026-08-12", paymentDate: "", amountPerShare: 0, description: "Simulated SSI rights offering for eligible paper-trading positions.", sourceReference: "MOCK-ISSUER-SSI-0811", status: "ACTION NEEDED", published: true },
  { id: "CA-VNM-2026-0818", symbol: "VNM", title: "Cash dividend ₫2,000", type: "Cash Dividend", currency: "VND", exDate: "2026-08-18", recordDate: "2026-08-19", paymentDate: "2026-09-05", amountPerShare: 2_000, description: "Simulated VNM cash dividend for eligible holdings.", sourceReference: "MOCK-ISSUER-VNM-0818", status: "UPCOMING", published: true },
  { id: "CA-MWG-2026-0824", symbol: "MWG", title: "Stock dividend 5%", type: "Stock Dividend", currency: "VND", exDate: "2026-08-24", recordDate: "2026-08-25", paymentDate: "2026-09-15", amountPerShare: 0, description: "Simulated five-percent MWG stock dividend.", sourceReference: "MOCK-ISSUER-MWG-0824", status: "ANNOUNCED", published: true },
  { id: "CA-GAS-2026-0901", symbol: "GAS", title: "Bond maturity", type: "Bond Maturity", currency: "VND", exDate: "2026-09-01", recordDate: "2026-09-01", paymentDate: "2026-09-01", amountPerShare: 0, description: "Simulated GAS bond maturity event.", sourceReference: "MOCK-ISSUER-GAS-0901", status: "UPCOMING", published: true },
];

const users: ManagedUser[] = [
  { id: "user_017", name: "Linh Nguyen", email: "linh.viewer@finops.local", role: "viewer", status: "ACTIVE", lastActive: "2 min ago", orders: 0 },
  { id: "user_018", name: "Bao Tran", email: "bao.trader@finops.local", role: "trader", status: "ACTIVE", lastActive: "8 min ago", orders: 14 },
  { id: "user_019", name: "Mina Tran", email: "mina.admin@finops.local", role: "admin", status: "ACTIVE", lastActive: "12 min ago", orders: 3 },
  { id: "user_020", name: "Huy Pham", email: "huy.trader@finops.local", role: "trader", status: "DISABLED", lastActive: "4 days ago", orders: 28 },
  { id: "user_021", name: "Mai Vo", email: "mai.viewer@finops.local", role: "viewer", status: "ACTIVE", lastActive: "1 hour ago", orders: 0 },
  { id: "user_022", name: "Khanh Le", email: "khanh.trader@finops.local", role: "trader", status: "ACTIVE", lastActive: "3 hours ago", orders: 9 },
];

export const defaultSettings: WorkspaceSettings = {
  landingScreen: "dashboard",
  tableDensity: "compact",
  quoteCadence: "500",
  currency: "VND",
  paperTradingBanner: true,
  performanceTelemetry: true,
  confirmDestructiveActions: true,
};

interface OperationsState {
  actions: CorporateAction[];
  users: ManagedUser[];
  settings: WorkspaceSettings;
  nextActionNumber: number;
  saveAction: (input: CorporateActionInput, actor: string, id?: string) => CorporateAction;
  publishAction: (id: string, actor: string) => boolean;
  updateUserRole: (id: string, role: DemoRole, actor: string) => boolean;
  updateSettings: (settings: WorkspaceSettings, actor: string) => void;
  reset: () => void;
}

const fallbackEntries = new Map<string, string>();
const fallbackStorage: StateStorage = {
  getItem: (name) => fallbackEntries.get(name) ?? null,
  setItem: (name, value) => { fallbackEntries.set(name, value); },
  removeItem: (name) => { fallbackEntries.delete(name); },
};

export const useOperationsStore = create<OperationsState>()(
  persist(
    (set, get) => ({
      actions: corporateActions,
      users,
      settings: defaultSettings,
      nextActionNumber: 100,
      saveAction: (input, actor, id) => {
        const parsed = corporateActionSchema.parse(input);
        const existing = id ? get().actions.find((action) => action.id === id) : undefined;
        const action: CorporateAction = {
          ...parsed,
          id: existing?.id ?? `CA-${parsed.symbol}-2026-${String(get().nextActionNumber).padStart(4, "0")}`,
          status: "DRAFT",
          published: false,
        };
        set((state) => ({
          actions: existing ? state.actions.map((candidate) => candidate.id === existing.id ? action : candidate) : [action, ...state.actions],
          nextActionNumber: existing ? state.nextActionNumber : state.nextActionNumber + 1,
        }));
        appendAuditLog({
          actor,
          action: existing ? "CA_UPDATE" : "CA_CREATE",
          module: "Corporate Actions",
          resource: action.id,
          origin: "Admin session",
          outcome: "SUCCESS",
          summary: `${existing ? "Updated" : "Created"} ${action.symbol} ${action.title}`,
          before: existing ? `status: ${existing.status}\ntitle: ${existing.title}` : undefined,
          after: `status: DRAFT\ntitle: ${action.title}`,
        });
        return action;
      },
      publishAction: (id, actor) => {
        const action = get().actions.find((candidate) => candidate.id === id);
        if (!action) return false;
        set((state) => ({ actions: state.actions.map((candidate) => candidate.id === id ? { ...candidate, status: "UPCOMING", published: true } : candidate) }));
        appendAuditLog({ actor, action: "CA_PUBLISH", module: "Corporate Actions", resource: id, origin: "Admin session", outcome: "SUCCESS", summary: `Published ${action.symbol} ${action.title}`, before: `status: ${action.status}`, after: "status: UPCOMING" });
        return true;
      },
      updateUserRole: (id, role, actor) => {
        const user = get().users.find((candidate) => candidate.id === id);
        if (!user || user.role === role) return false;
        set((state) => ({ users: state.users.map((candidate) => candidate.id === id ? { ...candidate, role } : candidate) }));
        appendAuditLog({ actor, action: "USER_ROLE_UPDATE", module: "User Management", resource: id, origin: "Admin session", outcome: "SUCCESS", summary: `Changed ${user.name} from ${user.role} to ${role}`, before: `role: ${user.role}`, after: `role: ${role}` });
        return true;
      },
      updateSettings: (settings, actor) => {
        const before = get().settings;
        set({ settings });
        appendAuditLog({ actor, action: "SETTINGS_UPDATE", module: "Settings", resource: "workspace", origin: "Admin session", outcome: "SUCCESS", summary: "Updated workspace settings", before: JSON.stringify(before), after: JSON.stringify(settings) });
      },
      reset: () => set({ actions: corporateActions, users, settings: defaultSettings, nextActionNumber: 100 }),
    }),
    {
      name: "finops-demo-operations",
      storage: createJSONStorage(() => typeof window === "undefined" ? fallbackStorage : window.localStorage),
    },
  ),
);
