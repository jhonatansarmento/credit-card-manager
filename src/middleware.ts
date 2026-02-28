import { rateLimit } from '@/lib/rate-limit';
import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting para rotas de API
  if (pathname.startsWith('/api')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'anonymous';
    const key = `${ip}:${pathname}`;

    // Limite mais restritivo para rotas de autenticação
    const isAuthRoute = pathname.startsWith('/api/auth');
    const limited = rateLimit(key, {
      limit: isAuthRoute ? 10 : 30,
      windowMs: 60_000,
    });

    if (limited) return limited;

    // Ignora rotas de autenticação do Better Auth (sem verificar sessionCookie)
    if (isAuthRoute) {
      return NextResponse.next();
    }
  }

  const sessionCookie = getSessionCookie(request);

  // Rotas protegidas
  const protectedPaths = ['/cards', '/names', '/debts'];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redireciona usuário logado para home se tentar acessar login/signup
  if (
    (pathname.startsWith('/login') || pathname.startsWith('/signup')) &&
    sessionCookie
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
