import { Button } from '@/components/ui/button';
import { getOptionalSession } from '@/lib/auth-session';
import { CreditCard } from 'lucide-react';
import Link from 'next/link';
import MobileMenu from './mobile-menu';
import { NavLinks } from './nav-links';
import { SignOutButton } from './sign-out-button';
import { ThemeToggle } from './theme-toggle';

export default async function Navbar() {
  const session = await getOptionalSession();

  return (
    <header className="relative flex items-center h-16 px-4 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      {/* Hamburger — mobile left */}
      <div className="flex md:hidden">
        <MobileMenu />
      </div>

      {/* Logo — absolute center on mobile, static on desktop */}
      <Link
        href="/"
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-semibold md:static md:translate-x-0 md:left-auto"
        prefetch={false}
      >
        <CreditCard className="h-6 w-6" />
        <span>Controle de Dívidas</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-4 ml-6">
        <NavLinks />
      </nav>

      {/* Right side — always visible */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {session ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <Button asChild size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
