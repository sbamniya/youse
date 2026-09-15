ALTER TABLE "subscriptions"
ADD COLUMN "pendingPlan" TEXT,
ADD COLUMN "cancelAtCycleEnd" BOOLEAN NOT NULL DEFAULT false;
