import {
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { toggleInstallmentPaid } from '@/services/debt.service';
import { NextResponse } from 'next/server';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  try {
    const installment = await toggleInstallmentPaid(id, session.userId);
    return NextResponse.json(installment);
  } catch (error) {
    return serverError((error as Error).message);
  }
}
