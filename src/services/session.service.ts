import { db } from "@/src/db";
import { findActiveUserByRole, findUserById } from "@/src/repositories/identity.repository";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;

export async function getActiveSessionUser(reference: string) {
  const user = uuidPattern.test(reference)
    ? await findUserById(db, reference)
    : await findActiveUserByRole(db, reference);
  return user?.status === "active" ? user : null;
}

export function getDemoUserForRole(role: string) {
  return findActiveUserByRole(db, role);
}
