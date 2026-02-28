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
  const associatedDebts = await prisma.debt.count({
    where: { personCompanyId: id, userId },
  });

  if (associatedDebts > 0) {
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
