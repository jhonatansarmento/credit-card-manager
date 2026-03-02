'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface InstallmentCollapseProps {
  totalCount: number;
  /** Number of paid installments at the END of the children array */
  paidCount?: number;
  children: React.ReactNode[];
  initialVisible?: number;
}

export function InstallmentCollapse({
  totalCount,
  paidCount = 0,
  children,
  initialVisible = 4,
}: InstallmentCollapseProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPaid, setShowPaid] = useState(false);

  // Unpaid children come first, paid children come last
  const unpaidCount = totalCount - paidCount;
  const unpaidChildren = children.slice(0, unpaidCount);
  const paidChildren = children.slice(unpaidCount);

  // For unpaid: show up to initialVisible, expandable
  const visibleUnpaid = expanded
    ? unpaidChildren
    : unpaidChildren.slice(0, initialVisible);
  const hasMoreUnpaid = unpaidCount > initialVisible;

  return (
    <>
      {unpaidCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleUnpaid}
        </div>
      )}
      {hasMoreUnpaid && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Ocultar parcelas pendentes
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Ver todas as {unpaidCount} parcelas pendentes
            </>
          )}
        </Button>
      )}

      {paidCount > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            onClick={() => setShowPaid(!showPaid)}
          >
            {showPaid ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Ocultar {paidCount} parcela{paidCount > 1 ? 's' : ''} paga
                {paidCount > 1 ? 's' : ''}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Ver {paidCount} parcela{paidCount > 1 ? 's' : ''} paga
                {paidCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
          {showPaid && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
              {paidChildren}
            </div>
          )}
        </>
      )}

      {unpaidCount === 0 && paidCount === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma parcela encontrada.
        </p>
      )}
    </>
  );
}
