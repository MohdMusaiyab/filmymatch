// scripts/check-index-usage.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const query = `
    EXPLAIN (ANALYZE, VERBOSE, BUFFERS)
    SELECT "id", "title", "visibility", "isDraft", "category", "createdAt"
    FROM "Post"
    WHERE "visibility" = 'PUBLIC'
      AND "isDraft" = false
      AND "category" = 'PODCAST'
    ORDER BY "createdAt" DESC
    LIMIT 10 OFFSET 0;
  `;

  const result = await prisma.$queryRawUnsafe<any[]>(query);
  console.log("📊 Index Check Report:");
  result.forEach((line) => console.log(line["QUERY PLAN"]));
}

main()
  .catch((e) => {
    console.error("❌ Error during index check:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
