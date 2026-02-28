import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface DebtPayload {
  cardId: string;
  personCompanyId: string;
  totalAmount: number;
  installmentsQuantity: number;
  startDate: string; // YYYY-MM-DD
  description: string;
}

export interface DebtFilters {
  cardId?: string;
  personCompanyId?: string;
  month?: string;
  year?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
  showArchived?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function buildInstallments(
  userId: string,
  cardId: string,
  totalAmount: number,
  installmentsQuantity: number,
  startDate: Date,
) {
  const creditCard = await prisma.creditCard.findUnique({
    where: { id: cardId, userId },
    select: { dueDay: true },
  });

  if (!creditCard) {
    throw new Error('Cartão de crédito não encontrado.');
  }

  const baseInstallmentValue = Number.parseFloat(
    (totalAmount / installmentsQuantity).toFixed(2),
  );

  // 7.1 — Last installment absorbs rounding remainder
  const sumOfBase = Number.parseFloat(
    (baseInstallmentValue * (installmentsQuantity - 1)).toFixed(2),
  );
  const lastInstallmentValue = Number.parseFloat(
    (totalAmount - sumOfBase).toFixed(2),
  );

  return {
    installmentValue: baseInstallmentValue,
    installmentsData: Array.from({ length: installmentsQuantity }, (_, i) => {
      const startYear = startDate.getUTCFullYear();
      const startMonth = startDate.getUTCMonth();

      const rawMonth = startMonth + i;
      const targetYear = startYear + Math.floor(rawMonth / 12);
      const targetMonth = rawMonth % 12;

      const daysInMonth = new Date(
        Date.UTC(targetYear, targetMonth + 1, 0),
      ).getUTCDate();
      const day = Math.min(creditCard.dueDay, daysInMonth);

      const isLast = i === installmentsQuantity - 1;

      return {
        installmentNumber: i + 1,
        dueDate: new Date(Date.UTC(targetYear, targetMonth, day)),
        amount: isLast ? lastInstallmentValue : baseInstallmentValue,
        isPaid: false,
      };
    }),
  };
}

function parseStartDate(startDateString: string): Date {
  if (startDateString) {
    const date = new Date(startDateString + 'T00:00:00Z');
    if (isNaN(date.getTime())) throw new Error('Data de início inválida.');
    return date;
  }
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function validateDebtPayload(payload: DebtPayload) {
  const {
    cardId,
    personCompanyId,
    totalAmount,
    installmentsQuantity,
    description,
  } = payload;

  if (
    !cardId ||
    !personCompanyId ||
    isNaN(totalAmount) ||
    isNaN(installmentsQuantity) ||
    !description
  ) {
    throw new Error('Todos os campos são obrigatórios.');
  }
  if (totalAmount <= 0 || installmentsQuantity <= 0) {
    throw new Error(
      'O valor total e a quantidade de parcelas devem ser positivos.',
    );
  }
}

export async function getDebt(id: string, userId: string) {
  return prisma.debt.findUnique({
    where: { id, userId },
  });
}

export async function listDebts(
  userId: string,
  filters: DebtFilters = {},
): Promise<PaginatedResult<Awaited<ReturnType<typeof findDebts>>[number]>> {
  const {
    cardId,
    personCompanyId,
    month,
    year,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    pageSize = 10,
    showArchived = false,
  } = filters;

  const whereClause: Prisma.DebtWhereInput = {
    userId,
    isArchived: showArchived ? undefined : false,
  };

  if (cardId) whereClause.cardId = cardId;
  if (personCompanyId) whereClause.personCompanyId = personCompanyId;

  // 6.4 — Search by description
  if (search) {
    whereClause.description = { contains: search, mode: 'insensitive' };
  }

  if (month || year) {
    const parsedYear = year ? parseInt(year) : undefined;
    const parsedMonth = month ? parseInt(month) : undefined;

    let startDate: Date;
    let endDate: Date;

    if (parsedYear && parsedMonth) {
      startDate = new Date(parsedYear, parsedMonth - 1, 1);
      endDate = new Date(parsedYear, parsedMonth, 0);
    } else if (parsedYear) {
      startDate = new Date(parsedYear, 0, 1);
      endDate = new Date(parsedYear, 11, 31);
    } else {
      const currentYear = new Date().getFullYear();
      startDate = new Date(currentYear, parsedMonth! - 1, 1);
      endDate = new Date(currentYear, parsedMonth!, 0);
    }

    const debtsWithInstallments = await prisma.debt.findMany({
      where: {
        ...whereClause,
        installments: {
          some: { dueDate: { gte: startDate, lte: endDate } },
        },
      },
      select: { id: true },
    });

    whereClause.id = { in: debtsWithInstallments.map((d) => d.id) };
  }

  // 6.3 — Sorting
  const allowedSortFields = [
    'createdAt',
    'description',
    'totalAmount',
    'startDate',
    'installmentsQuantity',
  ];
  const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';
  const orderBy = { [orderField]: orderDirection };

  // 6.2 — Pagination
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    findDebts(whereClause, orderBy, skip, pageSize),
    prisma.debt.count({ where: whereClause }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

async function findDebts(
  whereClause: Prisma.DebtWhereInput,
  orderBy: Record<string, string>,
  skip: number,
  take: number,
) {
  return prisma.debt.findMany({
    where: whereClause,
    include: {
      creditCard: true,
      personCompany: true,
      installments: { orderBy: { installmentNumber: 'asc' } },
    },
    orderBy,
    skip,
    take,
  });
}

export async function createDebt(userId: string, payload: DebtPayload) {
  validateDebtPayload(payload);

  const startDate = parseStartDate(payload.startDate);
  const { installmentValue, installmentsData } = await buildInstallments(
    userId,
    payload.cardId,
    payload.totalAmount,
    payload.installmentsQuantity,
    startDate,
  );

  try {
    return await prisma.debt.create({
      data: {
        userId,
        cardId: payload.cardId,
        personCompanyId: payload.personCompanyId,
        totalAmount: payload.totalAmount,
        installmentsQuantity: payload.installmentsQuantity,
        installmentValue,
        startDate,
        description: payload.description,
        installments: { createMany: { data: installmentsData } },
      },
    });
  } catch (error) {
    throw new Error((error as Error).message || 'Falha ao criar dívida.');
  }
}

export async function updateDebt(
  id: string,
  userId: string,
  payload: DebtPayload,
) {
  validateDebtPayload(payload);

  const startDate = parseStartDate(payload.startDate);
  const { installmentValue, installmentsData } = await buildInstallments(
    userId,
    payload.cardId,
    payload.totalAmount,
    payload.installmentsQuantity,
    startDate,
  );

  // Fetch existing installments to preserve isPaid status
  const existingInstallments = await prisma.installment.findMany({
    where: { debtId: id },
    select: { installmentNumber: true, isPaid: true },
  });

  const paidMap = new Map(
    existingInstallments.map((inst) => [inst.installmentNumber, inst.isPaid]),
  );

  // Preserve isPaid for matching installment numbers
  const installmentsWithStatus = installmentsData.map((inst) => ({
    ...inst,
    isPaid: paidMap.get(inst.installmentNumber) ?? false,
  }));

  try {
    return await prisma.debt.update({
      where: { id, userId },
      data: {
        cardId: payload.cardId,
        personCompanyId: payload.personCompanyId,
        totalAmount: payload.totalAmount,
        installmentsQuantity: payload.installmentsQuantity,
        installmentValue,
        startDate,
        description: payload.description,
        installments: {
          deleteMany: {},
          createMany: { data: installmentsWithStatus },
        },
      },
    });
  } catch (error) {
    throw new Error((error as Error).message || 'Falha ao atualizar dívida.');
  }
}

export async function deleteDebt(id: string, userId: string) {
  try {
    await prisma.debt.delete({ where: { id, userId } });
  } catch {
    throw new Error('Falha ao excluir dívida.');
  }
}

export async function toggleInstallmentPaid(
  installmentId: string,
  userId: string,
) {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: { debt: { select: { userId: true } } },
  });

  if (!installment || installment.debt.userId !== userId) {
    throw new Error('Parcela não encontrada ou você não tem permissão.');
  }

  return prisma.installment.update({
    where: { id: installmentId },
    data: { isPaid: !installment.isPaid },
  });
}

// 6.5 — Pay all installments of a debt at once
export async function payAllInstallments(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({
    where: { id: debtId, userId },
    select: { id: true },
  });

  if (!debt) {
    throw new Error('Dívida não encontrada ou você não tem permissão.');
  }

  return prisma.installment.updateMany({
    where: { debtId },
    data: { isPaid: true },
  });
}

// 6.6 — Duplicate a debt (create new with same data, new installments)
export async function duplicateDebt(debtId: string, userId: string) {
  const original = await prisma.debt.findUnique({
    where: { id: debtId, userId },
    include: { creditCard: true },
  });

  if (!original) {
    throw new Error('Dívida não encontrada ou você não tem permissão.');
  }

  const payload: DebtPayload = {
    cardId: original.cardId,
    personCompanyId: original.personCompanyId,
    totalAmount: Number(original.totalAmount),
    installmentsQuantity: original.installmentsQuantity,
    startDate: original.startDate.toISOString().split('T')[0],
    description: `${original.description} (cópia)`,
  };

  return createDebt(userId, payload);
}

// 6.7 — Archive / unarchive debt (soft delete)
export async function archiveDebt(id: string, userId: string) {
  const debt = await prisma.debt.findUnique({
    where: { id, userId },
    select: { id: true, isArchived: true },
  });

  if (!debt) {
    throw new Error('Dívida não encontrada ou você não tem permissão.');
  }

  return prisma.debt.update({
    where: { id, userId },
    data: { isArchived: !debt.isArchived },
  });
}

// 6.1 — Export debts as CSV
export async function exportDebtsCSV(
  userId: string,
  filters: DebtFilters = {},
) {
  const result = await listDebts(userId, {
    ...filters,
    page: 1,
    pageSize: 10000,
  });

  const lines: string[] = [
    'Descrição,Cartão,Pessoa/Empresa,Valor Total,Qtd Parcelas,Valor Parcela,Data Início,Parcela Nº,Vencimento,Valor,Paga',
  ];

  for (const debt of result.data) {
    for (const inst of debt.installments) {
      lines.push(
        [
          `"${debt.description}"`,
          `"${debt.creditCard.name}"`,
          `"${debt.personCompany.name}"`,
          Number(debt.totalAmount).toFixed(2),
          debt.installmentsQuantity,
          Number(debt.installmentValue).toFixed(2),
          debt.startDate.toISOString().split('T')[0],
          inst.installmentNumber,
          inst.dueDate.toISOString().split('T')[0],
          Number(inst.amount).toFixed(2),
          inst.isPaid ? 'Sim' : 'Não',
        ].join(','),
      );
    }
  }

  return lines.join('\n');
}
