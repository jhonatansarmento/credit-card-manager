import CreditCardForm from '@/components/credit-card-form';
import { getAuthSession } from '@/lib/auth-session';
import { getCreditCard } from '@/services/credit-card.service';
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

  const card = await getCreditCard(id, userId);

  if (!card) {
    notFound();
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <CreditCardForm card={card} />
    </div>
  );
}
