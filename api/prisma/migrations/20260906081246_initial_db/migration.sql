-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('invited', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "profilePicture" TEXT,
    "partnerId" TEXT,
    "timezone" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_partners" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerId" TEXT,
    "relationshipType" TEXT NOT NULL,
    "locationType" TEXT,
    "goal" TEXT,
    "dailyQuestionTime" TIMESTAMP(3),
    "status" "RelationshipStatus" NOT NULL DEFAULT 'invited',
    "anniversary" TIMESTAMP(3),
    "invitationCode" TEXT,
    "invitedAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "brokenAt" TIMESTAMP(3),
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "user_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_memories" (
    "id" TEXT NOT NULL,
    "userPartnerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "memoryDate" TIMESTAMP(3),
    "thumbnail" TEXT,
    "location" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_memory_items" (
    "id" TEXT NOT NULL,
    "partnerMemoryId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_memory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_moods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_moods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "userPartnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_question_answers" (
    "id" TEXT NOT NULL,
    "dailyQuestionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "reaction" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_partner_plans" (
    "id" TEXT NOT NULL,
    "userPartnerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "note" TEXT,
    "remindAt" TIMESTAMP(3),
    "lastReminderAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_partner_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_check_ins" (
    "id" TEXT NOT NULL,
    "userPartnerId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "partnerOneNotes" TEXT,
    "partnerTwoNotes" TEXT,
    "nextWeekGoals" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_check_in_qna" (
    "id" TEXT NOT NULL,
    "weeklyCheckInId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_check_in_qna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_partnerId_idx" ON "users"("partnerId");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "users_phone_deletedAt_idx" ON "users"("phone", "deletedAt");

-- CreateIndex
CREATE INDEX "user_partners_userId_idx" ON "user_partners"("userId");

-- CreateIndex
CREATE INDEX "user_partners_partnerId_idx" ON "user_partners"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_partners_userId_partnerId_key" ON "user_partners"("userId", "partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "partner_memories_userPartnerId_idx" ON "partner_memories"("userPartnerId");

-- CreateIndex
CREATE INDEX "partner_memories_deletedAt_idx" ON "partner_memories"("deletedAt");

-- CreateIndex
CREATE INDEX "partner_memories_isFavorite_idx" ON "partner_memories"("isFavorite");

-- CreateIndex
CREATE INDEX "partner_memories_memoryDate_idx" ON "partner_memories"("memoryDate");

-- CreateIndex
CREATE INDEX "partner_memories_location_idx" ON "partner_memories"("location");

-- CreateIndex
CREATE INDEX "partner_memory_items_partnerMemoryId_idx" ON "partner_memory_items"("partnerMemoryId");

-- CreateIndex
CREATE INDEX "partner_memory_items_uploadedBy_idx" ON "partner_memory_items"("uploadedBy");

-- CreateIndex
CREATE INDEX "partner_memory_items_deletedAt_idx" ON "partner_memory_items"("deletedAt");

-- CreateIndex
CREATE INDEX "user_moods_userId_idx" ON "user_moods"("userId");

-- CreateIndex
CREATE INDEX "daily_questions_createdAt_idx" ON "daily_questions"("createdAt");

-- CreateIndex
CREATE INDEX "daily_question_answers_dailyQuestionId_idx" ON "daily_question_answers"("dailyQuestionId");

-- CreateIndex
CREATE INDEX "daily_question_answers_userId_idx" ON "daily_question_answers"("userId");

-- CreateIndex
CREATE INDEX "user_partner_plans_userPartnerId_idx" ON "user_partner_plans"("userPartnerId");

-- CreateIndex
CREATE INDEX "weekly_check_ins_userPartnerId_idx" ON "weekly_check_ins"("userPartnerId");

-- CreateIndex
CREATE INDEX "weekly_check_ins_weekStart_idx" ON "weekly_check_ins"("weekStart");

-- CreateIndex
CREATE INDEX "weekly_check_in_qna_weeklyCheckInId_idx" ON "weekly_check_in_qna"("weeklyCheckInId");

-- CreateIndex
CREATE INDEX "weekly_check_in_qna_userId_idx" ON "weekly_check_in_qna"("userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_partners" ADD CONSTRAINT "user_partners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_partners" ADD CONSTRAINT "user_partners_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_memories" ADD CONSTRAINT "partner_memories_userPartnerId_fkey" FOREIGN KEY ("userPartnerId") REFERENCES "user_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_memories" ADD CONSTRAINT "partner_memories_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_memory_items" ADD CONSTRAINT "partner_memory_items_partnerMemoryId_fkey" FOREIGN KEY ("partnerMemoryId") REFERENCES "partner_memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_memory_items" ADD CONSTRAINT "partner_memory_items_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_moods" ADD CONSTRAINT "user_moods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_questions" ADD CONSTRAINT "daily_questions_userPartnerId_fkey" FOREIGN KEY ("userPartnerId") REFERENCES "user_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_question_answers" ADD CONSTRAINT "daily_question_answers_dailyQuestionId_fkey" FOREIGN KEY ("dailyQuestionId") REFERENCES "daily_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_question_answers" ADD CONSTRAINT "daily_question_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_partner_plans" ADD CONSTRAINT "user_partner_plans_userPartnerId_fkey" FOREIGN KEY ("userPartnerId") REFERENCES "user_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_partner_plans" ADD CONSTRAINT "user_partner_plans_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_check_ins" ADD CONSTRAINT "weekly_check_ins_userPartnerId_fkey" FOREIGN KEY ("userPartnerId") REFERENCES "user_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_check_in_qna" ADD CONSTRAINT "weekly_check_in_qna_weeklyCheckInId_fkey" FOREIGN KEY ("weeklyCheckInId") REFERENCES "weekly_check_ins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_check_in_qna" ADD CONSTRAINT "weekly_check_in_qna_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
