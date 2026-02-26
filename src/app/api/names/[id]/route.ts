import {
  badRequest,
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { deleteName, updateName } from '@/services/name.service';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  if (!body.name) return badRequest('Nome é obrigatório.');

  try {
    const name = await updateName(id, session.userId, { name: body.name });
    return NextResponse.json(name);
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
    await deleteName(id, session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError((error as Error).message);
  }
}
