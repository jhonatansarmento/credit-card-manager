import {
  getRouteSession,
  parseBody,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { categorySchema } from '@/lib/schemas';
import { deleteCategory, updateCategory } from '@/services/category.service';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const parsed = await parseBody(request, categorySchema);
  if (!parsed.success) return parsed.response;

  try {
    const category = await updateCategory(id, session.userId, parsed.data);
    return NextResponse.json(category);
  } catch (error) {
    return serverError(error, 'PUT /api/categories/[id]');
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
    await deleteCategory(id, session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error, 'DELETE /api/categories/[id]');
  }
}
