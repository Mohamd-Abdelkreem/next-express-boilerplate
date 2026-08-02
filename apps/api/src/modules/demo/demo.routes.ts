import { Router } from "express";

import type { DemoController } from "./demo.controller.js";

export const demoRoutes = (controller: DemoController): Router => {
  const router = Router();

  router.get("/connection", controller.checkConnection);

  return router;
};
