'use server';

import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Função auxiliar para calcular o valor da parcela e gerar as parcelas
async function generateDebtAndInstallments(
  userId: string,
  cardId: string,
  personCompanyId: string,
  totalAmount: number,
  installmentsQuantity: number,
  startDate: Date,
  description: string,
  debtId?: string // Para atualização
) {
  const installmentValue = Number.parseFloat(
    (totalAmount / installmentsQuantity).toFixed(2)
  );

  const installmentsData = [];
  for (let i = 0; i < installmentsQuantity; i++) {
    const installmentDate = new Date(startDate);
    installmentDate.setMonth(startDate.getMonth() + i);
    // Define o dia de vencimento da parcela com base no dia de vencimento do cartão
    const creditCard = await prisma.creditCard.findUnique({
      where: { id: cardId, userId },
      select: { dueDay: true },
    });
    if (!creditCard) {
      throw new Error('Cartão de crédito não encontrado.');
    }
    installmentDate.setDate(creditCard.dueDay);
    // Lida com casos em que o dueDay é maior que os dias do mês (ex: 30 de fevereiro)
    if (installmentDate.getDate() !== creditCard.dueDay) {
      installmentDate.setDate(0); // Define para o último dia do mês anterior, depois adiciona 1 mês
      installmentDate.setMonth(installmentDate.getMonth() + 1);
    }

    installmentsData.push({
      installmentNumber: i + 1,
      dueDate: installmentDate,
      amount: installmentValue,
      isPaid: false,
    });
  }

  if (debtId) {
    // Atualiza dívida existente
    return prisma.debt.update({
      where: { id: debtId, userId },
      data: {
        cardId,
        personCompanyId,
        totalAmount,
        installmentsQuantity,
        installmentValue,
        startDate,
        description,
        installments: {
          // Exclui parcelas existentes e cria novas
          deleteMany: {},
          createMany: {
            data: installmentsData,
          },
        },
      },
    });
  } else {
    // Cria nova dívida
    return prisma.debt.create({
      data: {
        userId,
        cardId,
        personCompanyId,
        totalAmount,
        installmentsQuantity,
        installmentValue,
        startDate,
        description,
        installments: {
          createMany: {
            data: installmentsData,
          },
        },
      },
    });
  }
}

export async function createDebt(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const cardId = formData.get('cardId') as string;
  const personCompanyId = formData.get('personCompanyId') as string;
  const totalAmount = Number.parseFloat(formData.get('totalAmount') as string);
  const installmentsQuantity = Number.parseInt(
    formData.get('installmentsQuantity') as string
  );
  const description = formData.get('description') as string;
  const startDateString = formData.get('startDate') as string; // YYYY-MM-DD

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
      'O valor total e a quantidade de parcelas devem ser positivos.'
    );
  }

  let startDate = new Date(); // Padrão para o mês atual
  if (startDateString) {
    startDate = new Date(startDateString + 'T00:00:00Z'); // Usa Z para garantir UTC e evitar problemas de fuso horário
    if (isNaN(startDate.getTime())) {
      throw new Error('Data de início inválida.');
    }
  } else {
    // Se nenhuma data de início, define para o primeiro dia do mês atual
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  try {
    await generateDebtAndInstallments(
      userId,
      cardId,
      personCompanyId,
      totalAmount,
      installmentsQuantity,
      startDate,
      description
    );
    revalidatePath('/debts');
    redirect('/debts');
  } catch (error) {
    console.error('Failed to create debt:', error);
    throw new Error((error as Error).message || 'Falha ao criar dívida.');
  }
}

export async function updateDebt(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const cardId = formData.get('cardId') as string;
  const personCompanyId = formData.get('personCompanyId') as string;
  const totalAmount = Number.parseFloat(formData.get('totalAmount') as string);
  const installmentsQuantity = Number.parseInt(
    formData.get('installmentsQuantity') as string
  );
  const description = formData.get('description') as string;
  const startDateString = formData.get('startDate') as string;

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
      'O valor total e a quantidade de parcelas devem ser positivos.'
    );
  }

  let startDate = new Date();
  if (startDateString) {
    startDate = new Date(startDateString + 'T00:00:00Z');
    if (isNaN(startDate.getTime())) {
      throw new Error('Data de início inválida.');
    }
  } else {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  try {
    await generateDebtAndInstallments(
      userId,
      cardId,
      personCompanyId,
      totalAmount,
      installmentsQuantity,
      startDate,
      description,
      id // Passa o ID da dívida para atualização
    );
    revalidatePath('/debts');
    redirect('/debts');
  } catch (error) {
    console.error('Failed to update debt:', error);
    throw new Error((error as Error).message || 'Falha ao atualizar dívida.');
  }
}

export async function deleteDebt(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    await prisma.debt.delete({
      where: { id, userId }, // Garante que o usuário é o proprietário da dívida
    });
    revalidatePath('/debts');
  } catch (error) {
    console.error('Failed to delete debt:', error);
    throw new Error('Falha ao excluir dívida.');
  }
}

export async function toggleInstallmentPaidStatus(
  installmentId: string,
  isPaid: boolean
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Verifica se o usuário é o proprietário da dívida associada à parcela
    const installment = await prisma.installment.findUnique({
      where: { id: installmentId },
      include: {
        debt: {
          select: { userId: true },
        },
      },
    });

    if (!installment || installment.debt.userId !== userId) {
      throw new Error('Parcela não encontrada ou você não tem permissão.');
    }

    await prisma.installment.update({
      where: { id: installmentId },
      data: { isPaid: !isPaid }, // Inverte o status
    });
    revalidatePath('/debts'); // Revalida para mostrar o status atualizado
  } catch (error) {
    console.error('Failed to toggle installment status:', error);
    throw new Error('Falha ao atualizar o status da parcela.');
  }
}
