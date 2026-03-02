import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { assetSchema } from '@/lib/schemas';
import { deleteAsset, updateAsset } from '@/services/asset.service';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const parsed = await parseBody(request, assetSchema);
  if (!parsed.success) return parsed.response;

  try {
    const asset = await updateAsset(id, session.userId, parsed.data);
    return NextResponse.json(asset);
  } catch (error) {
    return serverError(error, 'PUT /api/assets/[id]');
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
    await deleteAsset(id, session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error, 'DELETE /api/assets/[id]');
  }
}
