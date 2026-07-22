"use server";

import { redirect } from "next/navigation";

import { createDemoSession, deleteDemoSession, demoRoleSchema } from "@/lib/session";

export async function loginAsDemoUser(formData: FormData): Promise<void> {
  const role = demoRoleSchema.parse(formData.get("role"));
  await createDemoSession(role, formData.get("remember") === "on");
  redirect("/dashboard");
}

export async function logoutDemoUser(): Promise<void> {
  await deleteDemoSession();
  redirect("/login");
}
