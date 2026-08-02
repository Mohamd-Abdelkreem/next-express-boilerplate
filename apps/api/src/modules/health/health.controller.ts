import type { RequestHandler } from "express";
import type { Logger } from "pino";

import type { DatabaseClient } from "@template/database";

import { ServiceUnavailableError } from "../../core/errors/service-unavailable-error.js";
import { sendError, sendSuccess } from "../../core/responses/api-response.js";
import { checkDatabaseReadiness } from "./health.service.js";

export const getLiveness: RequestHandler = (request, response) =>
  sendSuccess(request, response, 200, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });

export const createReadinessHandler =
  (database: DatabaseClient, logger: Logger): RequestHandler =>
  async (request, response) => {
    try {
      await checkDatabaseReadiness(database);
      return sendSuccess(request, response, 200, {
        status: "ready",
        timestamp: new Date().toISOString(),
      });
    } catch {
      logger.warn(
        { requestId: request.requestId },
        "Database readiness check failed.",
      );
      return sendError(
        request,
        response,
        new ServiceUnavailableError("The API is not ready to receive traffic."),
      );
    }
  };
