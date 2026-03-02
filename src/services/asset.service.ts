import prisma from '@/lib/db';

export async function listAssets(userId: string) {
  return prisma.asset.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { debts: true } },
      debts: {
        select: {
          totalAmount: true,
          installments: {
            select: { amount: true, isPaid: true },
          },
        },
      },
    },
  });
}

export async function getAsset(id: string, userId: string) {
  return prisma.asset.findUnique({
    where: { id, userId },
  });
}

export async function getAssetDetail(id: string, userId: string) {
  return prisma.asset.findUnique({
    where: { id, userId },
    include: {
      debts: {
        include: {
          creditCard: true,
          personCompany: true,
          category: true,
          installments: { orderBy: { installmentNumber: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function createAsset(
  userId: string,
  data: { name: string; emoji?: string; description?: string | null },
) {
  if (!data.name) {
    throw new Error('O nome é obrigatório.');
  }

  try {
    return await prisma.asset.create({
      data: {
        userId,
        name: data.name,
        emoji: data.emoji || '📦',
        description: data.description || null,
      },
    });
  } catch {
    throw new Error(
      'Falha ao criar bem/ativo. Certifique-se de que o nome é único.',
    );
  }
}

export async function updateAsset(
  id: string,
  userId: string,
  data: { name: string; emoji?: string; description?: string | null },
) {
  if (!data.name) {
    throw new Error('O nome é obrigatório.');
  }

  try {
    return await prisma.asset.update({
      where: { id, userId },
      data: {
        name: data.name,
        emoji: data.emoji || '📦',
        description: data.description || null,
      },
    });
  } catch {
    throw new Error(
      'Falha ao atualizar bem/ativo. Certifique-se de que o nome é único.',
    );
  }
}

export async function deleteAsset(id: string, userId: string) {
  // Check for associated debts
  const associatedDebts = await prisma.debt.count({
    where: { assetId: id, userId },
  });

  if (associatedDebts > 0) {
    throw new Error(
      'Não é possível excluir o bem/ativo: ele possui dívidas associadas. Remova a associação das dívidas primeiro.',
    );
  }

  try {
    await prisma.asset.delete({ where: { id, userId } });
  } catch {
    throw new Error('Falha ao excluir o bem/ativo.');
  }
}
