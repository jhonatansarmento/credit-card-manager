'use client';

import { Button } from '@/components/ui/button';
import { CreditCard, Home, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/cards', label: 'Cartões', icon: CreditCard },
  { href: '/names', label: 'Nomes', icon: Users },
  { href: '/debts', label: 'Dívidas', icon: Wallet },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith(href);

        return (
          <Button key={href} variant={isActive ? 'secondary' : 'ghost'} asChild>
            <Link href={href}>
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Link>
          </Button>
        );
      })}
    </>
  );
}
