import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { debtSchema } from '@/lib/schemas';
import { deleteDebt, updateDebt } from '@/services/debt.service';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const parsed = await parseBody(request, debtSchema);
  if (!parsed.success) return parsed.response;

  try {
    const debt = await updateDebt(id, session.userId, parsed.data);
    return NextResponse.json(debt);
  } catch (error) {
    return serverError(error, 'PUT /api/debts/[id]');
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
    return serverError(error, 'DELETE /api/debts/[id]');
  }
}
