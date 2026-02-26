import { Button } from '@/components/ui/button';
import { getOptionalSession } from '@/lib/auth-session';
import { CreditCard, Home, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { SignOutButton } from './sign-out-button';

export default async function Navbar() {
  const session = await getOptionalSession();

  return (
    <header className='flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-gray-900 dark:border-gray-800'>
      <Link
        href='/'
        className='flex items-center gap-2 font-semibold'
        prefetch={false}
      >
        <CreditCard className='h-6 w-6' />
        <span>Controle de Dívidas</span>
      </Link>
      <nav className='hidden md:flex items-center gap-4'>
        <Button variant='ghost' asChild>
          <Link href='/'>
            <Home className='h-4 w-4 mr-2' />
            Início
          </Link>
        </Button>
        <Button variant='ghost' asChild>
          <Link href='/cards'>
            <CreditCard className='h-4 w-4 mr-2' />
            Cartões
          </Link>
        </Button>
        <Button variant='ghost' asChild>
          <Link href='/names'>
            <Users className='h-4 w-4 mr-2' />
            Nomes
          </Link>
        </Button>
        <Button variant='ghost' asChild>
          <Link href='/debts'>
            <Wallet className='h-4 w-4 mr-2' />
            Dívidas
          </Link>
        </Button>
      </nav>
      <div className='flex items-center gap-4'>
        {session ? (
          <div className='flex items-center gap-3'>
            <span className='text-sm text-muted-foreground hidden md:inline'>
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <Button asChild>
            <Link href='/login'>Entrar</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
