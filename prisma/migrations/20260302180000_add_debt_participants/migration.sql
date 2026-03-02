-- CreateTable: DebtParticipant
CREATE TABLE "DebtParticipant" (
    "id" TEXT NOT NULL,
    "debtId" TEXT NOT NULL,
    "personCompanyId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DebtParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DebtParticipant_debtId_idx" ON "DebtParticipant"("debtId");
CREATE INDEX "DebtParticipant_personCompanyId_idx" ON "DebtParticipant"("personCompanyId");
CREATE UNIQUE INDEX "DebtParticipant_debtId_personCompanyId_key" ON "DebtParticipant"("debtId", "personCompanyId");

-- AddForeignKey
ALTER TABLE "DebtParticipant" ADD CONSTRAINT "DebtParticipant_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DebtParticipant" ADD CONSTRAINT "DebtParticipant_personCompanyId_fkey" FOREIGN KEY ("personCompanyId") REFERENCES "PersonCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Data Migration: copy existing personCompanyId + totalAmount into DebtParticipant
INSERT INTO "DebtParticipant" ("id", "debtId", "personCompanyId", "amount")
SELECT
    gen_random_uuid(),
    "id",
    "personCompanyId",
    "totalAmount"
FROM "Debt"
WHERE "personCompanyId" IS NOT NULL;

-- AlterTable: make personCompanyId optional on Debt
ALTER TABLE "Debt" ALTER COLUMN "personCompanyId" DROP NOT NULL;
