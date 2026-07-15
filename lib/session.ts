import { cookies } from "next/headers";
import { z } from "zod";

import { getActiveSessionUser, getDemoUserForRole } from "@/src/services/session.service";

export const demoRoleSchema = z.enum(["viewer", "trader", "admin"]);
export type DemoRole = z.infer<typeof demoRoleSchema>;

export interface DemoUser {
  id: string;
  role: DemoRole;
  roleLabel: string;
  name: string;
  email: string;
  initials: string;
}

export const SESSION_COOKIE = "finops_demo_session";

function toDemoUser(user: { id: string; roleCode: string; name: string; email: string; initials: string }): DemoUser | null {
  const parsed = demoRoleSchema.safeParse(user.roleCode);
  if (!parsed.success) return null;
  const roleLabel = `Demo ${parsed.data[0].toUpperCase()}${parsed.data.slice(1)}`;
  return { id: user.id, role: parsed.data, roleLabel, name: user.name, email: user.email, initials: user.initials };
}

export async function getDemoSession(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  const reference = cookieStore.get(SESSION_COOKIE)?.value;
  if (!reference) return null;
  const user = await getActiveSessionUser(reference);
  return user ? toDemoUser(user) : null;
}

export async function createDemoSession(role: DemoRole): Promise<void> {
  const user = await getDemoUserForRole(role);
  if (!user) throw new Error(`Seeded ${role} demo user is unavailable`);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    maxAge: 30 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function deleteDemoSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function canManageOperations(role: DemoRole): boolean {
  return role === "admin";
}
