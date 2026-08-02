declare global {
  namespace Express {
    interface Request {
      requestId: string;
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

export {};
