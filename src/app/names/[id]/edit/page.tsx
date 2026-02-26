import Navbar from '@/components/navbar';
import PersonCompanyForm from '@/components/person-company-form';
import { getAuthSession } from '@/lib/auth-session';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

interface EditPersonCompanyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPersonCompanyPage({
  params,
}: EditPersonCompanyPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const userId = session.user.id;

  const personCompany = await prisma.personCompany.findUnique({
    where: {
      id,
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
