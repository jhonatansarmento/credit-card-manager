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
import { getAssetDetail } from '@/services/asset.service';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CreditCard,
  Package,
  Pencil,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const PAYMENT_METHOD_LABELS: Record<
  string,
  { label: string; icon: typeof CreditCard }
> = {
  CREDIT_CARD: { label: 'Cartão de Crédito', icon: CreditCard },
  BOLETO: { label: 'Boleto', icon: Banknote },
  DEBIT: { label: 'Débito', icon: Wallet },
  PIX: { label: 'Pix', icon: Banknote },
  TRANSFER: { label: 'Transferência', icon: Banknote },
  CASH: { label: 'Dinheiro', icon: Banknote },
};

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({
  params,
}: AssetDetailPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const userId = session.user.id;

  const asset = await getAssetDetail(id, userId);

  if (!asset) {
    notFound();
  }

  // Calculate summary stats
  const totalCost = asset.debts.reduce(
    (sum, debt) => sum + Number(debt.totalAmount),
    0,
  );
  const totalPaid = asset.debts.reduce(
    (sum, debt) =>
      sum +
      debt.installments
        .filter((i) => i.isPaid)
        .reduce((s, i) => s + Number(i.amount), 0),
    0,
  );
  const totalPending = asset.debts.reduce(
    (sum, debt) =>
      sum +
      debt.installments
        .filter((i) => !i.isPaid)
        .reduce((s, i) => s + Number(i.amount), 0),
    0,
  );
  const totalInstallments = asset.debts.reduce(
    (sum, debt) => sum + debt.installments.length,
    0,
  );
  const paidInstallments = asset.debts.reduce(
    (sum, debt) => sum + debt.installments.filter((i) => i.isPaid).length,
    0,
  );
  const overallProgress =
    totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto grid gap-6">
      <PageBreadcrumb
        segments={[
          { label: 'Bens/Ativos', href: '/assets' },
          { label: asset.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{asset.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            {asset.description && (
              <p className="text-muted-foreground">{asset.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/assets/${asset.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/debts/new?assetId=${asset.id}`}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Dívida
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              {asset.debts.length}{' '}
              {asset.debts.length === 1 ? 'dívida' : 'dívidas'} vinculadas
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
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              em parcelas não pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidInstallments}/{totalInstallments} parcelas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progresso Geral
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallProgress.toFixed(1)}%
            </div>
            <Progress value={overallProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Debts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Dívidas Vinculadas
          </CardTitle>
          <CardDescription>
            Todas as dívidas associadas a este bem/ativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {asset.debts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhuma dívida vinculada a este bem.
              </p>
              <Button asChild>
                <Link href={`/debts/new?assetId=${asset.id}`}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Vincular Dívida
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {asset.debts.map((debt) => {
                const debtPaidCount = debt.installments.filter(
                  (i) => i.isPaid,
                ).length;
                const debtTotalCount = debt.installments.length;
                const debtProgress =
                  debtTotalCount > 0
                    ? (debtPaidCount / debtTotalCount) * 100
                    : 0;
                const debtPending = debt.installments
                  .filter((i) => !i.isPaid)
                  .reduce((s, i) => s + Number(i.amount), 0);
                const paymentInfo =
                  PAYMENT_METHOD_LABELS[debt.paymentMethod] ||
                  PAYMENT_METHOD_LABELS.CREDIT_CARD;

                return (
                  <div
                    key={debt.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/debts/${debt.id}`}
                            className="font-medium hover:underline"
                          >
                            {debt.description}
                          </Link>
                          {debt.isRecurring && (
                            <Badge
                              variant="outline"
                              className="text-xs border-purple-500 text-purple-600 dark:text-purple-400"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Recorrente
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                          {debt.creditCard ? (
                            <div className="flex items-center gap-1">
                              <CardBrandBadge
                                name={debt.creditCard.name}
                                size={18}
                              />
                              <span>{debt.creditCard.name}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {paymentInfo.label}
                            </Badge>
                          )}
                          <span>•</span>
                          <span>{debt.personCompany.name}</span>
                          {debt.category && (
                            <>
                              <span>•</span>
                              <span>
                                {debt.category.emoji} {debt.category.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold">
                          {formatCurrency(Number(debt.totalAmount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {debt.installmentsQuantity}x de{' '}
                          {formatCurrency(Number(debt.installmentValue))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Progress value={debtProgress} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {debtPaidCount}/{debtTotalCount} pagas
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-destructive">
                        Pendente: {formatCurrency(debtPending)}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/debts/${debt.id}`}>
                          Ver detalhes
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
