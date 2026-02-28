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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Archive,
  ArchiveRestore,
  CheckCheck,
  Copy,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface DebtActionsMenuProps {
  debtId: string;
  isArchived: boolean;
  allPaid: boolean;
}

export default function DebtActionsMenu({
  debtId,
  isArchived,
  allPaid,
}: DebtActionsMenuProps) {
  const [loading, setLoading] = useState(false);
  const [payAllDialogOpen, setPayAllDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={loading}>
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/debts/${debtId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              handleAction(
                `/api/debts/${debtId}/duplicate`,
                'POST',
                'Dívida duplicada com sucesso!',
              )
            }
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </DropdownMenuItem>

          {!allPaid && (
            <DropdownMenuItem onClick={() => setPayAllDialogOpen(true)}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Quitar Todas
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
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
              <ArchiveRestore className="h-4 w-4 mr-2" />
            ) : (
              <Archive className="h-4 w-4 mr-2" />
            )}
            {isArchived ? 'Desarquivar' : 'Arquivar'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Pay All Confirmation Dialog */}
      <AlertDialog open={payAllDialogOpen} onOpenChange={setPayAllDialogOpen}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir dívida?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A dívida e todas as suas parcelas
              serão permanentemente excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                handleAction(
                  `/api/debts/${debtId}`,
                  'DELETE',
                  'Dívida excluída com sucesso!',
                )
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
