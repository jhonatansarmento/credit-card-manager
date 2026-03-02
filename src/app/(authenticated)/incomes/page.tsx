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
import { INCOME_TYPE_EMOJIS, INCOME_TYPE_LABELS } from '@/lib/schemas/income';
import { listIncomes } from '@/services/income.service';
import { Eye, Pencil, PlusCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { ToggleReceivedButton } from './_components/toggle-received-button';

export default async function IncomesPage() {
  const session = await getAuthSession();
  const userId = session.user.id;

  const incomes = await listIncomes(userId);

  // Get current month for status check
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return (
    <div className="max-w-6xl mx-auto grid gap-6">
      {incomes.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Nenhum provento cadastrado
              </CardTitle>
              <CardDescription className="mt-2">
                Cadastre seus proventos (salário, freelance, investimentos) para
                acompanhar seu fluxo de caixa.
              </CardDescription>
            </div>
            <Button asChild className="mt-2">
              <Link href="/incomes/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Provento
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
                    <TableHead>Provento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Recorrente</TableHead>
                    <TableHead>Status Mês</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map((income) => {
                    const currentEntry = income.entries.find(
                      (e) =>
                        new Date(e.referenceMonth).getTime() ===
                        currentMonthStart.getTime(),
                    );

                    return (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {INCOME_TYPE_EMOJIS[income.incomeType]}
                            </span>
                            <div>
                              <span>{income.name}</span>
                              {income.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {income.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {INCOME_TYPE_LABELS[income.incomeType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency(Number(income.amount))}
                        </TableCell>
                        <TableCell>
                          {income.isRecurring ? (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Mensal
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pontual</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {currentEntry ? (
                            <ToggleReceivedButton
                              entryId={currentEntry.id}
                              isReceived={currentEntry.isReceived}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/incomes/${income.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Detalhes</span>
                              </Link>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/incomes/${income.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Link>
                            </Button>
                            <DeleteButton
                              endpoint={`/api/incomes/${income.id}`}
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
            {incomes.map((income) => {
              const currentEntry = income.entries.find(
                (e) =>
                  new Date(e.referenceMonth).getTime() ===
                  currentMonthStart.getTime(),
              );

              return (
                <Card key={income.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {INCOME_TYPE_EMOJIS[income.incomeType]}
                      </span>
                      <div>
                        <p className="font-medium">{income.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {INCOME_TYPE_LABELS[income.incomeType]}
                          </Badge>
                          {income.isRecurring && (
                            <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Mensal
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(Number(income.amount))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div>
                      {currentEntry ? (
                        <ToggleReceivedButton
                          entryId={currentEntry.id}
                          isReceived={currentEntry.isReceived}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sem lançamento este mês
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/incomes/${income.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/incomes/${income.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteButton endpoint={`/api/incomes/${income.id}`} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Add button */}
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/incomes/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Provento
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
