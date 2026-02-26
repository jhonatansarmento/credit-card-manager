import DebtForm from '@/components/debt-form';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth-session';
import prisma from '@/lib/db';
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

  const debt = await prisma.debt.findUnique({
    where: {
      id,
      userId: userId, // Garante que o usuário é o proprietário da dívida
    },
  });

  if (!debt) {
    notFound();
  }

  const creditCards = await prisma.creditCard.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  const personCompanies = await prisma.personCompany.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  if (creditCards.length === 0 || personCompanies.length === 0) {
    return (
      <div className='flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950'>
        <Navbar />
        <main className='flex-1 p-4 md:p-6 flex items-center justify-center text-center'>
          <Card className='p-6'>
            <CardTitle className='text-xl'>Erro ao carregar dívida</CardTitle>
            <CardContent className='mt-4'>
              <p className='mb-2'>
                Não foi possível carregar os dados necessários (cartões ou
                pessoas/empresas).
              </p>
              <Button asChild>
                <Link href='/debts'>Voltar para Dívidas</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950'>
      <Navbar />
      <main className='flex-1 p-4 md:p-6 flex items-center justify-center'>
        <DebtForm
          debt={debt}
          creditCards={creditCards}
          personCompanies={personCompanies}
        />
      </main>
    </div>
  );
}
