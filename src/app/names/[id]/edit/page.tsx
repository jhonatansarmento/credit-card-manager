import Navbar from '@/components/navbar';
import PersonCompanyForm from '@/components/person-company-form';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';

interface EditPersonCompanyPageProps {
  params: {
    id: string;
  };
}

export default async function EditPersonCompanyPage({
  params,
}: EditPersonCompanyPageProps) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const personCompany = await prisma.personCompany.findUnique({
    where: {
      id: params.id,
      userId: userId, // Garante que o usuário é o proprietário do registro
    },
  });

  if (!personCompany) {
    notFound();
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950'>
      <Navbar />
      <main className='flex-1 p-4 md:p-6 flex items-center justify-center'>
        <PersonCompanyForm personCompany={personCompany} />
      </main>
    </div>
  );
}
