import DebtForm from '@/components/debt-form';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth-session';
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function NewDebtPage() {
  const session = await getAuthSession();
  const userId = session.user.id;

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
            <CardTitle className='text-xl'>
              Pré-requisitos para cadastrar dívidas
            </CardTitle>
            <CardContent className='mt-4'>
              <p className='mb-2'>
                Você precisa ter pelo menos um cartão de crédito e uma
                pessoa/empresa cadastrados para registrar uma dívida.
              </p>
              <div className='flex flex-col gap-2 mt-4'>
                <Button asChild>
                  <Link href='/cards/new'>Cadastrar Novo Cartão</Link>
                </Button>
                <Button asChild variant='outline'>
                  <Link href='/names/new'>Cadastrar Nova Pessoa/Empresa</Link>
                </Button>
              </div>
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
        <DebtForm creditCards={creditCards} personCompanies={personCompanies} />
      </main>
    </div>
  );
}
