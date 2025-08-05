import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Pencil, PlusCircle } from 'lucide-react';
import Link from 'next/link';

import DeleteButton from '@/components/delete-button';
import { deletePersonCompany } from './actions';

export default async function PersonCompaniesPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className='flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950'>
        <Navbar />
        <main className='flex-1 p-4 md:p-6 flex items-center justify-center'>
          <p className='text-lg text-gray-500 dark:text-gray-400'>
            Por favor, faça login para gerenciar seus nomes.
          </p>
        </main>
      </div>
    );
  }

  const personCompanies = await prisma.personCompany.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });

  return (
    <div className='flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950'>
      <Navbar />
      <main className='flex-1 p-4 md:p-6'>
        <div className='max-w-6xl mx-auto grid gap-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-bold'>Pessoas e Empresas</h1>
            <Button asChild>
              <Link href='/names/new'>
                <PlusCircle className='h-4 w-4 mr-2' />
                Novo Nome
              </Link>
            </Button>
          </div>

          {personCompanies.length === 0 ? (
            <Card className='p-6 text-center'>
              <CardTitle className='text-xl'>Nenhum nome cadastrado</CardTitle>
              <CardDescription className='mt-2'>
                Comece adicionando pessoas ou empresas para associar às suas
                dívidas.
              </CardDescription>
            </Card>
          ) : (
            <Card>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className='text-right'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personCompanies.map((pc) => (
                      <TableRow key={pc.id}>
                        <TableCell className='font-medium'>{pc.name}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button variant='outline' size='icon' asChild>
                              <Link href={`/names/${pc.id}/edit`}>
                                <Pencil className='h-4 w-4' />
                                <span className='sr-only'>Editar</span>
                              </Link>
                            </Button>
                            <DeleteButton
                              itemId={pc.id}
                              action={deletePersonCompany}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
