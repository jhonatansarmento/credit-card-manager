import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { incomeSchema } from '@/lib/schemas';
import { deleteIncome, updateIncome } from '@/services/income.service';
import type { IncomeType } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const parsed = await parseBody(request, incomeSchema);
  if (!parsed.success) return parsed.response;

  try {
    const income = await updateIncome(id, session.userId, {
      ...parsed.data,
      incomeType: parsed.data.incomeType as IncomeType,
    });
    return NextResponse.json(income);
  } catch (error) {
    return serverError(error, 'PUT /api/incomes/[id]');
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
    await deleteIncome(id, session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error, 'DELETE /api/incomes/[id]');
  }
}
