import { AppError } from "./app-error.js";

export class InternalServerError extends AppError {
  constructor(cause?: unknown) {
    super({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
      statusCode: 500,
      cause,
      isOperational: false,
    });
  }
}
