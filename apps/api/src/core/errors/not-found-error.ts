import { AppError } from "./app-error.js";

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super({ code: "NOT_FOUND", message, statusCode: 404 });
  }
}
