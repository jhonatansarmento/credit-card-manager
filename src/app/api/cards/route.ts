import {
  badRequest,
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import {
  createCreditCard,
  listCreditCards,
} from '@/services/credit-card.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const cards = await listCreditCards(session.userId);
  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

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
    const card = await createCreditCard(session.userId, {
      name,
      dueDay: Number(dueDay),
    });
    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    return serverError((error as Error).message);
  }
}
