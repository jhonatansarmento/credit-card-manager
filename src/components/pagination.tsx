'use client';

import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
}

export default function Pagination({
  page,
  totalPages,
  total,
  basePath,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', newPage.toString());
      }
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [router, searchParams, basePath],
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? 'resultado' : 'resultados'} — Página {page} de{' '}
        {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => goToPage(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Primeira</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Anterior</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próxima</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => goToPage(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Última</span>
        </Button>
      </div>
    </div>
  );
}
