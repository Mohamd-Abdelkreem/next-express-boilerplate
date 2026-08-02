import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
  constructor(message = "The request is invalid.", cause?: unknown) {
    super({ code: "BAD_REQUEST", message, statusCode: 400, cause });
  }
}
