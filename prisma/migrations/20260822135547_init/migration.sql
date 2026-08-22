-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('LOST', 'FOUND');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('ACTIVE', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('ELECTRONICS', 'BAGS_AND_BACKPACKS', 'KEYS', 'WALLETS_AND_CARDS', 'CLOTHING_AND_ACCESSORIES', 'JEWELRY_AND_WATCHES', 'DOCUMENTS_AND_IDS', 'BOOKS_AND_STATIONERY', 'OTHER');

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'ACTIVE',
    "category" "ItemCategory" NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeOfDay" "TimeOfDay",
    "location" TEXT NOT NULL,
    "locationDetail" TEXT,
    "color" TEXT,
    "brand" TEXT,
    "imageUrl" TEXT,
    "contactInfo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PotentialMatch" (
    "id" TEXT NOT NULL,
    "lostReportId" TEXT NOT NULL,
    "foundReportId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reasons" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PotentialMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Report_type_status_idx" ON "Report"("type", "status");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_category_idx" ON "Report"("category");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "PotentialMatch_foundReportId_idx" ON "PotentialMatch"("foundReportId");

-- CreateIndex
CREATE INDEX "PotentialMatch_score_idx" ON "PotentialMatch"("score");

-- CreateIndex
CREATE UNIQUE INDEX "PotentialMatch_lostReportId_foundReportId_key" ON "PotentialMatch"("lostReportId", "foundReportId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PotentialMatch" ADD CONSTRAINT "PotentialMatch_lostReportId_fkey" FOREIGN KEY ("lostReportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PotentialMatch" ADD CONSTRAINT "PotentialMatch_foundReportId_fkey" FOREIGN KEY ("foundReportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
