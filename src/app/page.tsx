import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@clerk/nextjs/server';
import { CreditCard, Link, Users, Wallet } from 'lucide-react';
import { redirect } from 'next/navigation';

const HomePage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950'>
      <Navbar />
      <main className='flex-1 p-4 md:p-6'>
        <div className='max-w-6xl mx-auto grid gap-6'>
          <h1 className='text-3xl font-bold'>
            Bem-vindo ao seu Controle de Dívidas!
          </h1>
          <p className='text-gray-500 dark:text-gray-400'>
            Gerencie seus cartões de crédito, pessoas/empresas e dívidas de
            forma eficiente.
          </p>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CreditCard className='h-5 w-5' /> Cartões de Crédito
                </CardTitle>
              </CardHeader>
              <p className='text-gray-500 dark:text-gray-400 mb-4'>
                Cadastre e gerencie seus cartões de crédito.
              </p>
              <Button asChild>
                <Link href='/cards'>Gerenciar Cartões</Link>
              </Button>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' /> Pessoas/Empresas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-500 dark:text-gray-400 mb-4'>
                  Cadastre pessoas ou empresas para associar às suas dívidas.
                </p>
                <Button asChild>
                  <Link href='/names'>Gerenciar Nomes</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Wallet className='h-5 w-5' /> Dívidas/Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-500 dark:text-gray-400 mb-4'>
                  Registre e acompanhe todas as suas dívidas.
                </p>
                <Button asChild>
                  <Link href='/debts'>Gerenciar Dívidas</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
