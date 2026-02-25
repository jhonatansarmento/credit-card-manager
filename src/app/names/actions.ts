'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// TODO: Substituir por autenticação real
const getUserId = () => 'temp-user-id';

export async function createPersonCompany(formData: FormData) {
  const userId = getUserId();
  const name = formData.get('name') as string;

  if (!name) {
    throw new Error('Name is required.');
  }

  try {
    await prisma.personCompany.create({
      data: {
        userId,
        name,
      },
    });
    revalidatePath('/names');
    redirect('/names');
  } catch (error) {
    console.error('Failed to create person/company:', error);
    throw new Error(
      'Failed to create person/company. Make sure the name is unique.',
    );
  }
}

export async function updatePersonCompany(id: string, formData: FormData) {
  const userId = getUserId();
  const name = formData.get('name') as string;

  if (!name) {
    throw new Error('Name is required.');
  }

  try {
    await prisma.personCompany.update({
      where: { id, userId }, // Garante que o usuário é o proprietário do registro
      data: {
        name,
      },
    });
    revalidatePath('/names');
    redirect('/names');
  } catch (error) {
    console.error('Failed to update person/company:', error);
    throw new Error(
      'Failed to update person/company. Make sure the name is unique.',
    );
  }
}

export async function deletePersonCompany(id: string) {
  const userId = getUserId();
  try {
    // Verifica se há dívidas associadas a esta pessoa/empresa
    const associatedDebts = await prisma.debt.count({
      where: { personCompanyId: id, userId },
    });

    if (associatedDebts > 0) {
      throw new Error(
        'Não é possível excluir o nome: Ele possui dívidas associadas. Por favor, exclua as dívidas primeiro.',
      );
    }

    await prisma.personCompany.delete({
      where: { id, userId }, // Garante que o usuário é o proprietário do registro
    });
    revalidatePath('/names');
  } catch (error) {
    console.error('Failed to delete person/company:', error);
    if (error instanceof Error && error.message.includes('associadas')) {
      throw error;
    }
    throw new Error('Falha ao excluir pessoa/empresa.');
  }
}
