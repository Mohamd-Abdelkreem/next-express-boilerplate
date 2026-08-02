import { AppError } from "./app-error.js";

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required.") {
    super({ code: "UNAUTHORIZED", message, statusCode: 401 });
  }
}
