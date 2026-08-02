import { AppError } from "./app-error.js";

export class ForbiddenError extends AppError {
  constructor(message = "You are not allowed to perform this action.") {
    super({ code: "FORBIDDEN", message, statusCode: 403 });
  }
}
