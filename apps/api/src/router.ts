import { Router } from "express";

import type { DatabaseClient } from "@template/database";

import {
  DemoController,
  demoRoutes,
  DemoService,
  HealthController,
  healthRoutes,
  HealthService,
} from "./modules/index.js";

export const createApiRouter = (database: DatabaseClient): Router => {
  const router = Router();

  const demoService = new DemoService(database);
  const demoController = new DemoController(demoService);

  const healthService = new HealthService(database);
  const healthController = new HealthController(healthService);

  router.use("/demo", demoRoutes(demoController));
  router.use("/health", healthRoutes(healthController));

  return router;
};
