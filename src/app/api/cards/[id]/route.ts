import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { creditCardSchema } from '@/lib/schemas';
import {
  deleteCreditCard,
  updateCreditCard,
} from '@/services/credit-card.service';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const parsed = await parseBody(request, creditCardSchema);
  if (!parsed.success) return parsed.response;

  try {
    const card = await updateCreditCard(id, session.userId, parsed.data);
    return NextResponse.json(card);
  } catch (error) {
    return serverError(error, 'PUT /api/cards/[id]');
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
    await deleteCreditCard(id, session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error, 'DELETE /api/cards/[id]');
  }
}
