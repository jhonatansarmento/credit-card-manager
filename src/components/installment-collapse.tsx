'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface InstallmentCollapseProps {
  totalCount: number;
  children: React.ReactNode[];
  initialVisible?: number;
}

export function InstallmentCollapse({
  totalCount,
  children,
  initialVisible = 4,
}: InstallmentCollapseProps) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? children : children.slice(0, initialVisible);
  const hasMore = totalCount > initialVisible;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible}
      </div>
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Ocultar parcelas
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Ver todas as {totalCount} parcelas
            </>
          )}
        </Button>
      )}
    </>
  );
}
