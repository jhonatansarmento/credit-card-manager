import DebtForm from '@/components/debt-form';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth-session';
import { listAssets } from '@/services/asset.service';
import {
  listCategories,
  seedDefaultCategories,
} from '@/services/category.service';
import { listCreditCards } from '@/services/credit-card.service';
import { listNames } from '@/services/name.service';
import Link from 'next/link';

interface NewDebtPageProps {
  searchParams: Promise<{
    assetId?: string;
  }>;
}

export default async function NewDebtPage({ searchParams }: NewDebtPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getAuthSession();
  const userId = session.user.id;

  const [creditCards, personCompanies, categories, assets] = await Promise.all([
    listCreditCards(userId),
    listNames(userId),
    listCategories(userId).then(async (cats) => {
      if (cats.length === 0) {
        await seedDefaultCategories(userId);
        return listCategories(userId);
      }
      return cats;
    }),
    listAssets(userId),
  ]);

  if (personCompanies.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <Card className="p-6">
          <CardTitle className="text-xl">
            Pré-requisitos para cadastrar dívidas
          </CardTitle>
          <CardContent className="mt-4">
            <p className="mb-2">
              Você precisa ter pelo menos uma pessoa/empresa cadastrada para
              registrar uma dívida.
            </p>
            <div className="flex flex-col gap-2 mt-4">
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
          assets={assets}
          initialAssetId={resolvedSearchParams.assetId}
        />
      </div>
    </div>
  );
}
