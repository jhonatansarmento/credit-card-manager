import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-950 p-4 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl text-muted-foreground">Página não encontrada</h2>
        <p className="text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
