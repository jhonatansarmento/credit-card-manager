import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { creditCardSchema } from '@/lib/schemas';
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

  const parsed = await parseBody(request, creditCardSchema);
  if (!parsed.success) return parsed.response;

  try {
    const card = await createCreditCard(session.userId, parsed.data);
    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    return serverError(error, 'POST /api/cards');
  }
}
