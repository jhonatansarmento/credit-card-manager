-- CreateIndex
CREATE INDEX "Debt_userId_isArchived_idx" ON "Debt"("userId", "isArchived");

-- CreateIndex
CREATE INDEX "Debt_cardId_idx" ON "Debt"("cardId");

-- CreateIndex
CREATE INDEX "Debt_personCompanyId_idx" ON "Debt"("personCompanyId");

-- CreateIndex
CREATE INDEX "Installment_debtId_isPaid_idx" ON "Installment"("debtId", "isPaid");

-- CreateIndex
CREATE INDEX "Installment_debtId_dueDate_idx" ON "Installment"("debtId", "dueDate");
