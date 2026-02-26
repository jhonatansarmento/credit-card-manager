import prisma from '@/lib/db';

export async function listCreditCards(userId: string) {
  return prisma.creditCard.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

export async function getCreditCard(id: string, userId: string) {
  return prisma.creditCard.findUnique({
    where: { id, userId },
  });
}

export async function createCreditCard(
  userId: string,
  data: { name: string; dueDay: number },
) {
  if (!data.name || !data.dueDay) {
    throw new Error('Nome e dia de vencimento são obrigatórios.');
  }
  if (data.dueDay < 1 || data.dueDay > 31) {
    throw new Error('O dia de vencimento deve ser entre 1 e 31.');
  }

  try {
    return await prisma.creditCard.create({
      data: { userId, name: data.name, dueDay: data.dueDay },
    });
  } catch {
    throw new Error(
      'Falha ao criar cartão. Certifique-se de que o nome é único.',
    );
  }
}

export async function updateCreditCard(
  id: string,
  userId: string,
  data: { name: string; dueDay: number },
) {
  if (!data.name || !data.dueDay) {
    throw new Error('Nome e dia de vencimento são obrigatórios.');
  }
  if (data.dueDay < 1 || data.dueDay > 31) {
    throw new Error('O dia de vencimento deve ser entre 1 e 31.');
  }

  try {
    return await prisma.creditCard.update({
      where: { id, userId },
      data: { name: data.name, dueDay: data.dueDay },
    });
  } catch {
    throw new Error(
      'Falha ao atualizar cartão. Certifique-se de que o nome é único.',
    );
  }
}

export async function deleteCreditCard(id: string, userId: string) {
  const associatedDebts = await prisma.debt.count({
    where: { cardId: id, userId },
  });

  if (associatedDebts > 0) {
    throw new Error(
      'Não é possível excluir o cartão: ele possui dívidas associadas. Por favor, exclua as dívidas primeiro.',
    );
  }

  try {
    await prisma.creditCard.delete({ where: { id, userId } });
  } catch {
    throw new Error('Falha ao excluir o cartão de crédito.');
  }
}
