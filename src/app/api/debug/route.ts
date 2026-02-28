import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Verificar variáveis de ambiente
  checks.envVars = {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL
      ? '✅ definido'
      : '❌ NÃO definido',
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
      ? '✅ definido'
      : '❌ NÃO definido',
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET
      ? '✅ definido'
      : '❌ NÃO definido',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ definido' : '❌ NÃO definido',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
      ? '✅ definido'
      : '❌ NÃO definido',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
      ? '✅ definido'
      : '❌ NÃO definido',
    BETTER_AUTH_URL_VALUE: process.env.BETTER_AUTH_URL ?? 'undefined',
    NODE_ENV: process.env.NODE_ENV,
  };

  // 2. Testar conexão com o banco de dados
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    checks.database = '✅ Conexão OK';
  } catch (error) {
    checks.database = `❌ Erro: ${error instanceof Error ? error.message : String(error)}`;
  }

  // 3. Verificar tabelas do Better Auth
  try {
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.session.count();
    const accountCount = await prisma.account.count();
    checks.tables = {
      users: userCount,
      sessions: sessionCount,
      accounts: accountCount,
    };
  } catch (error) {
    checks.tables = `❌ Erro: ${error instanceof Error ? error.message : String(error)}`;
  }

  return NextResponse.json(checks, { status: 200 });
}
