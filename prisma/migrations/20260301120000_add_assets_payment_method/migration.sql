-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'BOLETO', 'DEBIT', 'PIX', 'TRANSFER', 'CASH');

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_userId_name_key" ON "Asset"("userId", "name");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Add paymentMethod, dueDay, assetId to Debt
ALTER TABLE "Debt" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CREDIT_CARD';
ALTER TABLE "Debt" ADD COLUMN "dueDay" INTEGER;
ALTER TABLE "Debt" ADD COLUMN "assetId" TEXT;

-- Make cardId optional (allow NULL)
ALTER TABLE "Debt" ALTER COLUMN "cardId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Debt_assetId_idx" ON "Debt"("assetId");

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
