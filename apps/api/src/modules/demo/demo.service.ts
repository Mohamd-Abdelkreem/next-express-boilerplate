import type { DatabaseClient, DemoMessage } from "@repo/database";

export type DemoConnectionResult = Readonly<{
  api: "connected";
  database: "connected";
  message: DemoMessage | null;
  checkedAt: string;
}>;

export const checkDemoConnection = async (
  database: DatabaseClient,
): Promise<DemoConnectionResult> => {
  const message = await database.demoMessage.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return {
    api: "connected",
    database: "connected",
    message,
    checkedAt: new Date().toISOString(),
  };
};
