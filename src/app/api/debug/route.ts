import { neon } from '@neondatabase/serverless';
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
    DATABASE_URL_FORMAT: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/\/\/([^:]+):[^@]+@/, '//$1:***@')
      : 'undefined',
  };

  // 2. Testar conexão direta com o driver Neon (sem Prisma)
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT 1 as test`;
    checks.neonDirect = `✅ Conexão direta OK: ${JSON.stringify(result)}`;
  } catch (error) {
    checks.neonDirect = `❌ Erro direto Neon: ${error instanceof Error ? error.message : String(error)}`;
  }

  // 3. Testar conexão via Prisma adapter
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    checks.prisma = '✅ Prisma Conexão OK';
  } catch (error) {
    checks.prisma = `❌ Erro Prisma: ${error instanceof Error ? error.message : String(error)}`;
  }

  // 4. Verificar tabelas do Better Auth
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
