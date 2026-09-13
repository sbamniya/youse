-- CreateTable
CREATE TABLE "daily_question_reminder_histories" (
    "dailyQuestionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "remindedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_question_reminder_histories_pkey" PRIMARY KEY ("dailyQuestionId","userId")
);

-- CreateIndex
CREATE INDEX "daily_question_reminder_histories_dailyQuestionId_idx" ON "daily_question_reminder_histories"("dailyQuestionId");

-- CreateIndex
CREATE INDEX "daily_question_reminder_histories_userId_idx" ON "daily_question_reminder_histories"("userId");

-- AddForeignKey
ALTER TABLE "daily_question_reminder_histories" ADD CONSTRAINT "daily_question_reminder_histories_dailyQuestionId_fkey" FOREIGN KEY ("dailyQuestionId") REFERENCES "daily_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_question_reminder_histories" ADD CONSTRAINT "daily_question_reminder_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
