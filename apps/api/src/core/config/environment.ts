import { z } from "zod";

import { loadRootEnvironment } from "./load-environment.js";

loadRootEnvironment();

const integerFromString = (minimum: number, maximum: number) =>
  z
    .string()
    .regex(/^\d+$/, "Expected a positive integer string.")
    .transform(Number)
    .pipe(z.number().int().min(minimum).max(maximum));

const postgresUrl = z.string().refine((value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "postgresql:" || protocol === "postgres:";
  } catch {
    return false;
  }
}, "DATABASE_URL must be a valid PostgreSQL URL.");

const trustProxy = z
  .string()
  .default("false")
  .transform((value, context): false | number => {
    if (value === "false") return false;

    const hops = Number(value);
    if (Number.isInteger(hops) && hops >= 1 && hops <= 10) return hops;

    context.addIssue({
      code: "custom",
      message: "TRUST_PROXY must be 'false' or a hop count from 1 to 10.",
    });
    return z.NEVER;
  });

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_HOST: z.string().min(1).default("0.0.0.0"),
  API_PORT: integerFromString(1, 65_535).default(4000),
  CORS_ORIGINS: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.url()).min(1)),
  DATABASE_URL: postgresUrl,
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  TRUST_PROXY: trustProxy,
  BODY_LIMIT: z
    .string()
    .regex(/^\d+(?:b|kb|mb)$/i)
    .default("1mb"),
  API_RATE_LIMIT_WINDOW_MS: integerFromString(1_000, 86_400_000).default(
    60_000,
  ),
  API_RATE_LIMIT_MAX: integerFromString(1, 100_000).default(100),
  REQUEST_TIMEOUT_MS: integerFromString(1_000, 300_000).default(30_000),
  HEADERS_TIMEOUT_MS: integerFromString(1_000, 301_000).default(31_000),
  KEEP_ALIVE_TIMEOUT_MS: integerFromString(1_000, 120_000).default(5_000),
  SHUTDOWN_TIMEOUT_MS: integerFromString(1_000, 120_000).default(10_000),
});

const result = environmentSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  throw new Error(
    `Invalid environment configuration: ${JSON.stringify(issues)}`,
  );
}

export const environment = Object.freeze(result.data);
export type Environment = Readonly<typeof environment>;
