import compression from "compression";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";

import { apiRouter } from "./router.js";

export const createApp = () => {
  const app = express();

  const webOrigin =
    process.env["WEB_ORIGIN"] ?? "http://localhost:3000";

  app.disable("x-powered-by");
  app.set("json escape", true);

  app.use(helmet());

  app.use(
    cors({
      origin: webOrigin,
      credentials: true,
    }),
  );

  app.use(compression());

  app.use(express.json({ limit: "1mb" }));
  app.use(
    express.urlencoded({
      extended: true,
      limit: "1mb",
    }),
  );

  app.use("/api/v1", apiRouter);

  app.use((_request: Request, response: Response) => {
    return response.status(404).json({
      success: false,
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Route not found.",
      },
    });
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      console.error(error);

      return response.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      });
    },
  );

  return app;
};