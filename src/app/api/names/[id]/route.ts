import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { personCompanySchema } from '@/lib/schemas';
import { deleteName, updateName } from '@/services/name.service';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const parsed = await parseBody(request, personCompanySchema);
  if (!parsed.success) return parsed.response;

  try {
    const name = await updateName(id, session.userId, parsed.data);
    return NextResponse.json(name);
  } catch (error) {
    return serverError(error, 'PUT /api/names/[id]');
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
    return serverError(error, 'DELETE /api/names/[id]');
  }
}
