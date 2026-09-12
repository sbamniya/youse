-- AlterTable
ALTER TABLE "user_partners" ADD COLUMN "partnerName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_partners_invitationCode_key" ON "user_partners"("invitationCode");

-- CreateIndex
CREATE INDEX "user_partners_invitationCode_deletedAt_idx" ON "user_partners"("invitationCode", "deletedAt");
