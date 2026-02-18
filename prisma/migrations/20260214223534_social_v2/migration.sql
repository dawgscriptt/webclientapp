-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('user', 'mod', 'admin');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('friend_request', 'friend_accept', 'message', 'mention', 'comment_reply', 'report_new', 'report_update');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'closed');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "role" "AccountRole" NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'open';

-- CreateTable
CREATE TABLE "HubSubscription" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HubSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "url" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HubSubscription_hubId_idx" ON "HubSubscription"("hubId");

-- CreateIndex
CREATE INDEX "HubSubscription_accountId_createdAt_idx" ON "HubSubscription"("accountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HubSubscription_accountId_hubId_key" ON "HubSubscription"("accountId", "hubId");

-- CreateIndex
CREATE INDEX "Notification_accountId_createdAt_idx" ON "Notification"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_accountId_readAt_idx" ON "Notification"("accountId", "readAt");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "HubSubscription" ADD CONSTRAINT "HubSubscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubSubscription" ADD CONSTRAINT "HubSubscription_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
