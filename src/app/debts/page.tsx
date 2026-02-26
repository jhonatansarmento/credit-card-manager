import CardBrandBadge from '@/components/card-brand-badge';
import DebtFilters from '@/components/debt-filters';
import DeleteButton from '@/components/delete-button';
import Navbar from '@/components/navbar';
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
import { getAuthSession } from '@/lib/auth-session';
import prisma from '@/lib/db';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

interface DebtsPageProps {
  searchParams: Promise<{
    cardId?: string;
    personCompanyId?: string;
    month?: string;
    year?: string;
  }>;
}

export default async function DebtsPage({ searchParams }: DebtsPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getAuthSession();
  const userId = session.user.id;

  const { cardId, personCompanyId, month, year } = resolvedSearchParams;

  const creditCards = await prisma.creditCard.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  const personCompanies = await prisma.personCompany.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  const whereClause: any = { userId };

  if (cardId) {
    whereClause.cardId = cardId;
  }
  if (personCompanyId) {
    whereClause.personCompanyId = personCompanyId;
  }

  // Filtra as dívidas que possuem pelo menos uma parcela no mês/ano selecionado
  let debtIdsWithMatchingInstallments: string[] = [];
  if (month && year) {
    const startOfMonth = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      1,
    );
    const endOfMonth = new Date(
      Number.parseInt(year),
      Number.parseInt(month),
      0,
    ); // Último dia do mês

    const debtsWithInstallmentsInMonth = await prisma.debt.findMany({
      where: {
        userId,
        ...whereClause, // Aplica filtros de cartão/pessoa também aqui
        installments: {
          some: {
            dueDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        },
      },
      select: { id: true },
    });
    debtIdsWithMatchingInstallments = debtsWithInstallmentsInMonth.map(
      (d) => d.id,
    );
    whereClause.id = { in: debtIdsWithMatchingInstallments };
  }

  const debts = await prisma.debt.findMany({
    where: whereClause,
    include: {
      creditCard: true,
      personCompany: true,
      installments: {
        orderBy: { installmentNumber: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calcula o total das parcelas exibidas (considerando o filtro de mês/ano)
  const totalAmountDisplayed = debts.reduce((sum, debt) => {
    const installmentsForDisplay = debt.installments.filter((inst) => {
      if (month && year) {
        return (
          inst.dueDate.getMonth() === Number.parseInt(month) - 1 &&
          inst.dueDate.getFullYear() === Number.parseInt(year)
        );
      }
      return true; // Se não houver filtro de mês/ano, inclui todas as parcelas
    });
    return (
      sum +
      installmentsForDisplay.reduce(
        (installmentSum, inst) => installmentSum + inst.amount,
        0,
      )
    );
  }, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-6xl mx-auto grid gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Minhas Dívidas</h1>
            <Button asChild>
              <Link href="/debts/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Dívida
              </Link>
            </Button>
          </div>

          <Suspense fallback={<div>Carregando filtros...</div>}>
            <DebtFilters
              creditCards={creditCards}
              personCompanies={personCompanies}
              initialCardId={cardId}
              initialPersonCompanyId={personCompanyId}
              initialMonth={month}
              initialYear={year}
            />
          </Suspense>

          {debts.length === 0 ? (
            <Card className="p-6 text-center">
              <CardTitle className="text-xl">
                Nenhuma dívida encontrada
              </CardTitle>
              <CardDescription className="mt-2">
                Ajuste seus filtros ou cadastre uma nova dívida.
              </CardDescription>
            </Card>
          ) : (
            <>
              <Card className="p-4">
                <CardTitle className="text-2xl">
                  Total de Dívidas Exibidas:{' '}
                  <span className="font-bold text-primary">
                    {totalAmountDisplayed.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </CardTitle>
              </Card>

              {debts.map((debt) => (
                <Card key={debt.id} className="mb-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      {debt.description}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <CardBrandBadge name={debt.creditCard.name} size={28} />
                        <span className="text-sm font-medium">
                          {debt.creditCard.name}
                        </span>
                      </div>
                      <Badge variant="outline">{debt.personCompany.name}</Badge>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/debts/${debt.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar Dívida</span>
                        </Link>
                      </Button>
                      <DeleteButton endpoint={`/api/debts/${debt.id}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Valor Total:{' '}
                      {debt.totalAmount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}{' '}
                      | {debt.installmentsQuantity} Parcelas de{' '}
                      {debt.installmentValue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>

                    <h3 className="font-semibold mb-2">Parcelas:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {debt.installments
                        .filter((inst) => {
                          // Filtra as parcelas para exibição com base no filtro de mês/ano
                          if (month && year) {
                            return (
                              inst.dueDate.getMonth() ===
                                Number.parseInt(month) - 1 &&
                              inst.dueDate.getFullYear() ===
                                Number.parseInt(year)
                            );
                          }
                          return true;
                        })
                        .map((installment) => {
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
                              <p className="text-lg font-bold">
                                {installment.amount.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </p>
                              <div className="mt-2 flex gap-1">
                                {isCurrentMonth && <Badge>Mês Atual</Badge>}
                                {isOverdue && (
                                  <Badge variant="destructive">Vencida</Badge>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
