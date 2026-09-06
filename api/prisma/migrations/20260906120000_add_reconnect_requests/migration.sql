CREATE TABLE "reconnect_requests" (
    "id" TEXT NOT NULL,
    "userPartnerId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reconnect_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reconnect_requests_userPartnerId_idx" ON "reconnect_requests"("userPartnerId");
CREATE UNIQUE INDEX "reconnect_requests_userPartnerId_requesterId_key" ON "reconnect_requests"("userPartnerId", "requesterId");

ALTER TABLE "reconnect_requests" ADD CONSTRAINT "reconnect_requests_userPartnerId_fkey" FOREIGN KEY ("userPartnerId") REFERENCES "user_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reconnect_requests" ADD CONSTRAINT "reconnect_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
