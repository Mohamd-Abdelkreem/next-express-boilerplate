import type { Request, Response } from "express";

import { ResponseHelper } from "../../core/responses/api-response.js";
import type { DemoService } from "./demo.service.js";

export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  checkConnection = async (
    request: Request,
    response: Response,
  ): Promise<Response> => {
    const result = await this.demoService.checkConnection();

    return ResponseHelper.ok(
      response,
      result,
      "Full-stack connection verified.",
      request.path,
      request.requestId,
    );
  };
}
