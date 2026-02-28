'use client';

import { useSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

export function SidebarMainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed, setMobileOpen } = useSidebar();

  return (
    <div
      className={cn(
        'flex flex-1 flex-col transition-[padding] duration-200',
        collapsed ? 'md:pl-16' : 'md:pl-60',
      )}
    >
      {/* Mobile-only top bar with hamburger */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold">Controle de Dívidas</span>
      </header>

      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
