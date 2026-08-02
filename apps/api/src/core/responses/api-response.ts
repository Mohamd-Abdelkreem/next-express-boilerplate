import type { Response } from "express";

import { HTTP_STATUS } from "../constants/http-status.constants.js";

/* eslint-disable @typescript-eslint/no-extraneous-class, @typescript-eslint/no-unnecessary-type-parameters -- The static helper class and generic method signatures are the project's API response convention. */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface HTTPResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  paginationMeta?: PaginationMeta;
  requestId: string;
  timestamp: string;
  path: string;
}

export interface ErrorResponse extends HTTPResponse<null> {
  code: string;
  errors: FieldError[] | undefined;
  stack?: string | undefined;
}

export class ResponseHelper {
  static success<T>(
    response: Response,
    data: T,
    message: string,
    statusCode: number,
    path: string,
    requestId: string,
  ): Response {
    const paginationMeta =
      data !== null && typeof data === "object" && "pagination" in data
        ? ((data as { pagination?: PaginationMeta }).pagination ?? undefined)
        : undefined;

    const payload: HTTPResponse<T> = {
      success: true,
      message,
      statusCode,
      data,
      ...(paginationMeta === undefined ? {} : { paginationMeta }),
      requestId,
      timestamp: new Date().toISOString(),
      path,
    };

    return response.status(statusCode).json(payload);
  }

  static created<T>(
    response: Response,
    data: T,
    message: string,
    path: string,
    requestId: string,
  ): Response {
    return this.success(
      response,
      data,
      message,
      HTTP_STATUS.CREATED,
      path,
      requestId,
    );
  }

  static ok<T>(
    response: Response,
    data: T,
    message: string,
    path: string,
    requestId: string,
  ): Response {
    return this.success(
      response,
      data,
      message,
      HTTP_STATUS.OK,
      path,
      requestId,
    );
  }
}

export default ResponseHelper;
