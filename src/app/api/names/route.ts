import {
  badRequest,
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { createName, listNames } from '@/services/name.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const names = await listNames(session.userId);
  return NextResponse.json(names);
}

export async function POST(request: Request) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  if (!body.name) return badRequest('Nome é obrigatório.');

  try {
    const name = await createName(session.userId, { name: body.name });
    return NextResponse.json(name, { status: 201 });
  } catch (error) {
    return serverError((error as Error).message);
  }
}
