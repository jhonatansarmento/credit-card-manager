import DeleteButton from '@/components/delete-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAuthSession } from '@/lib/auth-session';
import { formatCurrency } from '@/lib/format';
import { listAssets } from '@/services/asset.service';
import { Eye, Package, Pencil, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AssetsPage() {
  const session = await getAuthSession();
  const userId = session.user.id;

  const assets = await listAssets(userId);

  return (
    <div className="max-w-6xl mx-auto grid gap-6">
      {assets.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Nenhum bem/ativo cadastrado
              </CardTitle>
              <CardDescription className="mt-2">
                Cadastre bens como carros, imóveis ou outros itens para agrupar
                suas dívidas relacionadas.
              </CardDescription>
            </div>
            <Button asChild className="mt-2">
              <Link href="/assets/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Bem
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop: Table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bem/Ativo</TableHead>
                    <TableHead>Dívidas</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Pendente</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => {
                    const totalAmount = asset.debts.reduce(
                      (sum, debt) => sum + Number(debt.totalAmount),
                      0,
                    );
                    const pendingAmount = asset.debts.reduce(
                      (sum, debt) =>
                        sum +
                        debt.installments
                          .filter((i) => !i.isPaid)
                          .reduce((s, i) => s + Number(i.amount), 0),
                      0,
                    );
                    const paidAmount = asset.debts.reduce(
                      (sum, debt) =>
                        sum +
                        debt.installments
                          .filter((i) => i.isPaid)
                          .reduce((s, i) => s + Number(i.amount), 0),
                      0,
                    );
                    const progressPercent =
                      totalAmount > 0
                        ? (paidAmount / (paidAmount + pendingAmount)) * 100
                        : 0;

                    return (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{asset.emoji}</span>
                            <div>
                              <span>{asset.name}</span>
                              {asset.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {asset.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {asset._count.debts}{' '}
                            {asset._count.debts === 1 ? 'dívida' : 'dívidas'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(totalAmount)}</TableCell>
                        <TableCell>
                          {pendingAmount > 0 ? (
                            <span className="text-destructive font-medium">
                              {formatCurrency(pendingAmount)}
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Quitado
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress
                              value={progressPercent}
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-muted-foreground">
                              {progressPercent.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/assets/${asset.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Detalhes</span>
                              </Link>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/assets/${asset.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Link>
                            </Button>
                            <DeleteButton
                              endpoint={`/api/assets/${asset.id}`}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile: Card layout */}
          <div className="grid gap-3 md:hidden">
            {assets.map((asset) => {
              const totalAmount = asset.debts.reduce(
                (sum, debt) => sum + Number(debt.totalAmount),
                0,
              );
              const pendingAmount = asset.debts.reduce(
                (sum, debt) =>
                  sum +
                  debt.installments
                    .filter((i) => !i.isPaid)
                    .reduce((s, i) => s + Number(i.amount), 0),
                0,
              );
              const paidAmount = asset.debts.reduce(
                (sum, debt) =>
                  sum +
                  debt.installments
                    .filter((i) => i.isPaid)
                    .reduce((s, i) => s + Number(i.amount), 0),
                0,
              );
              const progressPercent =
                totalAmount > 0
                  ? (paidAmount / (paidAmount + pendingAmount)) * 100
                  : 0;

              return (
                <Card key={asset.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{asset.emoji}</span>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        {asset.description && (
                          <p className="text-xs text-muted-foreground">
                            {asset.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/assets/${asset.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/assets/${asset.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <DeleteButton endpoint={`/api/assets/${asset.id}`} />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {asset._count.debts}{' '}
                        {asset._count.debts === 1 ? 'dívida' : 'dívidas'}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={progressPercent}
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {progressPercent.toFixed(0)}%
                      </span>
                    </div>
                    {pendingAmount > 0 && (
                      <p className="text-xs text-destructive">
                        Pendente: {formatCurrency(pendingAmount)}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
