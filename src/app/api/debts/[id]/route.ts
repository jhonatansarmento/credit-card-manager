import {
  badRequest,
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { deleteDebt, updateDebt } from '@/services/debt.service';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  let body: {
    cardId?: string;
    personCompanyId?: string;
    totalAmount?: number;
    installmentsQuantity?: number;
    startDate?: string;
    description?: string;
  };
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const {
    cardId,
    personCompanyId,
    totalAmount,
    installmentsQuantity,
    startDate,
    description,
  } = body;

  if (
    !cardId ||
    !personCompanyId ||
    totalAmount === undefined ||
    installmentsQuantity === undefined ||
    !description
  ) {
    return badRequest('Todos os campos são obrigatórios.');
  }

  try {
    const debt = await updateDebt(id, session.userId, {
      cardId,
      personCompanyId,
      totalAmount: Number(totalAmount),
      installmentsQuantity: Number(installmentsQuantity),
      startDate: startDate ?? '',
      description,
    });
    return NextResponse.json(debt);
  } catch (error) {
    return serverError((error as Error).message);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  try {
    await deleteDebt(id, session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError((error as Error).message);
  }
}
