import { AppError } from "./app-error.js";

export class ConflictError extends AppError {
  constructor(message = "The request conflicts with the current state.") {
    super({ code: "CONFLICT", message, statusCode: 409 });
  }
}
