import CreditCardForm from '@/components/credit-card-form';
import Navbar from '@/components/navbar';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

// TODO: Substituir por autenticação real
const getUserId = () => 'temp-user-id';

interface EditCreditCardPageProps {
  params: {
    id: string;
  };
}

export default async function EditCreditCardPage({
  params,
}: EditCreditCardPageProps) {
  const userId = getUserId();

  const card = await prisma.creditCard.findUnique({
    where: {
      id: params.id,
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
