/*
  Warnings:

  - You are about to drop the column `securityAnswer` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `securityQuestion` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "securityAnswer",
DROP COLUMN "securityQuestion",
ALTER COLUMN "phone" DROP NOT NULL;

-- DropEnum
DROP TYPE "SecurityQuestion";
