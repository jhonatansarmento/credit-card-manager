import { CashFlowChart } from '@/components/cash-flow-chart';
import { Badge } from '@/components/ui/badge';
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
import { getMonthlyCashFlow } from '@/services/income.service';
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export default async function CashFlowPage() {
  const session = await getAuthSession();
  const userId = session.user.id;

  const cashFlow = await getMonthlyCashFlow(userId, 6, 6);

  // Current month stats
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonth = cashFlow.find((m) => m.month === currentKey);

  const totalIncome = currentMonth?.income ?? 0;
  const totalExpense = currentMonth?.expense ?? 0;
  const monthBalance = totalIncome - totalExpense;

  // Cumulative balance
  let cumulative = 0;
  const dataWithCumulative = cashFlow.map((m) => {
    cumulative += m.balance;
    return { ...m, cumulative };
  });
  const currentCumulative =
    dataWithCumulative.find((m) => m.month === currentKey)?.cumulative ?? 0;

  return (
    <div className="max-w-7xl mx-auto grid gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita do Mês
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">proventos recebidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Despesa do Mês
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              parcelas e pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                monthBalance >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-destructive'
              }`}
            >
              {formatCurrency(monthBalance)}
            </div>
            <p className="text-xs text-muted-foreground">receita - despesa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Acumulado
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                currentCumulative >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-destructive'
              }`}
            >
              {formatCurrency(currentCumulative)}
            </div>
            <p className="text-xs text-muted-foreground">
              desde o início do período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Fluxo de Caixa
          </CardTitle>
          <CardDescription>
            Comparativo de receitas e despesas mensais (6 meses passados + 6
            futuros)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cashFlow.length > 0 ? (
            <CashFlowChart data={cashFlow} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Sem dados para exibir. Cadastre proventos e dívidas para ver o
              fluxo de caixa.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Mensal</CardTitle>
          <CardDescription>Receita, despesa e saldo por mês</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Despesa</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Acumulado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataWithCumulative.map((row) => {
                const [year, month] = row.month.split('-');
                const label = `${month}/${year}`;

                return (
                  <TableRow
                    key={row.month}
                    className={
                      row.month === currentKey
                        ? 'bg-accent/50'
                        : row.isFuture
                          ? 'opacity-60'
                          : ''
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {label}
                        {row.month === currentKey && (
                          <Badge variant="outline" className="text-xs">
                            Atual
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-green-600 dark:text-green-400">
                      {formatCurrency(row.income)}
                    </TableCell>
                    <TableCell className="text-destructive">
                      {formatCurrency(row.expense)}
                    </TableCell>
                    <TableCell
                      className={
                        row.balance >= 0
                          ? 'text-green-600 dark:text-green-400 font-medium'
                          : 'text-destructive font-medium'
                      }
                    >
                      {row.balance >= 0 ? '+' : ''}
                      {formatCurrency(row.balance)}
                    </TableCell>
                    <TableCell
                      className={
                        row.cumulative >= 0
                          ? 'text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-destructive font-medium'
                      }
                    >
                      {formatCurrency(row.cumulative)}
                    </TableCell>
                    <TableCell>
                      {row.isFuture && (
                        <Badge
                          variant="secondary"
                          className="text-xs opacity-70"
                        >
                          Projeção
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
