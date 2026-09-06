CREATE TABLE "otp_challenges" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userPartnerId" TEXT NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "plan" TEXT,
    "activeUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pokes" (
    "id" TEXT NOT NULL,
    "userPartnerId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pokes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shared_lists" (
    "id" TEXT NOT NULL,
    "userPartnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shared_lists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shared_list_items" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shared_list_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "otp_challenges_phone_expiresAt_idx" ON "otp_challenges"("phone", "expiresAt");
CREATE UNIQUE INDEX "subscriptions_userPartnerId_key" ON "subscriptions"("userPartnerId");
CREATE INDEX "pokes_userPartnerId_createdAt_idx" ON "pokes"("userPartnerId", "createdAt");
CREATE INDEX "pokes_recipientId_createdAt_idx" ON "pokes"("recipientId", "createdAt");
CREATE INDEX "shared_lists_userPartnerId_idx" ON "shared_lists"("userPartnerId");
CREATE INDEX "shared_list_items_listId_idx" ON "shared_list_items"("listId");

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userPartnerId_fkey" FOREIGN KEY ("userPartnerId") REFERENCES "user_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pokes" ADD CONSTRAINT "pokes_userPartnerId_fkey" FOREIGN KEY ("userPartnerId") REFERENCES "user_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pokes" ADD CONSTRAINT "pokes_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pokes" ADD CONSTRAINT "pokes_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shared_lists" ADD CONSTRAINT "shared_lists_userPartnerId_fkey" FOREIGN KEY ("userPartnerId") REFERENCES "user_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shared_lists" ADD CONSTRAINT "shared_lists_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shared_list_items" ADD CONSTRAINT "shared_list_items_listId_fkey" FOREIGN KEY ("listId") REFERENCES "shared_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;