'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Archive, CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useState } from 'react';
import { toast } from 'sonner';

interface BatchContextType {
  selectedIds: Set<string>;
  toggle: (id: string) => void;
  isSelected: (id: string) => boolean;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

const BatchContext = createContext<BatchContextType | null>(null);

export function useBatchSelection() {
  const ctx = useContext(BatchContext);
  if (!ctx)
    throw new Error('useBatchSelection must be used within BatchProvider');
  return ctx;
}

export function BatchProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );
  const selectAll = useCallback(
    (ids: string[]) => setSelectedIds(new Set(ids)),
    [],
  );
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  return (
    <BatchContext.Provider
      value={{ selectedIds, toggle, isSelected, selectAll, clearSelection }}
    >
      {children}
    </BatchContext.Provider>
  );
}

export function BatchCheckbox({ debtId }: { debtId: string }) {
  const { toggle, isSelected } = useBatchSelection();
  return (
    <Checkbox
      checked={isSelected(debtId)}
      onCheckedChange={() => toggle(debtId)}
      className="mr-2"
      aria-label={`Selecionar dívida`}
    />
  );
}

export function BatchActionsBar() {
  const { selectedIds, clearSelection } = useBatchSelection();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (selectedIds.size === 0) return null;

  const handleAction = async (action: 'archive' | 'payAll') => {
    setLoading(true);
    try {
      const res = await fetch('/api/debts/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debtIds: Array.from(selectedIds), action }),
      });
      if (!res.ok) throw new Error('Erro na operação em lote.');
      const msg =
        action === 'archive'
          ? 'Dívidas arquivadas!'
          : 'Parcelas marcadas como pagas!';
      toast.success(msg);
      clearSelection();
      router.refresh();
    } catch {
      toast.error('Erro ao executar ação em lote.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky bottom-4 z-50 flex items-center justify-between gap-2 rounded-lg border bg-background p-3 shadow-lg">
      <span className="text-sm font-medium">
        {selectedIds.size} selecionada{selectedIds.size > 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('payAll')}
          disabled={loading}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Pagar Todas
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('archive')}
          disabled={loading}
        >
          <Archive className="h-4 w-4 mr-1" />
          Arquivar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={clearSelection}
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
