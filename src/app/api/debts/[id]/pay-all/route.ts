import {
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { payAllInstallments } from '@/services/debt.service';
import { NextResponse } from 'next/server';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  try {
    const result = await payAllInstallments(id, session.userId);
    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    return serverError(error, 'PATCH /api/debts/[id]/pay-all');
  }
}
