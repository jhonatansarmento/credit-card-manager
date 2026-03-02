import CardBrandBadge from '@/components/card-brand-badge';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import ToggleInstallmentButton from '@/components/toggle-installment-button';
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
import { getAuthSession } from '@/lib/auth-session';
import { formatCurrency } from '@/lib/format';
import { PAYMENT_METHOD_LABELS } from '@/lib/schemas/debt';
import { getDebtDetail } from '@/services/debt.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Archive,
  CalendarDays,
  CreditCard,
  Package,
  Pencil,
  RefreshCw,
  Tag,
  User,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface DebtDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DebtDetailPage({ params }: DebtDetailPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const userId = session.user.id;

  const debt = await getDebtDetail(id, userId);
  if (!debt) notFound();

  const paidCount = debt.installments.filter((i) => i.isPaid).length;
  const totalCount = debt.installments.length;
  const progressPercent = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
  const totalPaid = debt.installments
    .filter((i) => i.isPaid)
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const totalPending = debt.installments
    .filter((i) => !i.isPaid)
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Group installments by month
  const groupedByMonth = new Map<string, typeof debt.installments>();
  for (const inst of debt.installments) {
    const key = format(inst.dueDate, 'yyyy-MM');
    const group = groupedByMonth.get(key) || [];
    group.push(inst);
    groupedByMonth.set(key, group);
  }

  const sortedMonths = Array.from(groupedByMonth.keys()).sort();

  return (
    <div className="max-w-4xl mx-auto grid gap-6">
      <PageBreadcrumb
        segments={[
          { label: 'Dívidas', href: '/debts' },
          { label: debt.description },
        ]}
      />

      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-2xl">{debt.description}</CardTitle>
              {debt.isArchived && (
                <Badge variant="secondary">
                  <Archive className="h-3 w-3 mr-1" />
                  Arquivada
                </Badge>
              )}
              {debt.isRecurring && (
                <Badge
                  variant="outline"
                  className="border-purple-500 text-purple-600"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Recorrente
                </Badge>
              )}
            </div>
            <CardDescription>
              Criada em{' '}
              {format(debt.createdAt, "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/debts/${debt.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {debt.creditCard ? (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cartão</p>
                  <div className="flex items-center gap-1.5">
                    <CardBrandBadge name={debt.creditCard.name} size={20} />
                    <span className="text-sm font-medium">
                      {debt.creditCard.name}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pagamento</p>
                  <span className="text-sm font-medium">
                    {PAYMENT_METHOD_LABELS[
                      debt.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                    ] || debt.paymentMethod}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {debt.participants.length > 1
                    ? 'Participantes'
                    : 'Pessoa/Empresa'}
                </p>
                {debt.participants.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {debt.participants.map((p) => (
                      <Badge key={p.id} variant="outline" className="text-xs">
                        {p.personCompany.name} –{' '}
                        {formatCurrency(Number(p.amount))}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm font-medium">
                    {debt.personCompany?.name ?? '-'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <span className="text-sm font-medium">
                  {format(debt.startDate, 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
            {debt.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Categoria</p>
                  <Badge
                    variant="outline"
                    style={{ borderColor: debt.category.color }}
                  >
                    {debt.category.emoji} {debt.category.name}
                  </Badge>
                </div>
              </div>
            )}
            {debt.asset && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Bem/Ativo</p>
                  <Link
                    href={`/assets/${debt.asset.id}`}
                    className="hover:underline"
                  >
                    <Badge
                      variant="outline"
                      className="border-blue-500 text-blue-600 dark:text-blue-400"
                    >
                      {debt.asset.emoji} {debt.asset.name}
                    </Badge>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Valor Total</p>
              <p className="text-lg font-bold">
                {formatCurrency(Number(debt.totalAmount))}
              </p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Valor Parcela</p>
              <p className="text-lg font-bold">
                {formatCurrency(Number(debt.installmentValue))}
              </p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Pago</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Pendente</p>
              <p className="text-lg font-bold text-destructive">
                {formatCurrency(totalPending)}
              </p>
            </Card>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="flex-1 h-3" />
            <span className="text-sm font-semibold whitespace-nowrap">
              {paidCount}/{totalCount} pagas ({progressPercent.toFixed(0)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline by Month */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline de Pagamentos</CardTitle>
          <CardDescription>
            Parcelas agrupadas por mês de vencimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {sortedMonths.map((monthKey) => {
                const installments = groupedByMonth.get(monthKey)!;
                const [y, m] = monthKey.split('-');
                const monthDate = new Date(parseInt(y), parseInt(m) - 1, 1);
                const monthLabel = format(monthDate, "MMMM 'de' yyyy", {
                  locale: ptBR,
                });
                const isCurrentMonth =
                  parseInt(m) - 1 === currentMonth &&
                  parseInt(y) === currentYear;
                const allPaidInMonth = installments.every((i) => i.isPaid);
                const monthTotal = installments.reduce(
                  (sum, i) => sum + Number(i.amount),
                  0,
                );

                return (
                  <div key={monthKey} className="relative pl-10">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 ${
                        allPaidInMonth
                          ? 'bg-green-500 border-green-500'
                          : isCurrentMonth
                            ? 'bg-primary border-primary'
                            : 'bg-background border-muted-foreground'
                      }`}
                    />

                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold capitalize">
                          {monthLabel}
                        </h3>
                        {isCurrentMonth && (
                          <Badge variant="default">Mês Atual</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(monthTotal)}
                      </span>
                    </div>

                    <div className="grid gap-2">
                      {installments.map((inst) => {
                        const isOverdue =
                          !inst.isPaid && inst.dueDate < new Date();

                        return (
                          <div
                            key={inst.id}
                            className={`flex items-center justify-between rounded-lg border p-3 ${
                              inst.isPaid
                                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                                : isOverdue
                                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                  : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <ToggleInstallmentButton
                                installmentId={inst.id}
                                isPaid={inst.isPaid}
                              />
                              <div>
                                <p className="text-sm font-medium">
                                  Parcela {inst.installmentNumber}/{totalCount}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Vencimento:{' '}
                                  {format(inst.dueDate, 'dd/MM/yyyy', {
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span
                                  className={`font-semibold ${
                                    inst.isPaid
                                      ? 'text-green-600 dark:text-green-400'
                                      : isOverdue
                                        ? 'text-red-600 dark:text-red-400'
                                        : ''
                                  }`}
                                >
                                  {formatCurrency(Number(inst.amount))}
                                </span>
                                {debt.participants.length > 1 && (
                                  <div className="flex flex-col gap-0.5 mt-1">
                                    {debt.participants.map((p) => {
                                      const proportion =
                                        Number(debt.totalAmount) > 0
                                          ? Number(p.amount) /
                                            Number(debt.totalAmount)
                                          : 0;
                                      const participantInstAmount =
                                        proportion * Number(inst.amount);
                                      return (
                                        <span
                                          key={p.id}
                                          className="text-xs text-muted-foreground"
                                        >
                                          {p.personCompany.name}:{' '}
                                          {formatCurrency(
                                            participantInstAmount,
                                          )}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              {inst.isPaid && (
                                <Badge
                                  variant="outline"
                                  className="border-green-500 text-green-600 dark:text-green-400"
                                >
                                  Paga
                                </Badge>
                              )}
                              {isOverdue && (
                                <Badge variant="destructive">Vencida</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
