'use client';

import { useSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, PanelLeftClose, PanelLeftOpen, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/debts': 'Dívidas',
  '/cards': 'Cartões',
  '/names': 'Nomes',
  '/settings': 'Configurações',
};

const pageActions: Record<string, { href: string; label: string }> = {
  '/debts': { href: '/debts/new', label: 'Nova Dívida' },
  '/cards': { href: '/cards/new', label: 'Novo Cartão' },
  '/names': { href: '/names/new', label: 'Novo Nome' },
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Match dynamic routes
  if (pathname.startsWith('/debts/')) return 'Dívidas';
  if (pathname.startsWith('/cards/')) return 'Cartões';
  if (pathname.startsWith('/names/')) return 'Nomes';

  return 'Dashboard';
}

export function SidebarMainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const action = pageActions[pathname];

  return (
    <div
      className={cn(
        'flex flex-1 flex-col transition-[padding] duration-200',
        collapsed ? 'md:pl-16' : 'md:pl-60',
      )}
    >
      {/* Top header bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
        {/* Mobile: hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop: collapse/expand toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        <span className="text-sm font-semibold">{title}</span>

        {action && (
          <Button asChild size="sm" className="ml-auto">
            <Link href={action.href}>
              <PlusCircle className="h-4 w-4 mr-2" />
              {action.label}
            </Link>
          </Button>
        )}
      </header>

      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
