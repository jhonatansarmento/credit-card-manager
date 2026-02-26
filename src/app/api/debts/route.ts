import {
  badRequest,
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { createDebt, listDebts } from '@/services/debt.service';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { searchParams } = request.nextUrl;
  const filters = {
    cardId: searchParams.get('cardId') ?? undefined,
    personCompanyId: searchParams.get('personCompanyId') ?? undefined,
    month: searchParams.get('month') ?? undefined,
    year: searchParams.get('year') ?? undefined,
  };

  const debts = await listDebts(session.userId, filters);
  return NextResponse.json(debts);
}

export async function POST(request: Request) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

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
    const debt = await createDebt(session.userId, {
      cardId,
      personCompanyId,
      totalAmount: Number(totalAmount),
      installmentsQuantity: Number(installmentsQuantity),
      startDate: startDate ?? '',
      description,
    });
    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    return serverError((error as Error).message);
  }
}
