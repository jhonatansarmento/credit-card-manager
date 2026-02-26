-- AlterTable: Convert monetary fields from DOUBLE PRECISION (Float) to DECIMAL(10,2)
ALTER TABLE "Debt" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10, 2);
ALTER TABLE "Debt" ALTER COLUMN "installmentValue" SET DATA TYPE DECIMAL(10, 2);
ALTER TABLE "Installment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10, 2);
