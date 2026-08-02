import { Router } from "express";
import type { Logger } from "pino";

import type { DatabaseClient } from "@template/database";

import { createDemoRouter } from "./modules/demo/demo.routes.js";
import { createHealthRouter } from "./modules/health/health.routes.js";

export const createApiRouter = (
  database: DatabaseClient,
  logger: Logger,
): Router => {
  const router = Router();
  router.use("/demo", createDemoRouter(database));
  router.use("/health", createHealthRouter(database, logger));
  return router;
};
