import { AppError } from "./app-error.js";

export class ServiceUnavailableError extends AppError {
  constructor(message = "The service is temporarily unavailable.") {
    super({ code: "SERVICE_UNAVAILABLE", message, statusCode: 503 });
  }
}
