import { Router } from "express";

import { healthRouter } from "./modules/health/index.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);