import { AppError } from "./app-error.js";

export class ValidationError extends AppError {
  constructor(details: unknown, message = "Request validation failed.") {
    super({ code: "VALIDATION_ERROR", message, statusCode: 400, details });
  }
}
