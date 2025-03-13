-- CreateEnum
CREATE TYPE "SecurityQuestion" AS ENUM ('MOTHERS_MAIDEN_NAME', 'FIRST_PET_NAME', 'BIRTH_CITY', 'FAVORITE_TEACHER', 'CHILDHOOD_NICKNAME', 'FIRST_CAR_MODEL', 'HIGH_SCHOOL_MASCOT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "securityQuestion" "SecurityQuestion" NOT NULL,
    "securityAnswer" TEXT NOT NULL,
    "bio" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
