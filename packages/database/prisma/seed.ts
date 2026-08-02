import { createDatabaseClient } from "../src/client.js";

const databaseUrl = process.env["DATABASE_URL"];

if (databaseUrl === undefined || databaseUrl.length === 0) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const database = createDatabaseClient(databaseUrl);

try {
  const demoMessage = await database.demoMessage.upsert({
    where: { slug: "platform-ready" },
    update: {
      title: "Tas3eer Pro is connected",
      message:
        "This record travelled from PostgreSQL through Prisma and Express.",
    },
    create: {
      slug: "platform-ready",
      title: "Tas3eer Pro is connected",
      message:
        "This record travelled from PostgreSQL through Prisma and Express.",
    },
  });

  console.info(`Seeded demo message: ${demoMessage.slug}`);
} finally {
  await database.$disconnect();
}
