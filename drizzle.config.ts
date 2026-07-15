import { defineConfig } from "drizzle-kit";

import { getDatabaseUrl } from "./src/db/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  schemaFilter: ["finops"],
  dbCredentials: { url: getDatabaseUrl() },
  migrations: { schema: "finops", table: "__drizzle_migrations" },
});
