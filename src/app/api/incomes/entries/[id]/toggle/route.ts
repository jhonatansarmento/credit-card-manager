import {
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { toggleEntryReceived } from '@/services/income.service';
import { NextResponse } from 'next/server';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  try {
    const entry = await toggleEntryReceived(id, session.userId);
    return NextResponse.json(entry);
  } catch (error) {
    return serverError(error, 'PATCH /api/incomes/entries/[id]/toggle');
  }
}
