import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignora rotas de autenticação do Better Auth
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
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
