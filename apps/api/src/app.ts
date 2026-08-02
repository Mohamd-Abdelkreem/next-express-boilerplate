import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { Logger } from "pino";

import type { DatabaseClient } from "@template/database";

import type { Environment } from "./core/config/environment.js";
import { ForbiddenError } from "./core/errors/forbidden-error.js";
import { createRateLimiter } from "./infrastructure/security/rate-limiter.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { requestId } from "./middlewares/request-id.js";
import { createApiRouter } from "./router.js";

type AppDependencies = Readonly<{
  database: DatabaseClient;
  environment: Environment;
  logger: Logger;
}>;

export const createApp = ({
  database,
  environment,
  logger,
}: AppDependencies) => {
  const app = express();
  const allowedOrigins = new Set(environment.CORS_ORIGINS);

  app.disable("x-powered-by");
  app.set("json escape", true);
  app.set("trust proxy", environment.TRUST_PROXY);

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (request) => request.requestId,
      customProps: (request) => ({ requestId: request.requestId }),
    }),
  );
  app.use(helmet());
  app.use(
    cors({
      credentials: true,
      origin: (origin, callback) => {
        if (origin === undefined || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new ForbiddenError("Origin is not allowed by CORS."));
      },
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: environment.BODY_LIMIT }));
  app.use(
    express.urlencoded({ extended: true, limit: environment.BODY_LIMIT }),
  );
  app.use(createRateLimiter(environment));

  app.use("/api/v1", createApiRouter(database, logger));
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
