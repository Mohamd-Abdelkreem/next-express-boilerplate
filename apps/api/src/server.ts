import { createDatabaseClient } from "@template/database";

import { createApp } from "./app.js";
import { environment } from "./core/config/environment.js";
import { createLogger } from "./infrastructure/logger/logger.js";

const logger = createLogger(environment);
const database = createDatabaseClient(environment.DATABASE_URL);
const app = createApp({ database, environment, logger });

let isShuttingDown = false;
let serverStarted = false;

const server = app.listen(
  environment.API_PORT,
  environment.API_HOST,
  (error?: Error) => {
    if (error !== undefined) {
      logger.fatal({ err: error }, "Failed to start the API server.");
      void shutdown("startup-error", 1);
      return;
    }

    serverStarted = true;
    logger.info(
      { host: environment.API_HOST, port: environment.API_PORT },
      "API server is listening.",
    );
  },
);

server.requestTimeout = environment.REQUEST_TIMEOUT_MS;
server.headersTimeout = environment.HEADERS_TIMEOUT_MS;
server.keepAliveTimeout = environment.KEEP_ALIVE_TIMEOUT_MS;

async function shutdown(reason: string, exitCode = 0): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ reason }, "Starting graceful shutdown.");

  const forceShutdownTimer = setTimeout(() => {
    logger.fatal("Graceful shutdown timed out. Forcing process exit.");
    server.closeAllConnections();
    process.exit(1);
  }, environment.SHUTDOWN_TIMEOUT_MS);
  forceShutdownTimer.unref();

  try {
    if (serverStarted) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error !== undefined) reject(error);
          else resolve();
        });
        server.closeIdleConnections();
      });
    }
    await database.$disconnect();
    clearTimeout(forceShutdownTimer);
    logger.info("Graceful shutdown completed.");
    process.exit(exitCode);
  } catch (error) {
    clearTimeout(forceShutdownTimer);
    logger.fatal({ err: error }, "Graceful shutdown failed.");
    process.exit(1);
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception.");
  void shutdown("uncaughtException", 1);
});
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection.");
});
