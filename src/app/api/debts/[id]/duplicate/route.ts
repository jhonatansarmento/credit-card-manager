import {
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { duplicateDebt } from '@/services/debt.service';
import { NextResponse } from 'next/server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  try {
    const debt = await duplicateDebt(id, session.userId);
    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    return serverError(error, 'POST /api/debts/[id]/duplicate');
  }
}
