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
  const debts = await prisma.debt.findMany({
    where: { userId },
    include: {
      installments: {
        select: { isPaid: true, amount: true, dueDate: true },
      },
    },
  });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalPending = 0;
  let totalPaid = 0;
  let totalInstallments = 0;
  let paidInstallments = 0;
  let installmentsDueThisMonth = 0;
  let activeDebts = 0;

  for (const debt of debts) {
    const hasPending = debt.installments.some((i) => !i.isPaid);
    if (hasPending) activeDebts++;

    for (const inst of debt.installments) {
      totalInstallments++;
      const amount = Number(inst.amount);

      if (inst.isPaid) {
        totalPaid += amount;
        paidInstallments++;
      } else {
        totalPending += amount;

        if (
          inst.dueDate.getMonth() === currentMonth &&
          inst.dueDate.getFullYear() === currentYear
        ) {
          installmentsDueThisMonth++;
        }
      }
    }
  }

  const overallPayoffPercent =
    totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

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
  const debts = await prisma.debt.findMany({
    where: { userId },
    include: {
      creditCard: { select: { name: true } },
      installments: { select: { isPaid: true, amount: true } },
    },
  });

  const cardMap = new Map<
    string,
    { totalAmount: number; pendingAmount: number; debtCount: number }
  >();

  for (const debt of debts) {
    const cardName = debt.creditCard.name;
    const existing = cardMap.get(cardName) || {
      totalAmount: 0,
      pendingAmount: 0,
      debtCount: 0,
    };

    existing.debtCount++;
    for (const inst of debt.installments) {
      const amount = Number(inst.amount);
      existing.totalAmount += amount;
      if (!inst.isPaid) existing.pendingAmount += amount;
    }

    cardMap.set(cardName, existing);
  }

  return Array.from(cardMap.entries())
    .map(([cardName, data]) => ({ cardName, ...data }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export async function getSpendingByPerson(
  userId: string,
): Promise<SpendingByPerson[]> {
  const debts = await prisma.debt.findMany({
    where: { userId },
    include: {
      personCompany: { select: { name: true } },
      installments: { select: { isPaid: true, amount: true } },
    },
  });

  const personMap = new Map<
    string,
    { totalAmount: number; pendingAmount: number; debtCount: number }
  >();

  for (const debt of debts) {
    const personName = debt.personCompany.name;
    const existing = personMap.get(personName) || {
      totalAmount: 0,
      pendingAmount: 0,
      debtCount: 0,
    };

    existing.debtCount++;
    for (const inst of debt.installments) {
      const amount = Number(inst.amount);
      existing.totalAmount += amount;
      if (!inst.isPaid) existing.pendingAmount += amount;
    }

    personMap.set(personName, existing);
  }

  return Array.from(personMap.entries())
    .map(([personName, data]) => ({ personName, ...data }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
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
