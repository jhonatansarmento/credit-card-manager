import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Obtém a sessão do usuário autenticado.
 * Redireciona para /login se não estiver autenticado.
 */
export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return session;
}

/**
 * Obtém a sessão sem redirecionar.
 * Retorna null se não estiver autenticado.
 */
export async function getOptionalSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}
