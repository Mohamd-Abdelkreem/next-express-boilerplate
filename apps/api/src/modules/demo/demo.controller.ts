import type { RequestHandler } from "express";

import type { DatabaseClient } from "@repo/database";

import { sendSuccess } from "../../core/responses/api-response.js";
import { checkDemoConnection } from "./demo.service.js";

export const createDemoConnectionHandler =
  (database: DatabaseClient): RequestHandler =>
  async (request, response) => {
    const result = await checkDemoConnection(database);
    return sendSuccess(request, response, 200, result);
  };
