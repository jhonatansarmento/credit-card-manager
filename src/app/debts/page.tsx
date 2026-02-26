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

  // Filtra as dívidas que possuem parcelas no período selecionado (mês/ano ou só ano)
  if (month || year) {
    const parsedYear = year ? Number.parseInt(year) : undefined;
    const parsedMonth = month ? Number.parseInt(month) : undefined;

    let startDate: Date;
    let endDate: Date;

    if (parsedYear && parsedMonth) {
      // Mês + Ano
      startDate = new Date(parsedYear, parsedMonth - 1, 1);
      endDate = new Date(parsedYear, parsedMonth, 0); // último dia do mês
    } else if (parsedYear) {
      // Só Ano
      startDate = new Date(parsedYear, 0, 1);
      endDate = new Date(parsedYear, 11, 31);
    } else {
      // Só Mês (usa ano atual)
      const currentYear = new Date().getFullYear();
      startDate = new Date(currentYear, parsedMonth! - 1, 1);
      endDate = new Date(currentYear, parsedMonth!, 0);
    }

    const debtsWithMatchingInstallments = await prisma.debt.findMany({
      where: {
        userId,
        ...whereClause,
        installments: {
          some: {
            dueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      select: { id: true },
    });
    whereClause.id = {
      in: debtsWithMatchingInstallments.map((d) => d.id),
    };
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
                      {Number(debt.totalAmount).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}{' '}
                      | {debt.installmentsQuantity} Parcelas de{' '}
                      {Number(debt.installmentValue).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>

                    <h3 className="font-semibold mb-2">Parcelas:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {debt.installments
                        .filter((inst) => {
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
                                {Number(installment.amount).toLocaleString(
                                  'pt-BR',
                                  {
                                    style: 'currency',
                                    currency: 'BRL',
                                  },
                                )}
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
