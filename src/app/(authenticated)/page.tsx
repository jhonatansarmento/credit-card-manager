import CardBrandBadge from '@/components/card-brand-badge';
import { MonthlyEvolutionChart } from '@/components/monthly-evolution-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import {
  getDashboardSummary,
  getMonthlyEvolution,
  getOverdueInstallments,
  getSpendingByCard,
  getSpendingByPerson,
  getUpcomingInstallments,
} from '@/services/dashboard.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getAuthSession();
  const userId = session.user.id;

  const [
    summary,
    spendingByCard,
    spendingByPerson,
    monthlyEvolution,
    upcoming,
    overdue,
  ] = await Promise.all([
    getDashboardSummary(userId),
    getSpendingByCard(userId),
    getSpendingByPerson(userId),
    getMonthlyEvolution(userId),
    getUpcomingInstallments(userId),
    getOverdueInstallments(userId),
  ]);

  const hasData =
    summary.activeDebts > 0 ||
    summary.totalPaid > 0 ||
    spendingByCard.length > 0;

  return (
    <div className="max-w-7xl mx-auto grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {session.user.name}!</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral das suas finanças
        </p>
      </div>

      {!hasData ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Comece a gerenciar suas finanças
              </h2>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Cadastre seus cartões de crédito e pessoas/empresas para começar
                a registrar suas dívidas e acompanhar parcelas.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/cards/new">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cadastrar Cartão
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/names/new">
                  <Users className="h-4 w-4 mr-2" />
                  Cadastrar Nome
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Dívidas Ativas
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.activeDebts}</div>
                <p className="text-xs text-muted-foreground">
                  com parcelas pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Pendente
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(summary.totalPending)}
                </div>
                <p className="text-xs text-muted-foreground">
                  em parcelas não pagas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Parcelas Este Mês
                </CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.installmentsDueThisMonth}
                </div>
                <p className="text-xs text-muted-foreground">
                  parcelas a vencer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quitação Geral
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.overallPayoffPercent.toFixed(1)}%
                </div>
                <Progress
                  value={summary.overallPayoffPercent}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Spending by Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Gastos por Cartão
                </CardTitle>
                <CardDescription>
                  Distribuição de valores por cartão de crédito
                </CardDescription>
              </CardHeader>
              <CardContent>
                {spendingByCard.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum gasto registrado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {spendingByCard.map((card) => {
                      const paidPercent =
                        card.totalAmount > 0
                          ? ((card.totalAmount - card.pendingAmount) /
                              card.totalAmount) *
                            100
                          : 0;
                      return (
                        <div key={card.cardName} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CardBrandBadge name={card.cardName} size={24} />
                              <span className="font-medium text-sm">
                                {card.cardName}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {card.debtCount}{' '}
                                {card.debtCount === 1 ? 'dívida' : 'dívidas'}
                              </Badge>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatCurrency(card.totalAmount)}
                            </span>
                          </div>
                          <Progress value={paidPercent} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Pendente: {formatCurrency(card.pendingAmount)}
                            </span>
                            <span>{paidPercent.toFixed(0)}% quitado</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spending by Person/Company */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gastos por Pessoa/Empresa
                </CardTitle>
                <CardDescription>
                  Distribuição de valores por pessoa ou empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                {spendingByPerson.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum gasto registrado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {spendingByPerson.map((person) => {
                      const paidPercent =
                        person.totalAmount > 0
                          ? ((person.totalAmount - person.pendingAmount) /
                              person.totalAmount) *
                            100
                          : 0;
                      return (
                        <div key={person.personName} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {person.personName}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {person.debtCount}{' '}
                                {person.debtCount === 1 ? 'dívida' : 'dívidas'}
                              </Badge>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatCurrency(person.totalAmount)}
                            </span>
                          </div>
                          <Progress value={paidPercent} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Pendente: {formatCurrency(person.pendingAmount)}
                            </span>
                            <span>{paidPercent.toFixed(0)}% quitado</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Evolution Chart */}
          {monthlyEvolution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Evolução Mensal
                </CardTitle>
                <CardDescription>
                  Comparativo de parcelas pagas vs pendentes ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyEvolutionChart data={monthlyEvolution} />
              </CardContent>
            </Card>
          )}

          {/* Overdue Installments */}
          {overdue.length > 0 && (
            <Card className="border-destructive">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Parcelas Vencidas ({overdue.length})
                  </CardTitle>
                  <CardDescription>
                    Parcelas não pagas com vencimento anterior a hoje
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/debts">Ver Dívidas</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Cartão</TableHead>
                      <TableHead>Pessoa/Empresa</TableHead>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdue.map((inst) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dueDate = new Date(inst.dueDate);
                      const diffDays = Math.ceil(
                        (today.getTime() - dueDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );

                      return (
                        <TableRow key={inst.id}>
                          <TableCell className="font-medium">
                            {inst.debtDescription}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <CardBrandBadge name={inst.cardName} size={20} />
                              <span className="text-sm">{inst.cardName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{inst.personName}</TableCell>
                          <TableCell>
                            {inst.installmentNumber}/{inst.totalInstallments}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {format(inst.dueDate, 'dd/MM/yyyy', {
                                locale: ptBR,
                              })}
                              <Badge variant="destructive" className="text-xs">
                                {diffDays === 1
                                  ? '1 dia atrás'
                                  : `${diffDays} dias atrás`}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-destructive">
                            {formatCurrency(inst.amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Installments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Próximas Parcelas
                </CardTitle>
                <CardDescription>
                  Parcelas pendentes mais próximas do vencimento
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/debts">Ver Todas</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma parcela pendente
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Cartão</TableHead>
                      <TableHead>Pessoa/Empresa</TableHead>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((inst) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dueDate = new Date(inst.dueDate);
                      const diffDays = Math.ceil(
                        (dueDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                      const isUrgent = diffDays <= 7;

                      return (
                        <TableRow key={inst.id}>
                          <TableCell className="font-medium">
                            {inst.debtDescription}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <CardBrandBadge name={inst.cardName} size={20} />
                              <span className="text-sm">{inst.cardName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{inst.personName}</TableCell>
                          <TableCell>
                            {inst.installmentNumber}/{inst.totalInstallments}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {format(inst.dueDate, 'dd/MM/yyyy', {
                                locale: ptBR,
                              })}
                              {isUrgent && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {diffDays === 0
                                    ? 'Hoje'
                                    : diffDays === 1
                                      ? 'Amanhã'
                                      : `${diffDays} dias`}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(inst.amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
