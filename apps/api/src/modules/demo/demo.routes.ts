import { Router } from "express";

import type { DatabaseClient } from "@repo/database";

import { createDemoConnectionHandler } from "./demo.controller.js";

export const createDemoRouter = (database: DatabaseClient): Router => {
  const router = Router();
  router.get("/connection", createDemoConnectionHandler(database));
  return router;
};
