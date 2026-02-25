'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// TODO: Substituir por autenticação real
const getUserId = () => 'temp-user-id';

export async function createCreditCard(formData: FormData) {
  const userId = getUserId();

  const name = formData.get('name') as string;
  const dueDay = Number.parseInt(formData.get('dueDay') as string);

  if (!name || !dueDay) {
    throw new Error('Name and Due Day are required.');
  }
  if (dueDay < 1 || dueDay > 31) {
    throw new Error('Due Day must be between 1 and 31.');
  }

  try {
    await prisma.creditCard.create({
      data: {
        userId,
        name,
        dueDay,
      },
    });
    revalidatePath('/cards');
    redirect('/cards');
  } catch (error) {
    console.error('Failed to create credit card:', error);
    throw new Error(
      'Failed to create credit card. Make sure the name is unique.',
    );
  }
}

export async function updateCreditCard(id: string, formData: FormData) {
  const userId = getUserId();

  const name = formData.get('name') as string;
  const dueDay = Number.parseInt(formData.get('dueDay') as string);

  if (!name || !dueDay) {
    throw new Error('Name and Due Day are required.');
  }
  if (dueDay < 1 || dueDay > 31) {
    throw new Error('Due Day must be between 1 and 31.');
  }

  try {
    await prisma.creditCard.update({
      where: { id, userId }, // Garante que o usuário é o proprietário do cartão
      data: {
        name,
        dueDay,
      },
    });
    revalidatePath('/cards');
    redirect('/cards');
  } catch (error) {
    console.error('Failed to update credit card:', error);
    throw new Error(
      'Failed to update credit card. Make sure the name is unique.',
    );
  }
}

export async function deleteCreditCard(id: string) {
  const userId = getUserId();

  try {
    // Verifica se há dívidas associadas a este cartão
    const associatedDebts = await prisma.debt.count({
      where: { cardId: id, userId },
    });

    if (associatedDebts > 0) {
      throw new Error(
        'Não é possível excluir o cartão: Ele possui dívidas associadas. Por favor, exclua as dívidas primeiro.',
      );
    }

    await prisma.creditCard.delete({
      where: { id, userId }, // Garante que o usuário é o proprietário do cartão
    });
    revalidatePath('/cards');
  } catch (error) {
    console.error('Failed to delete credit card:', error);
    if (error instanceof Error && error.message.includes('associadas')) {
      throw error;
    }
    throw new Error('Falha ao excluir o cartão de crédito.');
  }
}
