import pino, { type Logger } from "pino";

import type { Environment } from "../../core/config/environment.js";

const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.body.password",
  "req.body.passwordConfirmation",
  "req.body.token",
  "res.headers['set-cookie']",
  "password",
  "token",
];

export const createLogger = (environment: Environment): Logger =>
  pino({
    level: environment.LOG_LEVEL,
    redact: { paths: redactPaths, censor: "[REDACTED]" },
    ...(environment.NODE_ENV === "development"
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, singleLine: true },
          },
        }
      : {}),
  });
