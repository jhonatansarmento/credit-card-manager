import CreditCardForm from '@/components/credit-card-form';
import Navbar from '@/components/navbar';
import { getAuthSession } from '@/lib/auth-session';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

interface EditCreditCardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCreditCardPage({
  params,
}: EditCreditCardPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const userId = session.user.id;

  const card = await prisma.creditCard.findUnique({
    where: {
      id,
      userId: userId, // Garante que o usuário é o proprietário do cartão
    },
  });

  if (!card) {
    notFound();
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950'>
      <Navbar />
      <main className='flex-1 p-4 md:p-6 flex items-center justify-center'>
        <CreditCardForm card={card} />
      </main>
    </div>
  );
}
