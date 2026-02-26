'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  };

  return (
    <Button variant='ghost' size='icon' onClick={handleSignOut}>
      <LogOut className='h-4 w-4' />
      <span className='sr-only'>Sair</span>
    </Button>
  );
}
