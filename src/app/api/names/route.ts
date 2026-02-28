import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { personCompanySchema } from '@/lib/schemas';
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

  const parsed = await parseBody(request, personCompanySchema);
  if (!parsed.success) return parsed.response;

  try {
    const name = await createName(session.userId, parsed.data);
    return NextResponse.json(name, { status: 201 });
  } catch (error) {
    return serverError(error, 'POST /api/names');
  }
}
