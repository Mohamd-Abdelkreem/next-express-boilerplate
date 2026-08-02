import { rateLimit } from "express-rate-limit";

import { rateLimitConfig } from "../core/config/rate-limit.config.js";
import { TooManyRequestsException } from "../core/errors/too-many-requests.error.js";

export const apiRateLimitMiddleware = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  limit: rateLimitConfig.maxRequests,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, _response, next) => {
    next(new TooManyRequestsException());
  },
});
