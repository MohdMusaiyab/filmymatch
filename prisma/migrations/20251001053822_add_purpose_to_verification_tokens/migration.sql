-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'email_verification';
