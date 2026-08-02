import { rateLimit } from "express-rate-limit";

import type { Environment } from "../../core/config/environment.js";
import { TooManyRequestsError } from "../../core/errors/too-many-requests-error.js";
import { sendError } from "../../core/responses/api-response.js";

export const createRateLimiter = (environment: Environment) =>
  rateLimit({
    windowMs: environment.API_RATE_LIMIT_WINDOW_MS,
    limit: environment.API_RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (request, response) =>
      sendError(request, response, new TooManyRequestsError()),
  });
