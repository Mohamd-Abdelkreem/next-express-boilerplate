import type { ErrorRequestHandler } from "express";

import { AppError } from "../core/errors/app-error.js";
import { InternalServerError } from "../core/errors/internal-server-error.js";
import { sendError } from "../core/responses/api-response.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  _next,
) => {
  const appError =
    error instanceof AppError ? error : new InternalServerError(error);

  const logContext = {
    code: appError.code,
    requestId: request.requestId,
    statusCode: appError.statusCode,
    ...(appError.isOperational ? {} : { err: appError }),
  };

  if (appError.statusCode >= 500)
    request.log.error(logContext, appError.message);
  else request.log.warn(logContext, appError.message);

  const includeDetails =
    appError.code === "VALIDATION_ERROR" && appError.details !== undefined;

  return sendError(request, response, appError, includeDetails);
};
