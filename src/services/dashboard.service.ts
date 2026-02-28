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
