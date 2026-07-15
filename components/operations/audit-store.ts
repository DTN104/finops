"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export type AuditOutcome = "SUCCESS" | "DENIED";

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  resource: string;
  origin: string;
  outcome: AuditOutcome;
  summary: string;
  before?: string;
  after?: string;
}

export type AuditInput = Omit<AuditLog, "id" | "timestamp">;

const seededAuditLogs: AuditLog[] = [
  { id: "AUD-20260714-094218-001", timestamp: "14 Jul 2026 09:42:18.218", actor: "Alex Morgan", action: "ORDER_CREATE", module: "Trading", resource: "MOCK-20260714-1042", origin: "10.0.4.18", outcome: "SUCCESS", summary: "Created FPT limit buy order" },
  { id: "AUD-20260714-093904-002", timestamp: "14 Jul 2026 09:39:04.102", actor: "Mina Tran", action: "CA_PUBLISH", module: "Corporate Actions", resource: "CA-FPT-2026-0714", origin: "10.0.4.12", outcome: "SUCCESS", summary: "Published FPT 2026 interim dividend" },
  { id: "AUD-20260714-093451-018", timestamp: "14 Jul 2026 09:34:51.218", actor: "Alex Morgan", action: "USER_ROLE_UPDATE", module: "User Management", resource: "user_018", origin: "sess_a8c2", outcome: "SUCCESS", summary: "Changed Bao Tran from Viewer to Trader", before: "role: Viewer\npermissions: read-only", after: "role: Trader\npermissions: market.read, order.create" },
  { id: "AUD-20260714-092820-004", timestamp: "14 Jul 2026 09:28:20.410", actor: "Viewer Demo", action: "ORDER_CREATE", module: "Trading", resource: "FPT buy attempt", origin: "10.0.8.44", outcome: "DENIED", summary: "Viewer role attempted to create an order" },
  { id: "AUD-20260714-092006-005", timestamp: "14 Jul 2026 09:20:06.008", actor: "System Feed", action: "MARKET_SYNC", module: "Market", resource: "5,000 instruments", origin: "job_3092", outcome: "SUCCESS", summary: "Synchronized deterministic market feed" },
  { id: "AUD-20260714-091542-006", timestamp: "14 Jul 2026 09:15:42.622", actor: "Alex Morgan", action: "SETTINGS_UPDATE", module: "Settings", resource: "table_density", origin: "sess_a8c2", outcome: "SUCCESS", summary: "Changed table density to Compact" },
  { id: "AUD-20260714-090411-007", timestamp: "14 Jul 2026 09:04:11.000", actor: "System", action: "SESSION_EXPIRE", module: "Authentication", resource: "viewer_002", origin: "job_3090", outcome: "SUCCESS", summary: "Expired demo Viewer session" },
];

interface AuditState {
  logs: AuditLog[];
  nextNumber: number;
  append: (input: AuditInput) => AuditLog;
  reset: () => void;
}

const fallbackEntries = new Map<string, string>();
const fallbackStorage: StateStorage = {
  getItem: (name) => fallbackEntries.get(name) ?? null,
  setItem: (name, value) => { fallbackEntries.set(name, value); },
  removeItem: (name) => { fallbackEntries.delete(name); },
};

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      logs: seededAuditLogs,
      nextNumber: 100,
      append: (input) => {
        const nextNumber = get().nextNumber;
        const seconds = nextNumber % 60;
        const log: AuditLog = {
          ...input,
          id: `AUD-20260715-10${String(nextNumber).padStart(4, "0")}`,
          timestamp: `15 Jul 2026 10:08:${String(seconds).padStart(2, "0")}.${String(nextNumber).padStart(3, "0")}`,
        };
        set((state) => ({ logs: [log, ...state.logs], nextNumber: state.nextNumber + 1 }));
        return log;
      },
      reset: () => set({ logs: seededAuditLogs, nextNumber: 100 }),
    }),
    {
      name: "finops-demo-audit",
      storage: createJSONStorage(() => typeof window === "undefined" ? fallbackStorage : window.localStorage),
    },
  ),
);

export function appendAuditLog(input: AuditInput): AuditLog {
  return useAuditStore.getState().append(input);
}
