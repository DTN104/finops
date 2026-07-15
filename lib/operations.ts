import { z } from "zod";

import type { DemoRole } from "@/lib/session";

export const corporateActionSchema = z.object({
  symbol: z.string().trim().min(1, "Symbol is required").max(20).transform((value) => value.toUpperCase()),
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

export const defaultSettings: WorkspaceSettings = {
  landingScreen: "dashboard",
  tableDensity: "compact",
  quoteCadence: "500",
  currency: "VND",
  paperTradingBanner: true,
  performanceTelemetry: true,
  confirmDestructiveActions: true,
};

export interface AuditLogView {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  resource: string;
  origin: string;
  outcome: "SUCCESS" | "DENIED";
  summary: string;
  before?: string;
  after?: string;
}
