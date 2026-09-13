/*
  Warnings:

  - A unique constraint covering the columns `[questionDate,userPartnerId]` on the table `daily_questions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('FUN', 'APPRECIATION', 'MEMORIES', 'EVERYDAY', 'ROMANCE', 'FUTURE', 'VALUES', 'DEEP');

-- AlterTable
ALTER TABLE "daily_questions" ADD COLUMN     "questionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "questionLibraryId" TEXT;

-- CreateTable
CREATE TABLE "question_library" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 1,
    "status" "QuestionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_library_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_library_category_idx" ON "question_library"("category");

-- CreateIndex
CREATE INDEX "question_library_status_idx" ON "question_library"("status");

-- CreateIndex
CREATE UNIQUE INDEX "daily_questions_questionDate_userPartnerId_key" ON "daily_questions"("questionDate", "userPartnerId");

-- AddForeignKey
ALTER TABLE "daily_questions" ADD CONSTRAINT "daily_questions_questionLibraryId_fkey" FOREIGN KEY ("questionLibraryId") REFERENCES "question_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;
