import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { categorySchema } from '@/lib/schemas';
import { createCategory, listCategories } from '@/services/category.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const categories = await listCategories(session.userId);
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const parsed = await parseBody(request, categorySchema);
  if (!parsed.success) return parsed.response;

  try {
    const category = await createCategory(session.userId, parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return serverError(error, 'POST /api/categories');
  }
}
