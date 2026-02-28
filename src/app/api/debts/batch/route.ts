import prisma from '@/lib/db';
import {
  badRequest,
  getRouteSession,
  serverError,
  unauthorized,
} from '@/lib/route-helpers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const batchSchema = z.object({
  debtIds: z.array(z.string()).min(1, 'Selecione ao menos uma dívida.'),
  action: z.enum(['archive', 'payAll']),
});

export async function POST(request: Request) {
  const session = await getRouteSession();
  if (!session) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body JSON inválido.');
  }

  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { debtIds, action } = parsed.data;

  try {
    // Verify ownership
    const debts = await prisma.debt.findMany({
      where: { id: { in: debtIds }, userId: session.userId },
      select: { id: true },
    });

    const validIds = debts.map((d) => d.id);
    if (validIds.length === 0) {
      return badRequest('Nenhuma dívida válida encontrada.');
    }

    if (action === 'archive') {
      await prisma.debt.updateMany({
        where: { id: { in: validIds } },
        data: { isArchived: true },
      });
    } else if (action === 'payAll') {
      await prisma.installment.updateMany({
        where: { debtId: { in: validIds } },
        data: { isPaid: true },
      });
    }

    return NextResponse.json({
      success: true,
      affected: validIds.length,
    });
  } catch (error) {
    return serverError(error, 'POST /api/debts/batch');
  }
}
