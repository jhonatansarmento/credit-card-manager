'use client';

import { Button } from '@/components/ui/button';
import { Check, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleReceivedButtonProps {
  entryId: string;
  isReceived: boolean;
}

export function ToggleReceivedButton({
  entryId,
  isReceived,
}: ToggleReceivedButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/incomes/entries/${entryId}/toggle`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error();

      toast.success(
        isReceived ? 'Marcado como pendente' : 'Marcado como recebido!',
      );
      router.refresh();
    } catch {
      toast.error('Erro ao atualizar lançamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isReceived ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={
        isReceived
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950'
      }
    >
      {isReceived ? (
        <>
          <Check className="h-3 w-3 mr-1" />
          Recebido
        </>
      ) : (
        <>
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </>
      )}
    </Button>
  );
}
