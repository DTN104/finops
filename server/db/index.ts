import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { databaseEnv } from "@/server/db/env";
import * as schema from "@/server/db/schema";

const globalForDatabase = globalThis as unknown as { finopsPool?: Pool };

export const pool = globalForDatabase.finopsPool ?? new Pool({
  host: databaseEnv.DATABASE_HOST,
  port: databaseEnv.DATABASE_PORT,
  database: databaseEnv.DATABASE_DATABASE_NAME,
  user: databaseEnv.DATABASE_USERNAME,
  password: databaseEnv.DATABASE_PASSWORD,
  max: databaseEnv.DATABASE_MAX_CONNECTION,
  application_name: databaseEnv.DATABASE_APPLICATION_NAME,
  options: `-c search_path=${databaseEnv.DATABASE_SCHEMA},public`,
});

if (process.env.NODE_ENV !== "production") globalForDatabase.finopsPool = pool;

export const db = drizzle(pool, { schema, logger: databaseEnv.DATABASE_LOGGING });
export type DbExecutor = Pick<typeof db, "select" | "insert" | "update" | "delete" | "execute">;
