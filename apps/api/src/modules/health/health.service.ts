import type { DatabaseClient } from "@template/database";

export const checkDatabaseReadiness = async (
  database: DatabaseClient,
): Promise<void> => {
  await database.$queryRaw`SELECT 1`;
};
