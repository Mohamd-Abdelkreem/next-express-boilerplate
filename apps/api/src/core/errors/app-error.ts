export type AppErrorOptions = Readonly<{
  code: string;
  message: string;
  statusCode: number;
  cause?: unknown;
  details?: unknown;
  isOperational?: boolean;
}>;

export class AppError extends Error {
  readonly code: string;
  readonly details?: unknown;
  readonly isOperational: boolean;
  readonly statusCode: number;

  constructor(options: AppErrorOptions) {
    super(
      options.message,
      options.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = new.target.name;
    this.code = options.code;
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    this.statusCode = options.statusCode;
    Error.captureStackTrace(this, new.target);
  }
}
