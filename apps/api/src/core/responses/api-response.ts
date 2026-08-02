import type { Request, Response } from "express";

import type { AppError } from "../errors/app-error.js";

export const sendSuccess = (
  request: Request,
  response: Response,
  statusCode: number,
  data: unknown,
) =>
  response.status(statusCode).json({
    success: true,
    data,
    requestId: request.requestId,
  });

export const sendError = (
  request: Request,
  response: Response,
  error: AppError,
  includeDetails = false,
) =>
  response.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(includeDetails && error.details !== undefined
        ? { details: error.details }
        : {}),
    },
    requestId: request.requestId,
  });
