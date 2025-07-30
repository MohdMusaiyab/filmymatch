import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_post_tags ON "Post" USING GIN ("tags");
  `);
  console.log("✅ GIN index on Post.tags added successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error adding index:", e);
  })
  .finally(() => prisma.$disconnect());
