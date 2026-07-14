import { cookies } from "next/headers";
import { z } from "zod";

export const demoRoleSchema = z.enum(["viewer", "trader", "admin"]);
export type DemoRole = z.infer<typeof demoRoleSchema>;

export interface DemoUser {
  role: DemoRole;
  roleLabel: string;
  name: string;
  email: string;
  initials: string;
}

const demoUsers: Record<DemoRole, DemoUser> = {
  trader: { role: "trader", roleLabel: "Demo Trader", name: "Alex Morgan", email: "demo.trader@finops.local", initials: "AM" },
  viewer: { role: "viewer", roleLabel: "Demo Viewer", name: "Jordan Lee", email: "demo.viewer@finops.local", initials: "JL" },
  admin: { role: "admin", roleLabel: "Demo Admin", name: "Sam Rivera", email: "demo.admin@finops.local", initials: "SR" },
};

export const SESSION_COOKIE = "finops_demo_session";

export function getDemoUser(role: unknown): DemoUser | null {
  const parsed = demoRoleSchema.safeParse(role);
  return parsed.success ? demoUsers[parsed.data] : null;
}

export async function getDemoSession(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  return getDemoUser(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function createDemoSession(role: DemoRole): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, role, {
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
