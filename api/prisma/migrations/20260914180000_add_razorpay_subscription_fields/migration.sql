ALTER TABLE "subscriptions"
ADD COLUMN "razorpaySubscriptionId" TEXT,
ADD COLUMN "razorpayPaymentId" TEXT,
ADD COLUMN "razorpayStatus" TEXT;

CREATE UNIQUE INDEX "subscriptions_razorpaySubscriptionId_key"
ON "subscriptions"("razorpaySubscriptionId");
