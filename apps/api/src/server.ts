import { createApp } from "./app.js";

const DEFAULT_PORT = 4000;
const DEFAULT_HOST = "0.0.0.0";
const SHUTDOWN_TIMEOUT_MS = 10_000;

const rawPort = process.env["PORT"] ?? String(DEFAULT_PORT);
const port = Number(rawPort);
const host = process.env["HOST"] ?? DEFAULT_HOST;

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`Invalid PORT value: ${rawPort}`);
}

const app = createApp();

const server = app.listen(port, host, () => {
  console.log(`API is running at http://localhost:${port}`);
});

let isShuttingDown = false;

const shutdown = (signal: NodeJS.Signals) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`Received ${signal}. Starting graceful shutdown.`);

  const forceShutdownTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  forceShutdownTimer.unref();

  server.close((error) => {
    clearTimeout(forceShutdownTimer);

    if (error) {
      console.error("Failed to close the HTTP server.", error);
      process.exit(1);
    }

    console.log("HTTP server closed successfully.");
    process.exit(0);
  });
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);