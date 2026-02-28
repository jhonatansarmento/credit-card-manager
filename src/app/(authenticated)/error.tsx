'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Algo deu errado</h2>
        <p className="text-sm text-muted-foreground">
          Ocorreu um erro inesperado ao carregar esta página.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Código: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          Tentar novamente
        </Button>
        <Button asChild>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}
