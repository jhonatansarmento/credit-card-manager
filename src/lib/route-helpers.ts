import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { sanitizeObject } from '@/lib/sanitize';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type { z } from 'zod';

export type RouteSession = { userId: string };

export async function getRouteSession(): Promise<RouteSession | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return null;
  return { userId: session.user.id };
}

/**
 * Faz o parse do body JSON, sanitiza strings e valida com o schema Zod.
 * Retorna os dados tipados ou uma resposta de erro 400.
 */
export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse }
> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { success: false, response: badRequest('Body JSON inválido.') };
  }

  // Sanitiza todas as strings do body antes da validação
  const sanitizedBody = sanitizeObject(body);

  const result = schema.safeParse(sanitizedBody);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Dados inválidos.', details: errors },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: result.data };
}

export function unauthorized() {
  return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = 'Recurso não encontrado.') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(error: unknown, context?: string) {
  logger.error('Erro no servidor', error, { context });
  const message =
    error instanceof Error ? error.message : 'Erro interno do servidor.';
  return NextResponse.json({ error: message }, { status: 500 });
}
