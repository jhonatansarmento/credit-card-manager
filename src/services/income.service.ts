import prisma from '@/lib/db';
import type { IncomeType } from '@prisma/client';

/* ── Types ─────────────────────────────────────────────────── */

export interface IncomePayload {
  name: string;
  description?: string | null;
  amount: number;
  incomeType: IncomeType;
  isRecurring: boolean;
  receiveDay?: number | null;
  startDate?: string;
  endDate?: string;
}

export interface IncomeFilters {
  incomeType?: IncomeType;
  isArchived?: boolean;
}

export interface IncomesSummary {
  receivedThisMonth: number;
  expectedThisMonth: number;
  activeIncomes: number;
}

export interface MonthlyCashFlow {
  month: string; // "2026-01"
  income: number;
  expense: number;
  balance: number;
  isFuture: boolean;
}

/* ── Helpers ───────────────────────────────────────────────── */

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/* ── Ensure Entries (rolling generation) ───────────────────── */

/**
 * For recurring incomes, generate IncomeEntry records from startDate
 * up to min(endDate, now + 3 months). Idempotent via unique constraint.
 */
export async function ensureEntries(incomeId: string) {
  const income = await prisma.income.findUnique({
    where: { id: incomeId },
    select: {
      isRecurring: true,
      startDate: true,
      endDate: true,
      amount: true,
      isArchived: true,
    },
  });

  if (!income || !income.isRecurring || income.isArchived) return;

  const now = new Date();
  const start = startOfMonth(income.startDate);
  const limit = addMonths(now, 4); // current + 3 months ahead
  const end = income.endDate
    ? new Date(
        Math.min(startOfMonth(income.endDate).getTime(), limit.getTime()),
      )
    : limit;

  // Get existing entries
  const existing = await prisma.incomeEntry.findMany({
    where: { incomeId },
    select: { referenceMonth: true },
  });

  const existingSet = new Set(
    existing.map((e) => e.referenceMonth.toISOString()),
  );

  // Build missing entries
  const toCreate: {
    incomeId: string;
    referenceMonth: Date;
    amount: typeof income.amount;
  }[] = [];

  let cursor = new Date(start);
  while (cursor < end) {
    if (!existingSet.has(cursor.toISOString())) {
      toCreate.push({
        incomeId,
        referenceMonth: new Date(cursor),
        amount: income.amount,
      });
    }
    cursor = addMonths(cursor, 1);
  }

  if (toCreate.length > 0) {
    await prisma.incomeEntry.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }
}

/* ── CRUD ──────────────────────────────────────────────────── */

export async function listIncomes(userId: string, filters?: IncomeFilters) {
  const where: Record<string, unknown> = { userId };

  if (filters?.incomeType) {
    where.incomeType = filters.incomeType;
  }
  where.isArchived = filters?.isArchived ?? false;

  const incomes = await prisma.income.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { entries: true } },
      entries: {
        orderBy: { referenceMonth: 'desc' },
        take: 1,
        select: { isReceived: true, referenceMonth: true },
      },
    },
  });

  // Ensure entries for recurring incomes
  for (const income of incomes) {
    if (income.isRecurring) {
      await ensureEntries(income.id);
    }
  }

  // Re-fetch with updated entries if any recurring
  const hasRecurring = incomes.some((i) => i.isRecurring);
  if (hasRecurring) {
    return prisma.income.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { entries: true } },
        entries: {
          orderBy: { referenceMonth: 'desc' },
          select: {
            id: true,
            referenceMonth: true,
            amount: true,
            isReceived: true,
            receivedAt: true,
          },
        },
      },
    });
  }

  // Re-fetch to include all entries for non-recurring too
  return prisma.income.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { entries: true } },
      entries: {
        orderBy: { referenceMonth: 'desc' },
        select: {
          id: true,
          referenceMonth: true,
          amount: true,
          isReceived: true,
          receivedAt: true,
        },
      },
    },
  });
}

export async function getIncome(id: string, userId: string) {
  const income = await prisma.income.findUnique({
    where: { id, userId },
    include: {
      entries: {
        orderBy: { referenceMonth: 'desc' },
        select: {
          id: true,
          referenceMonth: true,
          amount: true,
          isReceived: true,
          receivedAt: true,
        },
      },
    },
  });

  if (income?.isRecurring) {
    await ensureEntries(income.id);
    // Re-fetch with generated entries
    return prisma.income.findUnique({
      where: { id, userId },
      include: {
        entries: {
          orderBy: { referenceMonth: 'desc' },
          select: {
            id: true,
            referenceMonth: true,
            amount: true,
            isReceived: true,
            receivedAt: true,
          },
        },
      },
    });
  }

  return income;
}

export async function createIncome(userId: string, data: IncomePayload) {
  if (!data.name) {
    throw new Error('O nome é obrigatório.');
  }

  const now = new Date();
  const startDate = data.startDate ? parseDate(data.startDate) : now;
  const endDate = data.endDate ? parseDate(data.endDate) : null;

  try {
    const income = await prisma.income.create({
      data: {
        userId,
        name: data.name,
        description: data.description || null,
        amount: data.amount,
        incomeType: data.incomeType,
        isRecurring: data.isRecurring,
        receiveDay: data.receiveDay ?? null,
        startDate,
        endDate,
      },
    });

    if (data.isRecurring) {
      // Generate entries for recurring income
      await ensureEntries(income.id);
    } else {
      // For one-time income, create a single entry
      const refMonth = startOfMonth(startDate);
      await prisma.incomeEntry.create({
        data: {
          incomeId: income.id,
          referenceMonth: refMonth,
          amount: data.amount,
        },
      });
    }

    return income;
  } catch {
    throw new Error(
      'Falha ao criar provento. Certifique-se de que o nome é único.',
    );
  }
}

export async function updateIncome(
  id: string,
  userId: string,
  data: IncomePayload,
) {
  if (!data.name) {
    throw new Error('O nome é obrigatório.');
  }

  const startDate = data.startDate ? parseDate(data.startDate) : undefined;
  const endDate = data.endDate ? parseDate(data.endDate) : null;

  try {
    const income = await prisma.income.update({
      where: { id, userId },
      data: {
        name: data.name,
        description: data.description || null,
        amount: data.amount,
        incomeType: data.incomeType,
        isRecurring: data.isRecurring,
        receiveDay: data.receiveDay ?? null,
        ...(startDate && { startDate }),
        endDate,
      },
    });

    // Update future unreceived entries with new amount
    await prisma.incomeEntry.updateMany({
      where: {
        incomeId: id,
        isReceived: false,
      },
      data: { amount: data.amount },
    });

    // Ensure entries exist if recurring
    if (data.isRecurring) {
      await ensureEntries(income.id);
    }

    return income;
  } catch {
    throw new Error(
      'Falha ao atualizar provento. Certifique-se de que o nome é único.',
    );
  }
}

export async function deleteIncome(id: string, userId: string) {
  // Cascade deletes entries automatically
  await prisma.income.delete({
    where: { id, userId },
  });
}

export async function archiveIncome(id: string, userId: string) {
  return prisma.income.update({
    where: { id, userId },
    data: { isArchived: true },
  });
}

/* ── Toggle Entry Received ─────────────────────────────────── */

export async function toggleEntryReceived(entryId: string, userId: string) {
  // Verify ownership through income → user relation
  const entry = await prisma.incomeEntry.findUnique({
    where: { id: entryId },
    include: { income: { select: { userId: true } } },
  });

  if (!entry || entry.income.userId !== userId) {
    throw new Error('Lançamento não encontrado.');
  }

  return prisma.incomeEntry.update({
    where: { id: entryId },
    data: {
      isReceived: !entry.isReceived,
      receivedAt: entry.isReceived ? null : new Date(),
    },
  });
}

/* ── Dashboard / Summary ───────────────────────────────────── */

export async function getIncomesSummary(
  userId: string,
): Promise<IncomesSummary> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = addMonths(now, 1);

  const [received, expected, activeCount] = await Promise.all([
    // Total received this month
    prisma.incomeEntry.aggregate({
      where: {
        income: { userId },
        referenceMonth: { gte: monthStart, lt: monthEnd },
        isReceived: true,
      },
      _sum: { amount: true },
    }),
    // Total expected this month (all entries, received or not)
    prisma.incomeEntry.aggregate({
      where: {
        income: { userId },
        referenceMonth: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),
    // Active non-archived incomes
    prisma.income.count({
      where: { userId, isArchived: false },
    }),
  ]);

  return {
    receivedThisMonth: Number(received._sum.amount ?? 0),
    expectedThisMonth: Number(expected._sum.amount ?? 0),
    activeIncomes: activeCount,
  };
}

/* ── Cash Flow ─────────────────────────────────────────────── */

export async function getMonthlyCashFlow(
  userId: string,
  pastMonths: number = 6,
  futureMonths: number = 6,
): Promise<MonthlyCashFlow[]> {
  const now = new Date();
  const currentMonth = startOfMonth(now);
  const start = addMonths(currentMonth, -pastMonths);
  const end = addMonths(currentMonth, futureMonths + 1);

  // Ensure entries exist for all recurring incomes
  const recurringIncomes = await prisma.income.findMany({
    where: { userId, isRecurring: true, isArchived: false },
    select: { id: true },
  });
  for (const inc of recurringIncomes) {
    await ensureEntries(inc.id);
  }

  // Fetch all income entries in range
  const incomeEntries = await prisma.incomeEntry.findMany({
    where: {
      income: { userId },
      referenceMonth: { gte: start, lt: end },
    },
    select: { referenceMonth: true, amount: true, isReceived: true },
  });

  // Fetch all installments (expenses) in range
  const installments = await prisma.installment.findMany({
    where: {
      debt: { userId },
      dueDate: { gte: start, lt: end },
    },
    select: { dueDate: true, amount: true, isPaid: true },
  });

  // Build monthly map
  const monthlyMap = new Map<
    string,
    { income: number; expense: number; isFuture: boolean }
  >();

  let cursor = new Date(start);
  while (cursor < end) {
    const key = formatMonth(cursor);
    monthlyMap.set(key, {
      income: 0,
      expense: 0,
      isFuture: cursor > currentMonth,
    });
    cursor = addMonths(cursor, 1);
  }

  // Aggregate income
  for (const entry of incomeEntries) {
    const key = formatMonth(entry.referenceMonth);
    const m = monthlyMap.get(key);
    if (m) {
      m.income += Number(entry.amount);
    }
  }

  // Aggregate expenses
  for (const inst of installments) {
    const key = formatMonth(inst.dueDate);
    const m = monthlyMap.get(key);
    if (m) {
      m.expense += Number(inst.amount);
    }
  }

  // For future months without income entries, project from recurring incomes
  const activeRecurring = await prisma.income.findMany({
    where: { userId, isRecurring: true, isArchived: false },
    select: { amount: true, startDate: true, endDate: true },
  });

  for (const [key, data] of monthlyMap) {
    if (data.isFuture && data.income === 0) {
      // Calculate projected income from recurring sources
      const [yearStr, monthStr] = key.split('-');
      const monthDate = new Date(Number(yearStr), Number(monthStr) - 1, 1);

      for (const inc of activeRecurring) {
        const incStart = startOfMonth(inc.startDate);
        const incEnd = inc.endDate ? startOfMonth(inc.endDate) : null;

        if (monthDate >= incStart && (!incEnd || monthDate <= incEnd)) {
          data.income += Number(inc.amount);
        }
      }
    }
  }

  // Convert to array with running balance
  const result: MonthlyCashFlow[] = [];
  for (const [month, data] of monthlyMap) {
    result.push({
      month,
      income: Math.round(data.income * 100) / 100,
      expense: Math.round(data.expense * 100) / 100,
      balance: Math.round((data.income - data.expense) * 100) / 100,
      isFuture: data.isFuture,
    });
  }

  return result.sort((a, b) => a.month.localeCompare(b.month));
}
