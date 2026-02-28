import DebtForm from '@/components/debt-form';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth-session';
import { listCategories } from '@/services/category.service';
import { listCreditCards } from '@/services/credit-card.service';
import { getDebt } from '@/services/debt.service';
import { listNames } from '@/services/name.service';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditDebtPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditDebtPage({ params }: EditDebtPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const userId = session.user.id;

  const debt = await getDebt(id, userId);

  if (!debt) {
    notFound();
  }

  // Convert Prisma Decimal fields to plain numbers for client component serialization
  const serializedDebt = {
    ...debt,
    totalAmount: Number(debt.totalAmount),
    installmentValue: Number(debt.installmentValue),
  };

  const [creditCards, personCompanies, categories] = await Promise.all([
    listCreditCards(userId),
    listNames(userId),
    listCategories(userId),
  ]);

  if (creditCards.length === 0 || personCompanies.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <Card className="p-6">
          <CardTitle className="text-xl">Erro ao carregar dívida</CardTitle>
          <CardContent className="mt-4">
            <p className="mb-2">
              Não foi possível carregar os dados necessários (cartões ou
              pessoas/empresas).
            </p>
            <Button asChild>
              <Link href="/debts">Voltar para Dívidas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <PageBreadcrumb
        segments={[
          { label: 'Dívidas', href: '/debts' },
          { label: 'Editar Dívida' },
        ]}
      />
      <div className="flex-1 flex items-center justify-center">
        <DebtForm
          debt={serializedDebt}
          creditCards={creditCards}
          personCompanies={personCompanies}
          categories={categories}
        />
      </div>
    </div>
  );
}
