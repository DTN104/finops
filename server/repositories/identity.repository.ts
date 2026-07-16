import { and, asc, eq } from "drizzle-orm";

import type { DbExecutor } from "@/server/db";
import { roles, users } from "@/server/db/schema";

export async function findUserById(executor: DbExecutor, id: string, lock = false) {
  const query = executor.select().from(users).where(eq(users.id, id)).limit(1);
  const rows = lock ? await query.for("update") : await query;
  return rows[0] ?? null;
}

export async function findActiveUserByRole(executor: DbExecutor, roleCode: string) {
  const rows = await executor.select().from(users)
    .where(and(eq(users.roleCode, roleCode), eq(users.status, "active")))
    .limit(1);
  return rows[0] ?? null;
}

export async function findRole(executor: DbExecutor, code: string) {
  const rows = await executor.select().from(roles).where(eq(roles.code, code)).limit(1);
  return rows[0] ?? null;
}

export function listUsers(executor: DbExecutor) {
  return executor.select().from(users).orderBy(asc(users.name));
}

export async function setUserRole(executor: DbExecutor, id: string, roleCode: string) {
  const [user] = await executor.update(users)
    .set({ roleCode, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user ?? null;
}
