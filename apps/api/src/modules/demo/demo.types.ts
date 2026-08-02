import type { DemoMessage } from "@template/database";

export interface DemoConnectionResult {
  api: "connected";
  database: "connected";
  message: DemoMessage | null;
  checkedAt: string;
}
