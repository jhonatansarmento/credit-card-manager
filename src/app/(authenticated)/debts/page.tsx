import {
  BatchActionsBar,
  BatchCheckbox,
  BatchProvider,
} from '@/components/batch-actions';
import CardBrandBadge from '@/components/card-brand-badge';
import DebtActionsMenu from '@/components/debt-actions-menu';
import DebtFilters from '@/components/debt-filters';
import { InstallmentCollapse } from '@/components/installment-collapse';
import Pagination from '@/components/pagination';
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
import { listAssets } from '@/services/asset.service';
import { listCreditCards } from '@/services/credit-card.service';
import { listDebts } from '@/services/debt.service';
import { listNames } from '@/services/name.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Archive, PlusCircle, RefreshCw, SearchX, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

interface DebtsPageProps {
  searchParams: Promise<{
    cardId?: string;
    personCompanyId?: string;
    assetId?: string;
    month?: string;
    year?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    showArchived?: string;
  }>;
}

export default async function DebtsPage({ searchParams }: DebtsPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getAuthSession();
  const userId = session.user.id;

  const {
    cardId,
    personCompanyId,
    assetId,
    month,
    year,
    search,
    sortBy,
    sortOrder,
    page: pageStr,
    showArchived: showArchivedStr,
  } = resolvedSearchParams;

  const page = pageStr ? parseInt(pageStr) : 1;
  const showArchived = showArchivedStr === 'true';

  const [creditCards, personCompanies, assets, result] = await Promise.all([
    listCreditCards(userId),
    listNames(userId),
    listAssets(userId),
    listDebts(userId, {
      cardId,
      personCompanyId,
      assetId,
      month,
      year,
      search,
      sortBy,
      sortOrder,
      page,
      showArchived,
    }),
  ]);

  const debts = result.data;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const hasFilters = !!(
    cardId ||
    personCompanyId ||
    assetId ||
    month ||
    year ||
    search ||
    showArchived
  );

  // Calcula o total das parcelas exibidas (considerando o filtro de mês/ano)
  const totalAmountDisplayed = debts.reduce((sum, debt) => {
    const installmentsForDisplay = debt.installments.filter((inst) => {
      if (month || year) {
        const monthMatch = month
          ? inst.dueDate.getMonth() === Number.parseInt(month) - 1
          : true;
        const yearMatch = year
          ? inst.dueDate.getFullYear() === Number.parseInt(year)
          : true;
        return monthMatch && yearMatch;
      }
      return true;
    });
    return (
      sum +
      installmentsForDisplay.reduce(
        (installmentSum, inst) => installmentSum + Number(inst.amount),
        0,
      )
    );
  }, 0);

  return (
    <div className="max-w-6xl mx-auto grid gap-6">
      <Suspense fallback={<div>Carregando filtros...</div>}>
        <DebtFilters
          creditCards={creditCards}
          personCompanies={personCompanies}
          assets={assets}
          initialCardId={cardId}
          initialPersonCompanyId={personCompanyId}
          initialAssetId={assetId}
          initialMonth={month}
          initialYear={year}
          initialSearch={search}
          initialSortBy={sortBy}
          initialSortOrder={sortOrder}
          initialShowArchived={showArchived}
        />
      </Suspense>

      {debts.length === 0 ? (
        hasFilters ? (
          <Card className="p-10 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <SearchX className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Nenhum resultado</CardTitle>
                <CardDescription className="mt-2">
                  Nenhuma dívida encontrada com os filtros selecionados. Tente
                  ajustar os filtros.
                </CardDescription>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-10 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Nenhuma dívida cadastrada
                </CardTitle>
                <CardDescription className="mt-2">
                  Comece registrando sua primeira dívida para acompanhar suas
                  parcelas.
                </CardDescription>
              </div>
              <Button asChild className="mt-2">
                <Link href="/debts/new">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Registrar Primeira Dívida
                </Link>
              </Button>
            </div>
          </Card>
        )
      ) : (
        <BatchProvider>
          <>
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <CardTitle className="text-2xl">
                  Total:{' '}
                  <span className="font-bold text-primary">
                    {formatCurrency(totalAmountDisplayed)}
                  </span>
                </CardTitle>
                <div className="flex gap-3 text-sm text-muted-foreground sm:ml-auto">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Pago:{' '}
                    {formatCurrency(
                      debts.reduce(
                        (sum, d) =>
                          sum +
                          d.installments
                            .filter((i) => i.isPaid)
                            .reduce((s, i) => s + Number(i.amount), 0),
                        0,
                      ),
                    )}
                  </span>
                  <span className="text-destructive font-medium">
                    Pendente:{' '}
                    {formatCurrency(
                      debts.reduce(
                        (sum, d) =>
                          sum +
                          d.installments
                            .filter((i) => !i.isPaid)
                            .reduce((s, i) => s + Number(i.amount), 0),
                        0,
                      ),
                    )}
                  </span>
                </div>
              </div>
            </Card>

            {debts.map((debt) => {
              const paidCount = debt.installments.filter(
                (inst) => inst.isPaid,
              ).length;
              const totalCount = debt.installments.length;
              const progressPercent =
                totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
              const allPaid = paidCount === totalCount && totalCount > 0;

              return (
                <Card
                  key={debt.id}
                  className={`mb-4 ${debt.isArchived ? 'opacity-60' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <BatchCheckbox debtId={debt.id} />
                        <Link
                          href={`/debts/${debt.id}`}
                          className="hover:underline min-w-0"
                        >
                          <CardTitle className="text-lg font-medium truncate">
                            {debt.description}
                          </CardTitle>
                        </Link>
                      </div>
                      <DebtActionsMenu
                        debtId={debt.id}
                        isArchived={debt.isArchived}
                        allPaid={allPaid}
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {debt.creditCard ? (
                        <div className="flex items-center gap-1.5">
                          <CardBrandBadge
                            name={debt.creditCard.name}
                            size={22}
                          />
                          <span className="text-sm text-muted-foreground">
                            {debt.creditCard.name}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {PAYMENT_METHOD_LABELS[
                            debt.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                          ] || debt.paymentMethod}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {debt.participants.length > 0
                          ? debt.participants
                              .map((p) => p.personCompany.name)
                              .join(', ')
                          : (debt.personCompany?.name ?? '-')}
                      </Badge>
                      {debt.isArchived && (
                        <Badge variant="secondary" className="text-xs">
                          <Archive className="h-3 w-3 mr-1" />
                          Arquivada
                        </Badge>
                      )}
                      {debt.isRecurring && (
                        <Badge
                          variant="outline"
                          className="text-xs border-purple-500 text-purple-600 dark:text-purple-400"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Recorrente
                        </Badge>
                      )}
                      {debt.category && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: debt.category.color }}
                        >
                          {debt.category.emoji} {debt.category.name}
                        </Badge>
                      )}
                      {debt.asset && (
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-500 text-blue-600 dark:text-blue-400"
                        >
                          {debt.asset.emoji} {debt.asset.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Valor Total: {formatCurrency(Number(debt.totalAmount))} |{' '}
                      {debt.installmentsQuantity} Parcelas de{' '}
                      {formatCurrency(Number(debt.installmentValue))}
                    </p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 mb-4">
                      <Progress
                        value={progressPercent}
                        className="flex-1 h-2"
                      />
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {paidCount}/{totalCount} pagas
                      </span>
                    </div>

                    <h3 className="font-semibold mb-2">Parcelas:</h3>
                    {(() => {
                      const filteredInstallments = debt.installments.filter(
                        (inst) => {
                          if (month || year) {
                            const monthMatch = month
                              ? inst.dueDate.getMonth() ===
                                Number.parseInt(month) - 1
                              : true;
                            const yearMatch = year
                              ? inst.dueDate.getFullYear() ===
                                Number.parseInt(year)
                              : true;
                            return monthMatch && yearMatch;
                          }
                          return true;
                        },
                      );

                      // Separate overdue, unpaid and paid installments
                      const overdue = filteredInstallments.filter(
                        (i) => !i.isPaid && i.dueDate < new Date(),
                      );
                      const upcoming = filteredInstallments.filter(
                        (i) => !i.isPaid && i.dueDate >= new Date(),
                      );
                      const paid = filteredInstallments.filter((i) => i.isPaid);
                      // Show overdue first, then upcoming, then paid at the end
                      const sortedInstallments = [
                        ...overdue,
                        ...upcoming,
                        ...paid,
                      ];

                      const installmentCards = sortedInstallments.map(
                        (installment) => {
                          const isCurrentMonth =
                            installment.dueDate.getMonth() === currentMonth &&
                            installment.dueDate.getFullYear() === currentYear;
                          const isOverdue =
                            !installment.isPaid &&
                            installment.dueDate < new Date();

                          return (
                            <Card
                              key={installment.id}
                              className={`p-3 flex flex-col justify-between ${
                                installment.isPaid
                                  ? 'bg-green-50 dark:bg-green-950/20'
                                  : ''
                              } ${
                                isCurrentMonth
                                  ? 'border-primary ring-2 ring-primary/50'
                                  : ''
                              } ${
                                isOverdue
                                  ? 'border-red-500 ring-2 ring-red-500/50'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">
                                  Parcela {installment.installmentNumber}
                                </p>
                                <ToggleInstallmentButton
                                  installmentId={installment.id}
                                  isPaid={installment.isPaid}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Vencimento:{' '}
                                {format(installment.dueDate, 'dd/MM/yyyy', {
                                  locale: ptBR,
                                })}
                              </p>
                              <p
                                className={`text-lg font-bold ${
                                  installment.isPaid
                                    ? 'text-green-600 dark:text-green-400'
                                    : isOverdue
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-muted-foreground'
                                }`}
                              >
                                {formatCurrency(Number(installment.amount))}
                              </p>
                              <div className="mt-2 flex gap-1">
                                {isCurrentMonth && <Badge>Mês Atual</Badge>}
                                {isOverdue && (
                                  <Badge variant="destructive">Vencida</Badge>
                                )}
                                {installment.isPaid && (
                                  <Badge
                                    variant="outline"
                                    className="border-green-500 text-green-600 dark:text-green-400"
                                  >
                                    Paga
                                  </Badge>
                                )}
                              </div>
                            </Card>
                          );
                        },
                      );

                      return (
                        <InstallmentCollapse
                          totalCount={sortedInstallments.length}
                          paidCount={paid.length}
                        >
                          {installmentCards}
                        </InstallmentCollapse>
                      );
                    })()}
                  </CardContent>
                </Card>
              );
            })}

            <Suspense fallback={null}>
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                basePath="/debts"
              />
            </Suspense>

            <BatchActionsBar />
          </>
        </BatchProvider>
      )}
    </div>
  );
}
