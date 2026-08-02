import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { appConfig } from "../core/config/app.config.js";
import { HTTP_STATUS } from "../core/constants/http-status.constants.js";
import { AppError } from "../core/errors/app.error.js";
import { InternalServerError } from "../core/errors/internal-server.error.js";
import type {
  ErrorResponse,
  FieldError,
} from "../core/responses/api-response.js";

const formatZodErrors = (error: ZodError): FieldError[] =>
  error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

const createErrorResponse = (
  error: AppError,
  path: string,
  requestId: string,
): ErrorResponse => ({
  success: false,
  statusCode: error.statusCode,
  code: error.code,
  message: error.message,
  data: null,
  errors: error.errors?.length === 0 ? undefined : error.errors,
  ...(appConfig.isDevelopment ? { stack: error.stack } : {}),
  requestId,
  timestamp: error.timestamp,
  path,
});

export const errorHandlerMiddleware: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  _next,
) => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof ZodError) {
    appError = new AppError(
      "Validation failed.",
      HTTP_STATUS.BAD_REQUEST,
      "VALIDATION_ERROR",
      true,
      formatZodErrors(error),
    );
  } else {
    appError = new InternalServerError();

    if (error instanceof Error && error.stack !== undefined) {
      appError.stack = error.stack;
    }
  }

  const logContext = {
    code: appError.code,
    requestId: request.requestId,
    statusCode: appError.statusCode,
    ...(appError.isOperational ? {} : { err: error }),
  };

  if (appError.isOperational) {
    request.log.warn(logContext, appError.message);
  } else {
    request.log.error(logContext, appError.message);
  }

  return response
    .status(appError.statusCode)
    .json(createErrorResponse(appError, request.path, request.requestId));
};

export const errorHandler = errorHandlerMiddleware;
