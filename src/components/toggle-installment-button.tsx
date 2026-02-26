'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CheckCircle, CircleDashed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleInstallmentButtonProps {
  installmentId: string;
  isPaid: boolean;
}

export default function ToggleInstallmentButton({
  installmentId,
  isPaid: initialIsPaid,
}: ToggleInstallmentButtonProps) {
  const [isPaid, setIsPaid] = useState(initialIsPaid);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/debts/installments/${installmentId}`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao atualizar parcela.');
      }

      const updated = await res.json();
      setIsPaid(updated.isPaid);
      toast.success(
        updated.isPaid
          ? 'Parcela marcada como paga.'
          : 'Parcela marcada como não paga.',
      );
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar parcela.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={isPaid ? 'text-green-500' : 'text-gray-400'}
          disabled={isLoading}
        >
          {isPaid ? (
            <CheckCircle className="h-6 w-6" />
          ) : (
            <CircleDashed className="h-6 w-6" />
          )}
          <span className="sr-only">
            {isPaid ? 'Parcela Paga' : 'Parcela a Pagar'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start"
          onClick={handleToggle}
          disabled={isLoading}
        >
          <Checkbox checked={isPaid} className="mr-2" />
          Marcar como {isPaid ? 'Não Paga' : 'Paga'}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
