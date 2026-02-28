import CardBrandBadge from '@/components/card-brand-badge';
import DeleteButton from '@/components/delete-button';
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
import { listCreditCards } from '@/services/credit-card.service';
import { CreditCard, Pencil, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default async function CreditCardsPage() {
  const session = await getAuthSession();
  const userId = session.user.id;

  const creditCards = await listCreditCards(userId);

  return (
    <div className="max-w-6xl mx-auto grid gap-6">
      {creditCards.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Nenhum cartão cadastrado
              </CardTitle>
              <CardDescription className="mt-2">
                Comece adicionando seu primeiro cartão de crédito para registrar
                suas dívidas.
              </CardDescription>
            </div>
            <Button asChild className="mt-2">
              <Link href="/cards/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Primeiro Cartão
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
                    <TableHead>Nome do Cartão</TableHead>
                    <TableHead>Dia de Vencimento</TableHead>
                    <TableHead>Dívidas</TableHead>
                    <TableHead>Pendente</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditCards.map((card) => {
                    const pendingAmount = card.debts.reduce(
                      (sum, debt) =>
                        sum +
                        debt.installments.reduce(
                          (s, inst) => s + Number(inst.amount),
                          0,
                        ),
                      0,
                    );

                    return (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <CardBrandBadge name={card.name} />
                            <span>{card.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{card.dueDay}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {card._count.debts}{' '}
                            {card._count.debts === 1 ? 'dívida' : 'dívidas'}
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
                              <Link href={`/cards/${card.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Link>
                            </Button>
                            <DeleteButton endpoint={`/api/cards/${card.id}`} />
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
            {creditCards.map((card) => {
              const pendingAmount = card.debts.reduce(
                (sum, debt) =>
                  sum +
                  debt.installments.reduce(
                    (s, inst) => s + Number(inst.amount),
                    0,
                  ),
                0,
              );

              return (
                <Card key={card.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardBrandBadge name={card.name} />
                      <div>
                        <p className="font-medium">{card.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Venc. dia {card.dueDay}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/cards/${card.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <DeleteButton endpoint={`/api/cards/${card.id}`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge variant="secondary">
                      {card._count.debts}{' '}
                      {card._count.debts === 1 ? 'dívida' : 'dívidas'}
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
