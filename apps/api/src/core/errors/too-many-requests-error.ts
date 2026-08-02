import { AppError } from "./app-error.js";

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super({ code: "RATE_LIMIT_EXCEEDED", message, statusCode: 429 });
  }
}
