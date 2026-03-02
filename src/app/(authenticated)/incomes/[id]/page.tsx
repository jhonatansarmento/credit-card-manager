import DeleteButton from '@/components/delete-button';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { getIncome } from '@/services/income.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Check, Clock, Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ToggleReceivedButton } from '../_components/toggle-received-button';

export default async function IncomeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAuthSession();
  const income = await getIncome(id, session.user.id);

  if (!income) notFound();

  const totalReceived = income.entries
    .filter((e) => e.isReceived)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPending = income.entries
    .filter((e) => !e.isReceived)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const receivedCount = income.entries.filter((e) => e.isReceived).length;

  return (
    <div className="max-w-4xl mx-auto grid gap-6">
      <PageBreadcrumb
        segments={[
          { label: 'Proventos', href: '/incomes' },
          { label: income.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">
            {INCOME_TYPE_EMOJIS[income.incomeType]}
          </span>
          <div>
            <h1 className="text-2xl font-bold">{income.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                {INCOME_TYPE_LABELS[income.incomeType]}
              </Badge>
              {income.isRecurring ? (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  Recorrente
                </Badge>
              ) : (
                <Badge variant="secondary">Pontual</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/incomes/${income.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <DeleteButton endpoint={`/api/incomes/${income.id}`} />
        </div>
      </div>

      {income.description && (
        <p className="text-muted-foreground">{income.description}</p>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(Number(income.amount))}
            </div>
            {income.receiveDay && (
              <p className="text-xs text-muted-foreground mt-1">
                <CalendarDays className="h-3 w-3 inline mr-1" />
                Dia {income.receiveDay} de cada mês
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Check className="h-3 w-3 inline mr-1" />
              {receivedCount} {receivedCount === 1 ? 'mês' : 'meses'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              {income.entries.length - receivedCount}{' '}
              {income.entries.length - receivedCount === 1 ? 'mês' : 'meses'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos</CardTitle>
          <CardDescription>Histórico de recebimentos por mês</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês de Referência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recebido em</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {income.entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhum lançamento gerado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                income.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {format(
                        new Date(entry.referenceMonth),
                        "MMMM 'de' yyyy",
                        {
                          locale: ptBR,
                        },
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(entry.amount))}
                    </TableCell>
                    <TableCell>
                      {entry.isReceived ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          <Check className="h-3 w-3 mr-1" />
                          Recebido
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.receivedAt
                        ? format(new Date(entry.receivedAt), 'dd/MM/yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <ToggleReceivedButton
                        entryId={entry.id}
                        isReceived={entry.isReceived}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
