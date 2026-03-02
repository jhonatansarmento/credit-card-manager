import CardBrandBadge from '@/components/card-brand-badge';
import { CategoryDonutChart } from '@/components/category-donut-chart';
import { MonthlyEvolutionChart } from '@/components/monthly-evolution-chart';
import { ProjectionChart } from '@/components/projection-chart';
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
  getInvoiceSummaries,
  getMonthlyEvolution,
  getMonthlyProjection,
  getOverdueInstallments,
  getSpendingByAsset,
  getSpendingByCard,
  getSpendingByCategory,
  getSpendingByPerson,
  getUpcomingInstallments,
} from '@/services/dashboard.service';
import { getIncomesSummary } from '@/services/income.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  Package,
  PieChart,
  Receipt,
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
    spendingByCategory,
    spendingByAsset,
    invoiceSummaries,
    monthlyEvolution,
    monthlyProjection,
    upcoming,
    overdue,
    incomeSummary,
  ] = await Promise.all([
    getDashboardSummary(userId),
    getSpendingByCard(userId),
    getSpendingByPerson(userId),
    getSpendingByCategory(userId),
    getSpendingByAsset(userId),
    getInvoiceSummaries(userId),
    getMonthlyEvolution(userId),
    getMonthlyProjection(userId, 6),
    getUpcomingInstallments(userId),
    getOverdueInstallments(userId),
    getIncomesSummary(userId),
  ]);

  const hasData =
    summary.activeDebts > 0 ||
    summary.totalPaid > 0 ||
    spendingByCard.length > 0;

  return (
    <div className="max-w-7xl mx-auto grid gap-6">
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

          {/* Income & Balance Section */}
          {(incomeSummary.activeIncomes > 0 ||
            incomeSummary.expectedThisMonth > 0) && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                  Balanço do Mês
                </CardTitle>
                <CardDescription>
                  Comparativo de receita vs despesa neste mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Receita
                    </p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(incomeSummary.receivedThisMonth)}
                    </p>
                    {incomeSummary.expectedThisMonth >
                      incomeSummary.receivedThisMonth && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Esperado:{' '}
                        {formatCurrency(incomeSummary.expectedThisMonth)}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Despesa
                    </p>
                    <p className="text-xl font-bold text-destructive">
                      {formatCurrency(
                        summary.totalPending > 0
                          ? summary.installmentsDueThisMonth *
                              (summary.totalPending /
                                Math.max(1, summary.activeDebts))
                          : 0,
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                    {(() => {
                      const monthExpense =
                        summary.installmentsDueThisMonth > 0
                          ? summary.installmentsDueThisMonth *
                            (summary.totalPending /
                              Math.max(1, summary.activeDebts))
                          : 0;
                      const balance =
                        incomeSummary.receivedThisMonth - monthExpense;
                      return (
                        <p
                          className={`text-xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                        >
                          {balance >= 0 ? '+' : ''}
                          {formatCurrency(balance)}
                        </p>
                      );
                    })()}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/cash-flow">
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Ver fluxo de caixa completo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Spending by Asset */}
          {spendingByAsset.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gastos por Bem/Ativo
                </CardTitle>
                <CardDescription>
                  Quanto cada bem ou ativo está custando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingByAsset.map((asset) => {
                    const paidPercent =
                      asset.totalAmount > 0
                        ? ((asset.totalAmount - asset.pendingAmount) /
                            asset.totalAmount) *
                          100
                        : 0;
                    return (
                      <div key={asset.assetId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{asset.emoji}</span>
                            <Link
                              href={`/assets/${asset.assetId}`}
                              className="font-medium text-sm hover:underline"
                            >
                              {asset.assetName}
                            </Link>
                            <Badge variant="secondary" className="text-xs">
                              {asset.debtCount}{' '}
                              {asset.debtCount === 1 ? 'dívida' : 'dívidas'}
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold">
                            {formatCurrency(asset.totalAmount)}
                          </span>
                        </div>
                        <Progress value={paidPercent} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            Pendente: {formatCurrency(asset.pendingAmount)}
                          </span>
                          <span>{paidPercent.toFixed(0)}% quitado</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spending by Category + Invoice Summaries */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Spending by Category Donut Chart */}
            {spendingByCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Gastos por Categoria
                  </CardTitle>
                  <CardDescription>
                    Distribuição de valores por categoria de despesa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryDonutChart data={spendingByCategory} />
                  <div className="mt-4 space-y-2">
                    {spendingByCategory.map((cat) => (
                      <div
                        key={cat.categoryName}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>
                            {cat.emoji} {cat.categoryName}
                          </span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(cat.totalAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice Summaries */}
            {invoiceSummaries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Faturas Atuais
                  </CardTitle>
                  <CardDescription>
                    Resumo das faturas no ciclo de cobrança atual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoiceSummaries.map((invoice) => (
                      <div
                        key={invoice.cardId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CardBrandBadge name={invoice.cardName} size={28} />
                          <div>
                            <p className="font-medium text-sm">
                              {invoice.cardName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.installmentCount} parcela
                              {invoice.installmentCount !== 1 ? 's' : ''} •
                              Venc. dia {invoice.dueDay}
                              {invoice.closingDay
                                ? ` • Fecha dia ${invoice.closingDay}`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-bold">
                          {formatCurrency(invoice.currentInvoiceTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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

          {/* Monthly Projection Chart */}
          {monthlyProjection.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Projeção de Gastos
                </CardTitle>
                <CardDescription>
                  Projeção de parcelas pendentes e acumulado para os próximos
                  meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectionChart data={monthlyProjection} />
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
                {/* Desktop table */}
                <div className="hidden md:block">
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
                                <CardBrandBadge
                                  name={inst.cardName}
                                  size={20}
                                />
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
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
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
                </div>
                {/* Mobile cards */}
                <div className="grid gap-3 md:hidden">
                  {overdue.map((inst) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dueDate = new Date(inst.dueDate);
                    const diffDays = Math.ceil(
                      (today.getTime() - dueDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return (
                      <div
                        key={inst.id}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {inst.debtDescription}
                          </p>
                          <span className="font-semibold text-destructive text-sm">
                            {formatCurrency(inst.amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CardBrandBadge name={inst.cardName} size={16} />
                            <span>{inst.cardName}</span>
                          </div>
                          <span>•</span>
                          <span>{inst.personName}</span>
                          <span>•</span>
                          <span>
                            {inst.installmentNumber}/{inst.totalInstallments}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {format(inst.dueDate, 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {diffDays === 1
                              ? '1 dia atrás'
                              : `${diffDays} dias atrás`}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block">
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
                                  <CardBrandBadge
                                    name={inst.cardName}
                                    size={20}
                                  />
                                  <span className="text-sm">
                                    {inst.cardName}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{inst.personName}</TableCell>
                              <TableCell>
                                {inst.installmentNumber}/
                                {inst.totalInstallments}
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
                  </div>
                  {/* Mobile cards */}
                  <div className="grid gap-3 md:hidden">
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
                        <div
                          key={inst.id}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {inst.debtDescription}
                            </p>
                            <span className="font-semibold text-sm">
                              {formatCurrency(inst.amount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CardBrandBadge name={inst.cardName} size={16} />
                              <span>{inst.cardName}</span>
                            </div>
                            <span>•</span>
                            <span>{inst.personName}</span>
                            <span>•</span>
                            <span>
                              {inst.installmentNumber}/{inst.totalInstallments}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">
                              {format(inst.dueDate, 'dd/MM/yyyy', {
                                locale: ptBR,
                              })}
                            </span>
                            {isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                {diffDays === 0
                                  ? 'Hoje'
                                  : diffDays === 1
                                    ? 'Amanhã'
                                    : `${diffDays} dias`}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
