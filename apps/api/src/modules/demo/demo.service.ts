import type { DatabaseClient } from "@template/database";

import type { DemoConnectionResult } from "./demo.types.js";

export class DemoService {
  constructor(private readonly database: DatabaseClient) {}

  async checkConnection(): Promise<DemoConnectionResult> {
    const message = await this.database.demoMessage.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return {
      api: "connected",
      database: "connected",
      message,
      checkedAt: new Date().toISOString(),
    };
  }
}
