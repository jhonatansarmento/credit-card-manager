import prisma from '@/lib/db';

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

  const installmentValue = Number.parseFloat(
    (totalAmount / installmentsQuantity).toFixed(2),
  );

  return {
    installmentValue,
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

      return {
        installmentNumber: i + 1,
        dueDate: new Date(Date.UTC(targetYear, targetMonth, day)),
        amount: installmentValue,
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

export async function listDebts(userId: string, filters: DebtFilters = {}) {
  const { cardId, personCompanyId, month, year } = filters;
  const whereClause: Record<string, unknown> = { userId };

  if (cardId) whereClause.cardId = cardId;
  if (personCompanyId) whereClause.personCompanyId = personCompanyId;

  if (month && year) {
    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0);

    const debtsWithInstallments = await prisma.debt.findMany({
      where: {
        userId,
        ...whereClause,
        installments: {
          some: { dueDate: { gte: startOfMonth, lte: endOfMonth } },
        },
      },
      select: { id: true },
    });

    whereClause.id = { in: debtsWithInstallments.map((d) => d.id) };
  }

  return prisma.debt.findMany({
    where: whereClause,
    include: {
      creditCard: true,
      personCompany: true,
      installments: { orderBy: { installmentNumber: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
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
          createMany: { data: installmentsData },
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
