import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
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
import { listNames } from '@/services/name.service';
import { Pencil, PlusCircle, Users } from 'lucide-react';
import Link from 'next/link';

import DeleteButton from '@/components/delete-button';

export default async function PersonCompaniesPage() {
  const session = await getAuthSession();
  const userId = session.user.id;

  const personCompanies = await listNames(userId);

  return (
    <div className="max-w-6xl mx-auto grid gap-6">
      {personCompanies.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">Nenhum nome cadastrado</CardTitle>
              <CardDescription className="mt-2">
                Cadastre pessoas ou empresas para associar às suas dívidas.
              </CardDescription>
            </div>
            <Button asChild className="mt-2">
              <Link href="/names/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Primeiro Nome
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Dívidas</TableHead>
                    <TableHead>Pendente</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personCompanies.map((pc) => {
                    const pendingAmount = pc.debts.reduce(
                      (sum, debt) =>
                        sum +
                        debt.installments.reduce(
                          (s, inst) => s + Number(inst.amount),
                          0,
                        ),
                      0,
                    );

                    return (
                      <TableRow key={pc.id}>
                        <TableCell className="font-medium">{pc.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {pc._count.debts}{' '}
                            {pc._count.debts === 1 ? 'dívida' : 'dívidas'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pendingAmount > 0 ? (
                            <span className="text-destructive font-medium">
                              {formatCurrency(pendingAmount)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/names/${pc.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Link>
                            </Button>
                            <DeleteButton endpoint={`/api/names/${pc.id}`} />
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
            {personCompanies.map((pc) => {
              const pendingAmount = pc.debts.reduce(
                (sum, debt) =>
                  sum +
                  debt.installments.reduce(
                    (s, inst) => s + Number(inst.amount),
                    0,
                  ),
                0,
              );

              return (
                <Card key={pc.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{pc.name}</p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/names/${pc.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <DeleteButton endpoint={`/api/names/${pc.id}`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge variant="secondary">
                      {pc._count.debts}{' '}
                      {pc._count.debts === 1 ? 'dívida' : 'dívidas'}
                    </Badge>
                    {pendingAmount > 0 ? (
                      <span className="text-sm text-destructive font-medium">
                        {formatCurrency(pendingAmount)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Sem pendências
                      </span>
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
