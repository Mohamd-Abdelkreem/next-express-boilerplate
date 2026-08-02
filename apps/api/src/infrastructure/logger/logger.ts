import pino, { type Logger } from "pino";

import { appConfig } from "../../core/config/app.config.js";
import { loggerConfig } from "../../core/config/logger.config.js";

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

export const createLogger = (): Logger =>
  pino({
    level: loggerConfig.level,
    redact: { paths: redactPaths, censor: "[REDACTED]" },
    ...(appConfig.isDevelopment
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, singleLine: true },
          },
        }
      : {}),
  });

export const logger = createLogger();
