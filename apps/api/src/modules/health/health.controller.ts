import type { Request, Response } from "express";

import { getHealthStatus } from "./health.service.js";

export const getHealth = (_request: Request, response: Response) => {
  const health = getHealthStatus();

  return response.status(200).json({
    success: true,
    data: health,
  });
};