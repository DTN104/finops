import { defineConfig } from "drizzle-kit";

import { getDatabaseUrl } from "@/server/db/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema/*.ts",
  out: "./drizzle",
  schemaFilter: ["finops"],
  dbCredentials: { url: getDatabaseUrl() },
  migrations: { schema: "finops", table: "__drizzle_migrations" },
});
