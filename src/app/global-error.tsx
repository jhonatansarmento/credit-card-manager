'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased dark">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-950 p-4 text-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Algo deu errado
            </h1>
            <p className="text-muted-foreground">
              Ocorreu um erro inesperado. Tente novamente.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Código: {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </body>
    </html>
  );
}
