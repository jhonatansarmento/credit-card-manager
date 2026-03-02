import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { assetSchema } from '@/lib/schemas';
import { createAsset, listAssets } from '@/services/asset.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const assets = await listAssets(session.userId);
  return NextResponse.json(assets);
}

export async function POST(request: Request) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const parsed = await parseBody(request, assetSchema);
  if (!parsed.success) return parsed.response;

  try {
    const asset = await createAsset(session.userId, parsed.data);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return serverError(error, 'POST /api/assets');
  }
}
