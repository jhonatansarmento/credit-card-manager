import DebtForm from '@/components/debt-form';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth-session';
import { listCreditCards } from '@/services/credit-card.service';
import {
  listCategories,
  seedDefaultCategories,
} from '@/services/category.service';
import { listNames } from '@/services/name.service';
import Link from 'next/link';

export default async function NewDebtPage() {
  const session = await getAuthSession();
  const userId = session.user.id;

  const [creditCards, personCompanies, categories] = await Promise.all([
    listCreditCards(userId),
    listNames(userId),
    listCategories(userId).then(async (cats) => {
      if (cats.length === 0) {
        await seedDefaultCategories(userId);
        return listCategories(userId);
      }
      return cats;
    }),
  ]);

  if (creditCards.length === 0 || personCompanies.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <Card className="p-6">
          <CardTitle className="text-xl">
            Pré-requisitos para cadastrar dívidas
          </CardTitle>
          <CardContent className="mt-4">
            <p className="mb-2">
              Você precisa ter pelo menos um cartão de crédito e uma
              pessoa/empresa cadastrados para registrar uma dívida.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <Button asChild>
                <Link href="/cards/new">Cadastrar Novo Cartão</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/names/new">Cadastrar Nova Pessoa/Empresa</Link>
              </Button>
            </div>
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
          { label: 'Nova Dívida' },
        ]}
      />
      <div className="flex-1 flex items-center justify-center">
        <DebtForm
          creditCards={creditCards}
          personCompanies={personCompanies}
          categories={categories}
        />
      </div>
    </div>
  );
}
