import prisma from '@/lib/db';

export async function listNames(userId: string) {
  return prisma.personCompany.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { debts: true } },
      debts: {
        select: {
          installments: {
            where: { isPaid: false },
            select: { amount: true },
          },
        },
      },
    },
  });
}

export async function getName(id: string, userId: string) {
  return prisma.personCompany.findUnique({
    where: { id, userId },
  });
}

export async function getNameDetail(id: string, userId: string) {
  const person = await prisma.personCompany.findUnique({
    where: { id, userId },
  });

  if (!person) return null;

  // Get all debts where this person participates (via DebtParticipant)
  const participations = await prisma.debtParticipant.findMany({
    where: {
      personCompanyId: id,
      debt: { userId },
    },
    include: {
      debt: {
        include: {
          creditCard: true,
          category: true,
          asset: true,
          installments: { orderBy: { installmentNumber: 'asc' } },
          participants: {
            include: { personCompany: true },
            orderBy: { amount: 'desc' },
          },
        },
      },
    },
  });

  // Also get legacy debts (personCompanyId directly on Debt, no DebtParticipant)
  const participatedDebtIds = participations.map((p) => p.debt.id);
  const legacyDebts = await prisma.debt.findMany({
    where: {
      userId,
      personCompanyId: id,
      id: { notIn: participatedDebtIds },
    },
    include: {
      creditCard: true,
      category: true,
      asset: true,
      installments: { orderBy: { installmentNumber: 'asc' } },
      participants: {
        include: { personCompany: true },
        orderBy: { amount: 'desc' },
      },
    },
  });

  const allDebts = [
    ...participations.map((p) => ({
      ...p.debt,
      participantAmount: Number(p.amount),
    })),
    ...legacyDebts.map((d) => ({
      ...d,
      participantAmount: Number(d.totalAmount),
    })),
  ];

  return { person, debts: allDebts };
}

export async function createName(userId: string, data: { name: string }) {
  if (!data.name) {
    throw new Error('Nome é obrigatório.');
  }

  try {
    return await prisma.personCompany.create({
      data: { userId, name: data.name },
    });
  } catch {
    throw new Error(
      'Falha ao criar nome. Certifique-se de que o nome é único.',
    );
  }
}

export async function updateName(
  id: string,
  userId: string,
  data: { name: string },
) {
  if (!data.name) {
    throw new Error('Nome é obrigatório.');
  }

  try {
    return await prisma.personCompany.update({
      where: { id, userId },
      data: { name: data.name },
    });
  } catch {
    throw new Error(
      'Falha ao atualizar nome. Certifique-se de que o nome é único.',
    );
  }
}

export async function deleteName(id: string, userId: string) {
  // Check both legacy personCompanyId on Debt and new DebtParticipant model
  const [associatedDebts, associatedParticipations] = await Promise.all([
    prisma.debt.count({
      where: { personCompanyId: id, userId },
    }),
    prisma.debtParticipant.count({
      where: {
        personCompanyId: id,
        debt: { userId },
      },
    }),
  ]);

  if (associatedDebts > 0 || associatedParticipations > 0) {
    throw new Error(
      'Não é possível excluir: este nome possui dívidas associadas. Por favor, exclua as dívidas primeiro.',
    );
  }

  try {
    await prisma.personCompany.delete({ where: { id, userId } });
  } catch {
    throw new Error('Falha ao excluir pessoa/empresa.');
  }
}
