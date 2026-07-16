import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env", quiet: true });

const databaseEnvSchema = z.object({
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_DATABASE_NAME: z.string().min(1),
  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string(),
  DATABASE_MAX_CONNECTION: z.coerce.number().int().positive().default(10),
  DATABASE_APPLICATION_NAME: z.string().min(1).default("finops"),
  DATABASE_SCHEMA: z.literal("finops").default("finops"),
  DATABASE_LOGGING: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
});

export const databaseEnv = databaseEnvSchema.parse(process.env);

export function getDatabaseUrl(): string {
  const url = new URL("postgresql://localhost");
  url.hostname = databaseEnv.DATABASE_HOST;
  url.port = String(databaseEnv.DATABASE_PORT);
  url.username = databaseEnv.DATABASE_USERNAME;
  url.password = databaseEnv.DATABASE_PASSWORD;
  url.pathname = databaseEnv.DATABASE_DATABASE_NAME;
  url.searchParams.set("application_name", databaseEnv.DATABASE_APPLICATION_NAME);
  url.searchParams.set("options", `-c search_path=${databaseEnv.DATABASE_SCHEMA},public`);
  return url.toString();
}
