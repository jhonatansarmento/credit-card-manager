'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteButtonProps {
  endpoint: string;
}

export default function DeleteButton({ endpoint }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir o item.');
      }

      toast.success('Item excluído com sucesso!');
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir o item.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Excluir</span>
    </Button>
  );
}
