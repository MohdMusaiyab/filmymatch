import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_post_visibility_draft_category_createdat
    ON "Post" ("visibility", "isDraft", "category", "createdAt" DESC);
  `);
  console.log("✅ Composite index created.");
}

main()
  .catch((e) => {
    console.error("❌ Failed to create index:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
