import { pinoHttp } from "pino-http";
import type { Request } from "express";
import type { Logger } from "pino";

export const createRequestLoggerMiddleware = (logger: Logger) =>
  pinoHttp({
    logger,
    genReqId: (request) => (request as Request).requestId,
    customProps: (request) => {
      const expressRequest = request as Request;

      return {
        requestId: expressRequest.requestId,
        userId: expressRequest.user?.id,
      };
    },
  });
