import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthSession } from '@/lib/auth-session';
import { CreditCard, Users, Wallet } from 'lucide-react';
import Link from 'next/link';

const HomePage = async () => {
  const session = await getAuthSession();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-6xl mx-auto grid gap-6">
          <h1 className="text-3xl font-bold">
            Bem-vindo, {session.user.name}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie seus cartões de crédito, pessoas/empresas e dívidas de
            forma eficiente.
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Cartões de Crédito</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 justify-between">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Cadastre e gerencie seus cartões de crédito.
                </p>
                <Button asChild>
                  <Link href="/cards">Gerenciar Cartões</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Pessoas/Empresas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 justify-between">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Cadastre pessoas ou empresas para associar às suas dívidas.
                </p>
                <Button asChild>
                  <Link href="/names">Gerenciar Nomes</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-3">
                  <Wallet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Dívidas/Despesas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 justify-between">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Registre e acompanhe todas as suas dívidas.
                </p>
                <Button asChild>
                  <Link href="/debts">Gerenciar Dívidas</Link>
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
