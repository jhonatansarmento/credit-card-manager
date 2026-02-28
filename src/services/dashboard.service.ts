import prisma from '@/lib/db';

export interface DashboardSummary {
  activeDebts: number;
  totalPending: number;
  totalPaid: number;
  installmentsDueThisMonth: number;
  overallPayoffPercent: number;
}

export interface SpendingByCard {
  cardName: string;
  totalAmount: number;
  pendingAmount: number;
  debtCount: number;
}

export interface SpendingByPerson {
  personName: string;
  totalAmount: number;
  pendingAmount: number;
  debtCount: number;
}

export interface MonthlyEvolution {
  month: string; // "2026-01"
  paid: number;
  pending: number;
}

export interface UpcomingInstallment {
  id: string;
  debtDescription: string;
  cardName: string;
  personName: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: Date;
  amount: number;
}

export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummary> {
  // Count active debts (debts with at least one unpaid installment)
  const activeDebts = await prisma.debt.count({
    where: {
      userId,
      isArchived: false,
      installments: { some: { isPaid: false } },
    },
  });

  // Aggregate paid vs pending amounts
  const [paidAgg, pendingAgg] = await Promise.all([
    prisma.installment.aggregate({
      where: { debt: { userId }, isPaid: true },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.installment.aggregate({
      where: { debt: { userId }, isPaid: false },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalPaid = Number(paidAgg._sum.amount ?? 0);
  const totalPending = Number(pendingAgg._sum.amount ?? 0);
  const paidCount = paidAgg._count;
  const pendingCount = pendingAgg._count;
  const totalInstallments = paidCount + pendingCount;

  // Installments due this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const installmentsDueThisMonth = await prisma.installment.count({
    where: {
      debt: { userId },
      isPaid: false,
      dueDate: { gte: startOfMonth, lt: startOfNextMonth },
    },
  });

  const overallPayoffPercent =
    totalInstallments > 0 ? (paidCount / totalInstallments) * 100 : 0;

  return {
    activeDebts,
    totalPending,
    totalPaid,
    installmentsDueThisMonth,
    overallPayoffPercent,
  };
}

export async function getSpendingByCard(
  userId: string,
): Promise<SpendingByCard[]> {
  // Get all debts grouped by card with installment aggregation
  const debts = await prisma.debt.findMany({
    where: { userId },
    select: {
      cardId: true,
      creditCard: { select: { name: true } },
    },
  });

  // Get unique card mappings
  const cardMap = new Map<string, string>();
  for (const d of debts) {
    cardMap.set(d.cardId, d.creditCard.name);
  }

  // Aggregate installment totals grouped by card
  const cardIds = Array.from(cardMap.keys());
  if (cardIds.length === 0) return [];

  const results = await Promise.all(
    cardIds.map(async (cardId) => {
      const [totalAgg, pendingAgg, debtCount] = await Promise.all([
        prisma.installment.aggregate({
          where: { debt: { userId, cardId } },
          _sum: { amount: true },
        }),
        prisma.installment.aggregate({
          where: { debt: { userId, cardId }, isPaid: false },
          _sum: { amount: true },
        }),
        prisma.debt.count({ where: { userId, cardId } }),
      ]);

      return {
        cardName: cardMap.get(cardId)!,
        totalAmount: Number(totalAgg._sum.amount ?? 0),
        pendingAmount: Number(pendingAgg._sum.amount ?? 0),
        debtCount,
      };
    }),
  );

  return results.sort((a, b) => b.totalAmount - a.totalAmount);
}

export async function getSpendingByPerson(
  userId: string,
): Promise<SpendingByPerson[]> {
  const debts = await prisma.debt.findMany({
    where: { userId },
    select: {
      personCompanyId: true,
      personCompany: { select: { name: true } },
    },
  });

  const personMap = new Map<string, string>();
  for (const d of debts) {
    personMap.set(d.personCompanyId, d.personCompany.name);
  }

  const personIds = Array.from(personMap.keys());
  if (personIds.length === 0) return [];

  const results = await Promise.all(
    personIds.map(async (personCompanyId) => {
      const [totalAgg, pendingAgg, debtCount] = await Promise.all([
        prisma.installment.aggregate({
          where: { debt: { userId, personCompanyId } },
          _sum: { amount: true },
        }),
        prisma.installment.aggregate({
          where: { debt: { userId, personCompanyId }, isPaid: false },
          _sum: { amount: true },
        }),
        prisma.debt.count({ where: { userId, personCompanyId } }),
      ]);

      return {
        personName: personMap.get(personCompanyId)!,
        totalAmount: Number(totalAgg._sum.amount ?? 0),
        pendingAmount: Number(pendingAgg._sum.amount ?? 0),
        debtCount,
      };
    }),
  );

  return results.sort((a, b) => b.totalAmount - a.totalAmount);
}

export async function getMonthlyEvolution(
  userId: string,
): Promise<MonthlyEvolution[]> {
  const installments = await prisma.installment.findMany({
    where: { debt: { userId } },
    select: { dueDate: true, amount: true, isPaid: true },
    orderBy: { dueDate: 'asc' },
  });

  const monthMap = new Map<string, { paid: number; pending: number }>();

  for (const inst of installments) {
    const year = inst.dueDate.getFullYear();
    const month = String(inst.dueDate.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    const existing = monthMap.get(key) || { paid: 0, pending: 0 };
    const amount = Number(inst.amount);

    if (inst.isPaid) {
      existing.paid += amount;
    } else {
      existing.pending += amount;
    }

    monthMap.set(key, existing);
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export async function getUpcomingInstallments(
  userId: string,
  limit = 10,
): Promise<UpcomingInstallment[]> {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const installments = await prisma.installment.findMany({
    where: {
      debt: { userId },
      isPaid: false,
      dueDate: { gte: now },
    },
    include: {
      debt: {
        select: {
          description: true,
          installmentsQuantity: true,
          creditCard: { select: { name: true } },
          personCompany: { select: { name: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: limit,
  });

  return installments.map((inst) => ({
    id: inst.id,
    debtDescription: inst.debt.description,
    cardName: inst.debt.creditCard.name,
    personName: inst.debt.personCompany.name,
    installmentNumber: inst.installmentNumber,
    totalInstallments: inst.debt.installmentsQuantity,
    dueDate: inst.dueDate,
    amount: Number(inst.amount),
  }));
}

export async function getOverdueInstallments(
  userId: string,
  limit = 20,
): Promise<UpcomingInstallment[]> {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const installments = await prisma.installment.findMany({
    where: {
      debt: { userId, isArchived: false },
      isPaid: false,
      dueDate: { lt: now },
    },
    include: {
      debt: {
        select: {
          description: true,
          installmentsQuantity: true,
          creditCard: { select: { name: true } },
          personCompany: { select: { name: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: limit,
  });

  return installments.map((inst) => ({
    id: inst.id,
    debtDescription: inst.debt.description,
    cardName: inst.debt.creditCard.name,
    personName: inst.debt.personCompany.name,
    installmentNumber: inst.installmentNumber,
    totalInstallments: inst.debt.installmentsQuantity,
    dueDate: inst.dueDate,
    amount: Number(inst.amount),
  }));
}

// --- Sprint 9 additions ---

export interface SpendingByCategory {
  categoryId: string | null;
  categoryName: string;
  emoji: string;
  color: string;
  totalAmount: number;
  pendingAmount: number;
  debtCount: number;
}

export interface InvoiceSummary {
  cardId: string;
  cardName: string;
  closingDay: number | null;
  dueDay: number;
  currentInvoiceTotal: number;
  installmentCount: number;
  debtCount: number;
}

export interface MonthlyProjection {
  month: string;
  pending: number;
  cumulative: number;
}

export async function getSpendingByCategory(
  userId: string,
): Promise<SpendingByCategory[]> {
  const debts = await prisma.debt.findMany({
    where: { userId },
    select: {
      categoryId: true,
      category: { select: { name: true, emoji: true, color: true } },
      installments: {
        select: { amount: true, isPaid: true },
      },
    },
  });

  const catMap = new Map<string, SpendingByCategory>();

  for (const debt of debts) {
    const key = debt.categoryId || '__uncategorized__';
    const existing = catMap.get(key) || {
      categoryId: debt.categoryId,
      categoryName: debt.category?.name || 'Sem Categoria',
      emoji: debt.category?.emoji || '📦',
      color: debt.category?.color || '#6B7280',
      totalAmount: 0,
      pendingAmount: 0,
      debtCount: 0,
    };

    existing.debtCount += 1;
    for (const inst of debt.installments) {
      const amount = Number(inst.amount);
      existing.totalAmount += amount;
      if (!inst.isPaid) {
        existing.pendingAmount += amount;
      }
    }
    catMap.set(key, existing);
  }

  return Array.from(catMap.values()).sort(
    (a, b) => b.totalAmount - a.totalAmount,
  );
}

export async function getInvoiceSummaries(
  userId: string,
): Promise<InvoiceSummary[]> {
  const cards = await prisma.creditCard.findMany({
    where: { userId },
    select: { id: true, name: true, dueDay: true, closingDay: true },
  });

  const now = new Date();
  const results: InvoiceSummary[] = [];

  for (const card of cards) {
    const closingDay = card.closingDay || card.dueDay;
    let cycleStart: Date;
    let cycleEnd: Date;

    if (now.getDate() <= closingDay) {
      cycleStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        closingDay + 1,
      );
      cycleEnd = new Date(now.getFullYear(), now.getMonth(), closingDay);
    } else {
      cycleStart = new Date(now.getFullYear(), now.getMonth(), closingDay + 1);
      cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, closingDay);
    }

    const installments = await prisma.installment.findMany({
      where: {
        debt: { userId, cardId: card.id },
        dueDate: { gte: cycleStart, lte: cycleEnd },
      },
      select: { amount: true, debtId: true },
    });

    const uniqueDebts = new Set(installments.map((i) => i.debtId));
    const total = installments.reduce((sum, i) => sum + Number(i.amount), 0);

    results.push({
      cardId: card.id,
      cardName: card.name,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      currentInvoiceTotal: total,
      installmentCount: installments.length,
      debtCount: uniqueDebts.size,
    });
  }

  return results.sort((a, b) => b.currentInvoiceTotal - a.currentInvoiceTotal);
}

export async function getMonthlyProjection(
  userId: string,
  months = 12,
): Promise<MonthlyProjection[]> {
  const now = new Date();
  const projections: MonthlyProjection[] = [];
  let cumulative = 0;

  for (let i = 0; i < months; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;

    const pendingAgg = await prisma.installment.aggregate({
      where: {
        debt: { userId, isArchived: false },
        isPaid: false,
        dueDate: { gte: targetDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const pending = Number(pendingAgg._sum.amount ?? 0);
    cumulative += pending;

    projections.push({ month: key, pending, cumulative });
  }

  return projections;
}

export async function getDashboardSummaryForPeriod(
  userId: string,
  year: number,
  month: number,
): Promise<{
  totalPending: number;
  totalPaid: number;
  installmentCount: number;
}> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const [paidAgg, pendingAgg] = await Promise.all([
    prisma.installment.aggregate({
      where: {
        debt: { userId },
        isPaid: true,
        dueDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.installment.aggregate({
      where: {
        debt: { userId },
        isPaid: false,
        dueDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    totalPaid: Number(paidAgg._sum.amount ?? 0),
    totalPending: Number(pendingAgg._sum.amount ?? 0),
    installmentCount: paidAgg._count + pendingAgg._count,
  };
}
