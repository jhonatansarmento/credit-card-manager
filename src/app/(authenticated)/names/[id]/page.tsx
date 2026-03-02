import CardBrandBadge from '@/components/card-brand-badge';
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
import { Progress } from '@/components/ui/progress';
import { getAuthSession } from '@/lib/auth-session';
import { formatCurrency } from '@/lib/format';
import { PAYMENT_METHOD_LABELS } from '@/lib/schemas/debt';
import { getNameDetail } from '@/services/name.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  Archive,
  CalendarDays,
  FileText,
  Pencil,
  RefreshCw,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface NameDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NameDetailPage({ params }: NameDetailPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const userId = session.user.id;

  const result = await getNameDetail(id, userId);
  if (!result) notFound();

  const { person, debts } = result;

  // Aggregate stats across all debts
  const totalDebts = debts.length;
  const totalAmount = debts.reduce((sum, d) => sum + d.participantAmount, 0);

  const allInstallments = debts.flatMap((d) => d.installments);
  const paidInstallments = allInstallments.filter((i) => i.isPaid);
  const pendingInstallments = allInstallments.filter((i) => !i.isPaid);

  const totalPaid = paidInstallments.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  );
  const totalPending = pendingInstallments.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  );

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdueInstallments = pendingInstallments.filter(
    (i) => i.dueDate < now,
  );
  const overdueAmount = overdueInstallments.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  );

  const totalInstCount = allInstallments.length;
  const paidInstCount = paidInstallments.length;
  const progressPercent =
    totalInstCount > 0 ? (paidInstCount / totalInstCount) * 100 : 0;

  // Group debts by active vs archived
  const activeDebts = debts.filter((d) => !d.isArchived);
  const archivedDebts = debts.filter((d) => d.isArchived);

  // Cards breakdown
  const cardMap = new Map<
    string,
    { name: string; total: number; pending: number; count: number }
  >();
  for (const debt of debts) {
    const cardKey = debt.creditCard?.id ?? '__other__';
    const cardName = debt.creditCard?.name ?? 'Outros Métodos';
    const entry = cardMap.get(cardKey) ?? {
      name: cardName,
      total: 0,
      pending: 0,
      count: 0,
    };
    entry.total += debt.participantAmount;
    entry.pending += debt.installments
      .filter((i) => !i.isPaid)
      .reduce((s, i) => s + Number(i.amount), 0);
    entry.count += 1;
    cardMap.set(cardKey, entry);
  }
  const cardBreakdown = Array.from(cardMap.entries())
    .map(([key, v]) => ({ id: key, ...v }))
    .sort((a, b) => b.total - a.total);

  // Category breakdown
  const catMap = new Map<
    string,
    {
      name: string;
      emoji: string;
      color: string;
      total: number;
      count: number;
    }
  >();
  for (const debt of debts) {
    if (!debt.category) continue;
    const entry = catMap.get(debt.category.id) ?? {
      name: debt.category.name,
      emoji: debt.category.emoji,
      color: debt.category.color,
      total: 0,
      count: 0,
    };
    entry.total += debt.participantAmount;
    entry.count += 1;
    catMap.set(debt.category.id, entry);
  }
  const categoryBreakdown = Array.from(catMap.values()).sort(
    (a, b) => b.total - a.total,
  );

  return (
    <div className="max-w-4xl mx-auto grid gap-6">
      <PageBreadcrumb
        segments={[
          { label: 'Pessoas/Empresas', href: '/names' },
          { label: person.name },
        ]}
      />

      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl">{person.name}</CardTitle>
            <CardDescription>
              Cadastrada em{' '}
              {format(person.createdAt, "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/names/${person.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Dívidas</p>
              </div>
              <p className="text-lg font-bold">{totalDebts}</p>
            </Card>
            <Card className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Valor Total</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalAmount)}</p>
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

          {/* Overdue alert */}
          {overdueInstallments.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  {overdueInstallments.length} parcela
                  {overdueInstallments.length > 1 ? 's' : ''} vencida
                  {overdueInstallments.length > 1 ? 's' : ''} —{' '}
                  {formatCurrency(overdueAmount)}
                </p>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="flex-1 h-3" />
            <span className="text-sm font-semibold whitespace-nowrap">
              {paidInstCount}/{totalInstCount} pagas (
              {progressPercent.toFixed(0)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Breakdowns */}
      {(cardBreakdown.length > 1 || categoryBreakdown.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Card */}
          {cardBreakdown.length > 1 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Por Cartão/Método</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cardBreakdown.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {c.id !== '__other__' ? (
                        <CardBrandBadge name={c.name} size={20} />
                      ) : (
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.count} dívida{c.count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(c.total)}
                      </p>
                      {c.pending > 0 && (
                        <p className="text-xs text-destructive">
                          {formatCurrency(c.pending)} pendente
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* By Category */}
          {categoryBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryBreakdown.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        style={{ borderColor: cat.color }}
                      >
                        {cat.emoji} {cat.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({cat.count})
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(cat.total)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Active Debts List */}
      {activeDebts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Dívidas Ativas ({activeDebts.length})
            </CardTitle>
            <CardDescription>
              Todas as dívidas associadas a {person.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeDebts.map((debt) => {
              const debtPaid = debt.installments.filter((i) => i.isPaid).length;
              const debtTotal = debt.installments.length;
              const debtProgress =
                debtTotal > 0 ? (debtPaid / debtTotal) * 100 : 0;
              const debtPending = debt.installments
                .filter((i) => !i.isPaid)
                .reduce((sum, i) => sum + Number(i.amount), 0);
              const debtOverdue = debt.installments.filter(
                (i) => !i.isPaid && i.dueDate < now,
              ).length;

              return (
                <Link
                  key={debt.id}
                  href={`/debts/${debt.id}`}
                  className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">
                          {debt.description}
                        </h3>
                        {debt.isRecurring && (
                          <Badge
                            variant="outline"
                            className="text-xs border-purple-500 text-purple-600 dark:text-purple-400"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Recorrente
                          </Badge>
                        )}
                        {debtOverdue > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {debtOverdue} vencida{debtOverdue > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                        {debt.creditCard ? (
                          <div className="flex items-center gap-1">
                            <CardBrandBadge
                              name={debt.creditCard.name}
                              size={16}
                            />
                            <span>{debt.creditCard.name}</span>
                          </div>
                        ) : (
                          <span>
                            {PAYMENT_METHOD_LABELS[
                              debt.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                            ] || debt.paymentMethod}
                          </span>
                        )}
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          <span>
                            {format(debt.startDate, 'MM/yyyy', {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        {debt.category && (
                          <>
                            <span>•</span>
                            <span>
                              {debt.category.emoji} {debt.category.name}
                            </span>
                          </>
                        )}
                        {debt.asset && (
                          <>
                            <span>•</span>
                            <span>
                              {debt.asset.emoji} {debt.asset.name}
                            </span>
                          </>
                        )}
                        {debt.participants.length > 1 && (
                          <>
                            <span>•</span>
                            <span>
                              {debt.participants.length} participantes
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">
                        {formatCurrency(debt.participantAmount)}
                      </p>
                      {debtPending > 0 && (
                        <p className="text-xs text-destructive">
                          {formatCurrency(debtPending)} pend.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={debtProgress} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {debtPaid}/{debtTotal}
                    </span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Archived Debts */}
      {archivedDebts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Archive className="h-4 w-4 text-muted-foreground" />
              Dívidas Arquivadas ({archivedDebts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {archivedDebts.map((debt) => {
              const debtPaid = debt.installments.filter((i) => i.isPaid).length;
              const debtTotal = debt.installments.length;

              return (
                <Link
                  key={debt.id}
                  href={`/debts/${debt.id}`}
                  className="block rounded-lg border p-3 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{debt.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {debtPaid}/{debtTotal} parcelas pagas
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(debt.participantAmount)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {debts.length === 0 && (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">
                Nenhuma dívida encontrada
              </CardTitle>
              <CardDescription className="mt-1">
                {person.name} ainda não possui dívidas associadas.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/debts/new">Criar Nova Dívida</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
