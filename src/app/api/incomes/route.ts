import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { incomeSchema } from '@/lib/schemas';
import { createIncome, listIncomes } from '@/services/income.service';
import type { IncomeType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const searchParams = request.nextUrl.searchParams;
  const incomeType = searchParams.get('incomeType') as IncomeType | null;
  const isArchived = searchParams.get('isArchived') === 'true';

  const incomes = await listIncomes(session.userId, {
    ...(incomeType && { incomeType }),
    isArchived,
  });

  return NextResponse.json(incomes);
}

export async function POST(request: Request) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const parsed = await parseBody(request, incomeSchema);
  if (!parsed.success) return parsed.response;

  try {
    const income = await createIncome(session.userId, {
      ...parsed.data,
      incomeType: parsed.data.incomeType as IncomeType,
    });
    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    return serverError(error, 'POST /api/incomes');
  }
}
