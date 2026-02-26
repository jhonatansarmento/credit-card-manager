import {
  badRequest,
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
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

  let body: { name?: string; dueDay?: number };
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const { name, dueDay } = body;
  if (!name || !dueDay)
    return badRequest('Nome e dia de vencimento são obrigatórios.');

  try {
    const card = await updateCreditCard(id, session.userId, {
      name,
      dueDay: Number(dueDay),
    });
    return NextResponse.json(card);
  } catch (error) {
    return serverError((error as Error).message);
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
    return serverError((error as Error).message);
  }
}
