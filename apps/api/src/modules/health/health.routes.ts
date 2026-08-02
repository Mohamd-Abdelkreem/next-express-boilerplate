import { Router } from "express";
import type { Logger } from "pino";

import type { DatabaseClient } from "@template/database";

import { createReadinessHandler, getLiveness } from "./health.controller.js";

export const createHealthRouter = (
  database: DatabaseClient,
  logger: Logger,
): Router => {
  const router = Router();
  router.get("/live", getLiveness);
  router.get("/ready", createReadinessHandler(database, logger));
  return router;
};
