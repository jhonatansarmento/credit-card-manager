import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { debtSchema } from '@/lib/schemas';
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

  const parsed = await parseBody(request, debtSchema);
  if (!parsed.success) return parsed.response;

  try {
    const debt = await createDebt(session.userId, parsed.data);
    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    return serverError(error, 'POST /api/debts');
  }
}
