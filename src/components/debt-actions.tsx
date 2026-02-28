'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Archive, ArchiveRestore, CheckCheck, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface DebtActionsProps {
  debtId: string;
  isArchived: boolean;
  allPaid: boolean;
}

export default function DebtActions({
  debtId,
  isArchived,
  allPaid,
}: DebtActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (
    endpoint: string,
    method: string,
    successMessage: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao executar ação.');
      }
      toast.success(successMessage);
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao executar ação.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Pay All */}
      {!allPaid && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={loading}
              title="Quitar todas as parcelas"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="sr-only">Quitar Todas</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Quitar todas as parcelas?</AlertDialogTitle>
              <AlertDialogDescription>
                Todas as parcelas desta dívida serão marcadas como pagas. Esta
                ação pode ser revertida individualmente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleAction(
                    `/api/debts/${debtId}/pay-all`,
                    'PATCH',
                    'Todas as parcelas foram quitadas!',
                  )
                }
              >
                Quitar Todas
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Duplicate */}
      <Button
        variant="outline"
        size="icon"
        disabled={loading}
        title="Duplicar dívida"
        onClick={() =>
          handleAction(
            `/api/debts/${debtId}/duplicate`,
            'POST',
            'Dívida duplicada com sucesso!',
          )
        }
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Duplicar</span>
      </Button>

      {/* Archive / Unarchive */}
      <Button
        variant="outline"
        size="icon"
        disabled={loading}
        title={isArchived ? 'Desarquivar dívida' : 'Arquivar dívida'}
        onClick={() =>
          handleAction(
            `/api/debts/${debtId}/archive`,
            'PATCH',
            isArchived
              ? 'Dívida desarquivada!'
              : 'Dívida arquivada com sucesso!',
          )
        }
      >
        {isArchived ? (
          <ArchiveRestore className="h-4 w-4" />
        ) : (
          <Archive className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isArchived ? 'Desarquivar' : 'Arquivar'}
        </span>
      </Button>
    </div>
  );
}
